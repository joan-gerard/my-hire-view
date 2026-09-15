import {
  isApplicationPubliclyVisible,
  toPublicApplicationResponse,
  type PublicApplication,
} from "@/lib/types/application";
import { getUser } from "@/lib/auth";
import { checkCvObjectExists } from "@/lib/utils/cv-storage";
import { buildOwnerDraftPreview } from "@/lib/utils/load-owner-draft-preview";
import { resolvePublicApplication } from "@/lib/utils/resolve-public-application";

export type ViewPageApplicationResult =
  | { kind: "live"; application: PublicApplication }
  | {
      kind: "owner_draft_preview";
      application: PublicApplication;
      applicationId: string;
    }
  | { kind: "unavailable" }
  | { kind: "not_found" };

/**
 * Single resolve for `/view/[publicId]/[slug]` (F16-050).
 * Avoids a second profiles+applications fetch when falling through from
 * unavailable (draft) to owner draft preview.
 */
export async function loadViewPageApplication(
  publicId: string,
  slug: string,
): Promise<ViewPageApplicationResult> {
  const resolved = await resolvePublicApplication(publicId, slug);
  if (!resolved) {
    return { kind: "not_found" };
  }

  const { application } = resolved;

  if (isApplicationPubliclyVisible(application.status)) {
    const cv_exists = application.cv_url
      ? await checkCvObjectExists(application.cv_url)
      : undefined;
    const dto = toPublicApplicationResponse(application, cv_exists);
    if (dto.status === "unavailable") {
      return { kind: "unavailable" };
    }
    return { kind: "live", application: dto };
  }

  // Draft/archived: only then look up the session for owner draft preview.
  const user = await getUser();
  if (user) {
    const preview = await buildOwnerDraftPreview(resolved, user.id);
    if (preview) {
      return {
        kind: "owner_draft_preview",
        application: preview.application,
        applicationId: preview.applicationId,
      };
    }
  }

  return { kind: "unavailable" };
}
