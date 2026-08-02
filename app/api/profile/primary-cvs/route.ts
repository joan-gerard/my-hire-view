import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "@/lib/auth";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import {
  getR2Bucket,
  getR2PublicBaseUrl,
  getR2S3Client,
} from "@/lib/storage/r2-client";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types/application";
import {
  PRIMARY_CV_DELETE_PREVIEW_LIMIT,
  PRIMARY_CV_MAX_PER_USER,
  type PrimaryCvApplicationPreview,
} from "@/lib/types/primary-cv";
import { deleteCvIfOurs } from "@/lib/utils/cv-storage";
import { hasPdfMagicBytes } from "@/lib/utils/pdf";
import { NextRequest, NextResponse } from "next/server";

const APPLICATION_STATUSES = new Set<ApplicationStatus>([
  "active",
  "draft",
  "archived",
]);

function toApplicationStatus(value: unknown): ApplicationStatus {
  if (
    typeof value === "string" &&
    APPLICATION_STATUSES.has(value as ApplicationStatus)
  ) {
    return value as ApplicationStatus;
  }
  return "active";
}

/**
 * GET /api/profile/primary-cvs — list the current user's primary CV library
 * (includes `applications_count` and a `used_by` preview per row for delete UX).
 */
export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("primary_cvs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const primaries = data ?? [];
    const usedBy = new Map<string, PrimaryCvApplicationPreview[]>();
    const counts = new Map<string, number>();

    if (primaries.length > 0) {
      const { data: refs, error: refsError } = await supabase
        .from("applications")
        .select("id, company, role, status, primary_cv_id")
        .eq("user_id", user.id)
        .not("primary_cv_id", "is", null)
        .order("updated_at", { ascending: false });

      if (refsError) {
        return NextResponse.json({ error: refsError.message }, { status: 400 });
      }

      for (const row of refs ?? []) {
        const primaryId = row.primary_cv_id;
        if (typeof primaryId !== "string" || !primaryId) continue;
        counts.set(primaryId, (counts.get(primaryId) ?? 0) + 1);

        const list = usedBy.get(primaryId) ?? [];
        if (list.length < PRIMARY_CV_DELETE_PREVIEW_LIMIT) {
          list.push({
            id: String(row.id),
            company: typeof row.company === "string" ? row.company : "",
            role: typeof row.role === "string" ? row.role : "",
            status: toApplicationStatus(row.status),
          });
          usedBy.set(primaryId, list);
        }
      }
    }

    const withUsage = primaries.map((row) => ({
      ...row,
      applications_count: counts.get(row.id) ?? 0,
      used_by: usedBy.get(row.id) ?? [],
    }));

    return NextResponse.json({ data: withUsage });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * POST /api/profile/primary-cvs — upload a PDF and add it to the primary library (max 5).
 * Body: multipart FormData with `file` (PDF). Optional `label`.
 * Object key: `cvs/{userId}/primary/{id}.pdf`.
 */
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

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { count, error: countError } = await supabase
      .from("primary_cvs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }
    if ((count ?? 0) >= PRIMARY_CV_MAX_PER_USER) {
      return NextResponse.json(
        {
          error: `You can store up to ${PRIMARY_CV_MAX_PER_USER} primary CVs. Delete one to upload another.`,
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const labelRaw = formData.get("label");
    const label =
      typeof labelRaw === "string" && labelRaw.trim()
        ? labelRaw.trim().slice(0, 120)
        : null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 3MB" },
        { status: 400 },
      );
    }

    const objectId = crypto.randomUUID();
    const objectKey = `cvs/${user.id}/primary/${objectId}.pdf`;
    const publicBase = getR2PublicBaseUrl();
    const url = `${publicBase}/${objectKey}`;
    const body = Buffer.from(await file.arrayBuffer());
    if (!hasPdfMagicBytes(body)) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    await getR2S3Client().send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: objectKey,
        Body: body,
        ContentType: "application/pdf",
      }),
    );

    const { data, error } = await supabase
      .from("primary_cvs")
      .insert({
        user_id: user.id,
        url,
        filename: file.name || "cv.pdf",
        label,
      })
      .select()
      .single();

    if (error) {
      await deleteCvIfOurs(url, user.id);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { data: { ...data, applications_count: 0, used_by: [] } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Primary CV upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload primary CV" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/profile/primary-cvs?id=… — remove a primary CV from the library and R2.
 * Applications that still reference it keep the URL but will show missing CV until updated.
 */
export async function DELETE(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Primary CV id is required" },
        { status: 400 },
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("primary_cvs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("primary_cv_id", id);

    const { error: deleteError } = await supabase
      .from("primary_cvs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    await deleteCvIfOurs(existing.url, user.id);

    return NextResponse.json({
      success: true,
      applications_affected: count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
