import {
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { requireAuth } from "@/lib/auth";
import {
  getR2Bucket,
  getR2PublicBaseUrl,
  getR2S3Client,
} from "@/lib/storage/r2-client";
import {
  checkRateLimit,
  CV_UPLOAD_RATE_LIMIT,
  rateLimit,
  rateLimit429,
  releaseUserUploadSlot,
  tryAcquireUserUploadSlot,
} from "@/lib/rate-limit";
import { normalizeUploadIdempotencyKey } from "@/lib/utils/idempotency-key";
import { hasPdfMagicBytes } from "@/lib/utils/pdf";
import { existingObjectMatchesUpload } from "@/lib/utils/upload-idempotency";
import { NextRequest, NextResponse } from "next/server";

const PDF_CONTENT_TYPE = "application/pdf";
const MAX_CV_BYTES = 3 * 1024 * 1024;

function s3HttpStatus(err: unknown): number | undefined {
  return (err as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
}

function isHeadNotFound(err: unknown): boolean {
  const e = err as { name?: string };
  return (
    e.name === "NotFound" ||
    e.name === "NoSuchKey" ||
    s3HttpStatus(err) === 404
  );
}

/** Conditional put lost the race — object already exists (IfNoneMatch: "*"). */
function isPutPreconditionFailed(err: unknown): boolean {
  const e = err as { name?: string };
  return e.name === "PreconditionFailed" || s3HttpStatus(err) === 412;
}

/**
 * Transient conflict while another conditional write is in flight.
 * Retry once; the winner will then cause 412 on the next attempt.
 */
function isConditionalRequestConflict(err: unknown): boolean {
  const e = err as { name?: string };
  return e.name === "ConditionalRequestConflict" || s3HttpStatus(err) === 409;
}

function idempotencyKeyConflictResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        "Idempotency-Key was already used with a different file. Use a new key.",
    },
    { status: 409 },
  );
}

export async function POST(request: NextRequest) {
  const ipRate = checkRateLimit(request, CV_UPLOAD_RATE_LIMIT);
  if (!ipRate.success) return rateLimit429(ipRate);

  try {
    getR2PublicBaseUrl();
    getR2Bucket();
    getR2S3Client();
  } catch (e) {
    console.error("R2 configuration error:", e);
    return NextResponse.json(
      { error: "File upload is not configured" },
      { status: 500 },
    );
  }

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRate = rateLimit(CV_UPLOAD_RATE_LIMIT, `cv-upload:${user.id}`);
  if (!userRate.success) return rateLimit429(userRate);

  if (!tryAcquireUserUploadSlot(user.id)) {
    return NextResponse.json(
      { error: "Too many concurrent uploads. Please try again." },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== PDF_CONTENT_TYPE) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_CV_BYTES) {
      return NextResponse.json(
        { error: "File size must be less than 3MB" },
        { status: 400 },
      );
    }

    const rawKey =
      request.headers.get("Idempotency-Key") ??
      request.headers.get("idempotency-key") ??
      (formData.get("idempotency_key") as string | null);

    const idem = normalizeUploadIdempotencyKey(rawKey);
    if (!idem.ok) {
      return NextResponse.json({ error: idem.error }, { status: 400 });
    }

    const objectKey = `cvs/${user.id}/idempotency/${idem.key}.pdf`;
    const publicBase = getR2PublicBaseUrl();
    const url = `${publicBase}/${objectKey}`;
    const client = getR2S3Client();
    const bucket = getR2Bucket();

    try {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
      );
      if (!existingObjectMatchesUpload(head, file)) {
        return idempotencyKeyConflictResponse();
      }
      return NextResponse.json({ url, idempotent: true });
    } catch (headErr) {
      if (!isHeadNotFound(headErr)) {
        console.error("HeadObject before CV upload:", headErr);
        return NextResponse.json(
          { error: "Failed to verify upload state" },
          { status: 500 },
        );
      }
    }

    const body = Buffer.from(await file.arrayBuffer());
    if (!hasPdfMagicBytes(body)) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    const putInput = {
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: PDF_CONTENT_TYPE,
      IfNoneMatch: "*",
    };

    const respondIdempotentAfterRace = async (): Promise<NextResponse> => {
      try {
        const head = await client.send(
          new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
        );
        if (!existingObjectMatchesUpload(head, file)) {
          return idempotencyKeyConflictResponse();
        }
      } catch (verifyErr) {
        console.error("HeadObject after conditional put race:", verifyErr);
        return NextResponse.json(
          { error: "Failed to verify upload state" },
          { status: 500 },
        );
      }
      return NextResponse.json({ url, idempotent: true });
    };

    try {
      await client.send(new PutObjectCommand(putInput));
    } catch (putErr) {
      if (isPutPreconditionFailed(putErr)) {
        return respondIdempotentAfterRace();
      }
      if (isConditionalRequestConflict(putErr)) {
        try {
          await client.send(new PutObjectCommand(putInput));
        } catch (retryErr) {
          if (isPutPreconditionFailed(retryErr)) {
            return respondIdempotentAfterRace();
          }
          throw retryErr;
        }
      } else {
        throw putErr;
      }
    }

    return NextResponse.json({ url, idempotent: false });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  } finally {
    releaseUserUploadSlot(user.id);
  }
}
