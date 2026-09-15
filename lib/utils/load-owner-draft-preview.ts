import {
  toOwnerPreviewApplication,
  type PublicApplication,
} from "@/lib/types/application";
import { checkCvObjectExists } from "@/lib/utils/cv-storage";
import type { ResolvedPublicApplication } from "@/lib/utils/resolve-public-application";

export type OwnerDraftPreview = {
  application: PublicApplication;
  applicationId: string;
};

/**
 * Build an owner draft preview from an already-resolved public application
 * (F16-050). Returns null when the viewer is not the owner or the row is not
 * a draft. Used by `loadViewPageApplication` after a single resolve.
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
