import { createInitialProfile } from "@/lib/auth/create-initial-profile";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { generatePublicId } from "@/lib/utils/public-id";

type AuthUserLike = {
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Ensures a profiles row exists for an authenticated user, using names and
 * (validated) public_id from Auth user_metadata.
 *
 * Used as a safety net when signup’s insert failed and the confirmation
 * callback never runs (immediate session), and on login for the same gap.
 * Idempotent via createInitialProfile.
 */
export async function bootstrapInitialProfile(
  user: AuthUserLike,
): Promise<{ error: string | null }> {
  const names = namesFromUserMetadata(user);
  if (!names) {
    return { error: "missing first/last name in user_metadata" };
  }

  const publicId = publicIdFromUserMetadata(user) ?? generatePublicId();

  return createInitialProfile({
    userId: user.id,
    first_name: names.first_name,
    last_name: names.last_name,
    public_id: publicId,
  });
}
