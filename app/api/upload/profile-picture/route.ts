import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "profile-pictures";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getExtension(filename: string): string {
  const last = filename.split(".").pop();
  if (last && /^[a-z0-9]+$/i.test(last)) return last.toLowerCase();
  return "jpg";
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    const ext = getExtension(file.name);
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Profile picture upload error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to upload" },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
