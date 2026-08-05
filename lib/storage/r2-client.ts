import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function getR2S3Client(): S3Client {
  if (client) return client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY",
    );
  }
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

export function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket?.trim()) throw new Error("Missing R2_BUCKET_NAME");
  return bucket.trim();
}

/**
 * Public origin for CV objects (custom domain or R2.dev public bucket URL).
 * No trailing slash.
 */
export function getR2PublicBaseUrl(): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (!base) throw new Error("Missing R2_PUBLIC_BASE_URL");
  return base;
}
