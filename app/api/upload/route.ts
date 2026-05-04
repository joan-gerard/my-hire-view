import {
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  getR2Bucket,
  getR2PublicBaseUrl,
  getR2S3Client,
} from "@/lib/storage/r2-client";
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from "@/lib/rate-limit";
import { normalizeUploadIdempotencyKey } from "@/lib/utils/idempotency-key";
import { NextRequest, NextResponse } from "next/server";

function isHeadNotFound(err: unknown): boolean {
  const e = err as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return (
    e.name === "NotFound" ||
    e.$metadata?.httpStatusCode === 404 ||
    e.name === "NoSuchKey"
  );
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

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

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
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

    const objectKey = `cvs/idempotency/${idem.key}.pdf`;
    const publicBase = getR2PublicBaseUrl();
    const url = `${publicBase}/${objectKey}`;
    const client = getR2S3Client();
    const bucket = getR2Bucket();

    try {
      await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
      );
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

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: body,
        ContentType: "application/pdf",
      }),
    );

    return NextResponse.json({ url, idempotent: false });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
