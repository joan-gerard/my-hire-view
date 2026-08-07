import { createInitialProfile } from "@/lib/auth/create-initial-profile";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";

type AuthUserLike = {
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

export type BootstrapInitialProfileResult = {
  error: string | null;
  /** True when names are missing — no create was attempted. */
  skipped?: boolean;
};

/**
 * Ensures a profiles row exists for an authenticated user, using names and
 * public_id from Auth user_metadata.
 *
 * Passes the raw metadata `public_id` (even if empty/invalid) into
 * `createInitialProfile` so regenerate + Auth sync stay in one place (C1-038).
 *
 * Used as a safety net when signup’s insert failed and the confirmation
 * callback never runs (immediate session), and on login for the same gap.
 * Idempotent via createInitialProfile.
 */
export async function bootstrapInitialProfile(
  user: AuthUserLike,
): Promise<BootstrapInitialProfileResult> {
  const names = namesFromUserMetadata(user);
  if (!names) {
    return { error: null, skipped: true };
  }

  const meta = user.user_metadata ?? {};
  const rawPublicId =
    typeof meta.public_id === "string" ? meta.public_id.trim() : "";

  return createInitialProfile({
    userId: user.id,
    first_name: names.first_name,
    last_name: names.last_name,
    public_id: rawPublicId,
  });
}
