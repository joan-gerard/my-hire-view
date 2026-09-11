import {
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { handleApiError } from "@/lib/api/handle-api-error";
import { withAuth } from "@/lib/api/with-auth";
import {
  getR2Bucket,
  getR2PublicBaseUrl,
  getR2S3Client,
} from "@/lib/storage/r2-client";
import {
  checkRateLimit,
  CV_UPLOAD_RATE_LIMIT,
  rateLimitAsync,
  rateLimit429,
  releaseUserUploadSlot,
  tryAcquireUserUploadSlot,
} from "@/lib/rate-limit";
import { normalizeUploadIdempotencyKey } from "@/lib/utils/idempotency-key";
import { hasPdfMagicBytes } from "@/lib/utils/pdf";
import {
  CV_CONTENT_SHA256_METADATA_KEY,
  existingObjectMatchesUpload,
  sha256Hex,
} from "@/lib/utils/upload-idempotency";
import { NextRequest, NextResponse } from "next/server";

const PDF_CONTENT_TYPE = "application/pdf";
const MAX_CV_BYTES = 3 * 1024 * 1024;

function s3HttpStatus(err: unknown): number | undefined {
  if (err == null || typeof err !== "object") return undefined;
  return (err as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
}

function s3ErrorName(err: unknown): string | undefined {
  if (err == null || typeof err !== "object") return undefined;
  return (err as { name?: string }).name;
}

/** Server-only log fields for unexpected CV upload failures. */
function cvUploadErrorMeta(
  userId: string,
  size?: number,
  err?: unknown,
): Record<string, unknown> {
  const storageStatus = err != null ? s3HttpStatus(err) : undefined;
  return {
    userId,
    ...(size !== undefined ? { size } : {}),
    ...(storageStatus !== undefined ? { storageStatus } : {}),
  };
}

function isHeadNotFound(err: unknown): boolean {
  const name = s3ErrorName(err);
  return (
    name === "NotFound" ||
    name === "NoSuchKey" ||
    s3HttpStatus(err) === 404
  );
}

/** Conditional put lost the race — object already exists (IfNoneMatch: "*"). */
function isPutPreconditionFailed(err: unknown): boolean {
  return s3ErrorName(err) === "PreconditionFailed" || s3HttpStatus(err) === 412;
}

/**
 * Transient conflict while another conditional write is in flight.
 * Retry once; the winner will then cause 412 on the next attempt.
 */
function isConditionalRequestConflict(err: unknown): boolean {
  return (
    s3ErrorName(err) === "ConditionalRequestConflict" ||
    s3HttpStatus(err) === 409
  );
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
  const ipRate = await checkRateLimit(request, CV_UPLOAD_RATE_LIMIT);
  if (!ipRate.success) return rateLimit429(ipRate);

  // Auth before R2 config so missing env never surfaces as 500 to strangers (F7-035).
  const auth = await withAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    getR2PublicBaseUrl();
    getR2Bucket();
    getR2S3Client();
  } catch (e) {
    return handleApiError("POST /api/upload R2 config", e, {
      message: "File upload is not configured",
      meta: { userId: user.id },
    });
  }

  const userRate = await rateLimitAsync(
    CV_UPLOAD_RATE_LIMIT,
    `cv-upload:${user.id}`,
  );
  if (!userRate.success) return rateLimit429(userRate);

  if (!tryAcquireUserUploadSlot(user.id)) {
    return NextResponse.json(
      { error: "Too many concurrent uploads. Please try again." },
      { status: 429 },
    );
  }

  let uploadSize: number | undefined;

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

    uploadSize = file.size;
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

    // Validate body + digest before HeadObject replay (F7-036).
    const body = Buffer.from(await file.arrayBuffer());
    if (!hasPdfMagicBytes(body)) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }
    const contentSha256 = sha256Hex(body);

    const objectKey = `cvs/${user.id}/tailored/${idem.key}.pdf`;
    const publicBase = getR2PublicBaseUrl();
    const url = `${publicBase}/${objectKey}`;
    const client = getR2S3Client();
    const bucket = getR2Bucket();

    try {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
      );
      if (!existingObjectMatchesUpload(head, file, contentSha256)) {
        return idempotencyKeyConflictResponse();
      }
      return NextResponse.json({ url, idempotent: true });
    } catch (headErr) {
      if (!isHeadNotFound(headErr)) {
        return handleApiError("POST /api/upload HeadObject", headErr, {
          message: "Failed to verify upload state",
          meta: cvUploadErrorMeta(user.id, file.size, headErr),
        });
      }
    }

    const putInput = {
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: PDF_CONTENT_TYPE,
      Metadata: { [CV_CONTENT_SHA256_METADATA_KEY]: contentSha256 },
      IfNoneMatch: "*",
    };

    const respondIdempotentAfterRace = async (): Promise<NextResponse> => {
      try {
        const head = await client.send(
          new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
        );
        if (!existingObjectMatchesUpload(head, file, contentSha256)) {
          return idempotencyKeyConflictResponse();
        }
      } catch (verifyErr) {
        return handleApiError(
          "POST /api/upload HeadObject after put race",
          verifyErr,
          {
            message: "Failed to verify upload state",
            meta: cvUploadErrorMeta(user.id, file.size, verifyErr),
          },
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
    return handleApiError("POST /api/upload", error, {
      message: "Failed to upload file",
      meta: cvUploadErrorMeta(user.id, uploadSize, error),
    });
  } finally {
    releaseUserUploadSlot(user.id);
  }
}
