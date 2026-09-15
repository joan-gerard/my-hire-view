import {
  toOwnerPreviewApplication,
  type PublicApplication,
} from "@/lib/types/application";
import { checkCvObjectExists } from "@/lib/utils/cv-storage";
import {
  resolvePublicApplication,
  type ResolvedPublicApplication,
} from "@/lib/utils/resolve-public-application";

export type OwnerDraftPreview = {
  application: PublicApplication;
  applicationId: string;
};

/**
 * Build an owner draft preview from an already-resolved public application.
 * Returns null when the viewer is not the owner or the row is not a draft.
 */
export async function buildOwnerDraftPreview(
  resolved: ResolvedPublicApplication,
  viewerUserId: string,
): Promise<OwnerDraftPreview | null> {
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

/**
 * Owner-only draft preview for the public share URL (F16-050).
 * Returns content when the viewer owns a **draft** at this publicId+slug.
 * Recruiters and non-owners still get the normal unavailable path from
 * `loadPublicApplicationResponse`. Prefer {@link buildOwnerDraftPreview}
 * when the row was already resolved (e.g. view page) to avoid a second fetch.
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
  return buildOwnerDraftPreview(resolved, viewerUserId);
}
