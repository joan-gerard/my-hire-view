import {
  isApplicationPubliclyVisible,
  toPublicApplicationResponse,
  type PublicApplicationResponse,
} from "@/lib/types/application";
import { checkCvObjectExists } from "@/lib/utils/cv-storage";
import { resolvePublicApplication } from "@/lib/utils/resolve-public-application";

/**
 * Loads the public application DTO for share pages and the public GET API.
 * Returns null when the public id + slug pair does not resolve (404).
 * Throws on database query errors. R2 HeadObject failures omit `cv_exists`
 * rather than reporting a missing CV (see `checkCvObjectExists`).
 */
export async function loadPublicApplicationResponse(
  publicId: string,
  slug: string,
): Promise<PublicApplicationResponse | null> {
  const resolved = await resolvePublicApplication(publicId, slug);
  if (!resolved) {
    return null;
  }

  const application = resolved.application;

  if (!isApplicationPubliclyVisible(application.status)) {
    return toPublicApplicationResponse(application);
  }

  const cv_exists = application.cv_url
    ? await checkCvObjectExists(application.cv_url)
    : undefined;

  return toPublicApplicationResponse(application, cv_exists);
}
