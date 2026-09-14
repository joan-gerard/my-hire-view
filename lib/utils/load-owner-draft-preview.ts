import {
  toOwnerPreviewApplication,
  type PublicApplication,
} from "@/lib/types/application";
import { checkCvObjectExists } from "@/lib/utils/cv-storage";
import { resolvePublicApplication } from "@/lib/utils/resolve-public-application";

export type OwnerDraftPreview = {
  application: PublicApplication;
  applicationId: string;
};

/**
 * Owner-only draft preview for the public share URL (F16-050).
 * Returns content when the viewer owns a **draft** at this publicId+slug.
 * Recruiters and non-owners still get the normal unavailable path from
 * `loadPublicApplicationResponse`.
 */
export async function loadOwnerDraftPreview(
  publicId: string,
  slug: string,
  viewerUserId: string,
): Promise<OwnerDraftPreview | null> {
  const resolved = await resolvePublicApplication(publicId, slug);
  if (!resolved) {
    return null;
  }
  if (resolved.ownerUserId !== viewerUserId) {
    return null;
  }
  if (resolved.application.status !== "draft") {
    return null;
  }

  const cv_exists = resolved.application.cv_url
    ? await checkCvObjectExists(resolved.application.cv_url)
    : undefined;

  return {
    application: toOwnerPreviewApplication(resolved.application, cv_exists),
    applicationId: resolved.application.id,
  };
}
