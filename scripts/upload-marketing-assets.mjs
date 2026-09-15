/**
 * Upload landing-page videos to R2 under `marketing/`.
 *
 * Reads `.env` then `.env.local` (local overrides `.env`). Keys already set in
 * the process environment (shell / CI) are never overwritten. Env files are
 * optional when `R2_*` is already present.
 *
 * Usage: node scripts/upload-marketing-assets.mjs
 *
 * Cache-Control is `immutable` for one year. Do not overwrite an existing key after
 * changing the file bytes — browsers will keep the old video. Upload a new key
 * (version suffix or content hash) and point `marketingAssetUrl(...)` at that name.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** Must match the `marketing/` prefix documented in `lib/marketing-assets.ts`. */
const PREFIX = "marketing";

/** Object keys must change when the video content changes (see file header). */
const FILES = [
  { local: "public/hero-video.mp4", key: `${PREFIX}/hero-video.mp4`, type: "video/mp4" },
  { local: "public/step-1.mp4", key: `${PREFIX}/step-1.mp4`, type: "video/mp4" },
  { local: "public/step-2.mp4", key: `${PREFIX}/step-2.mp4`, type: "video/mp4" },
  { local: "public/step-3.mp4", key: `${PREFIX}/step-3.mp4`, type: "video/mp4" },
];

/** Keys present before dotenv files are loaded (shell / CI). Never overwritten. */
const ENV_FROM_PROCESS = new Set(Object.keys(process.env));

function loadEnvFile(filename, { override = false } = {}) {
  const path = resolve(ROOT, filename);
  if (!existsSync(path)) return false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (ENV_FROM_PROCESS.has(key)) continue;
    if (override || process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

function loadDotenvFiles() {
  // Next.js: `.env` then `.env.local` (local wins). Pre-set process.env still wins.
  loadEnvFile(".env");
  loadEnvFile(".env.local", { override: true });
}

loadDotenvFiles();

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME?.trim();

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    "Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_BUCKET_NAME (set them in the environment or in .env / .env.local)",
  );
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

/** Safe only because keys are treated as unique forever; see file header. */
const cacheControl = "public, max-age=31536000, immutable";

for (const file of FILES) {
  const abs = resolve(ROOT, file.local);
  if (!existsSync(abs)) {
    throw new Error(`Local file missing: ${file.local}`);
  }
  const body = readFileSync(abs);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: file.key,
      Body: body,
      ContentType: file.type,
      CacheControl: cacheControl,
    }),
  );
  console.log(`uploaded ${file.key} (${body.length} bytes)`);
}

console.log(
  "Done. Set NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL to R2_PUBLIC_BASE_URL + /marketing in .env and Vercel, then delete public/*.mp4.",
);
