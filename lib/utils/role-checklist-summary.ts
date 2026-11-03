import { validateSlugFormat } from "@/lib/utils/slug-generate";

/** Slug check states the create checklist can describe in one line. */
export type RoleChecklistSlugStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "invalid"; message: string }
  | { kind: "unavailable"; message: string };

/**
 * Closed Role line on the create checklist.
 * `roleReady` is the step tick (company, role, and a slug that still counts,
 * including a check already in flight).
 */
export function roleChecklistSummary(input: {
  company: string;
  role: string;
  slug: string;
  roleReady: boolean;
  slugStatus: RoleChecklistSlugStatus;
}): { text: string; pending: boolean; progress: boolean } {
  const company = input.company.trim();
  const roleName = input.role.trim();
  if (!company && !roleName) {
    return { text: "Add a company and role", pending: true, progress: false };
  }
  if (!company || !roleName) {
    return { text: company || roleName, pending: true, progress: false };
  }
  if (input.slugStatus.kind === "checking") {
    return { text: "Checking...", pending: false, progress: true };
  }
  if (input.roleReady) {
    return { text: `${company} · ${roleName}`, pending: false, progress: false };
  }
  return linkGapSummary(input.slug, input.slugStatus);
}

function linkGapSummary(
  slug: string,
  status: RoleChecklistSlugStatus,
): { text: string; pending: boolean; progress: boolean } {
  const ending = slug.trim();
  if (!ending || status.kind === "idle") {
    return { text: "Add a link ending", pending: true, progress: false };
  }
  if (status.kind === "invalid" || !validateSlugFormat(ending).ok) {
    return { text: "Fix the link ending", pending: true, progress: false };
  }
  if (status.kind === "unavailable" && isTakenShareLinkMessage(status.message)) {
    return { text: "Link already used", pending: true, progress: false };
  }
  return { text: "Couldn't check the link", pending: true, progress: false };
}

/**
 * Collision copy from the slug APIs, without importing the server slug module.
 * Matches `SLUG_COLLISION_USER_MESSAGE` and the "not available" fallbacks.
 */
function isTakenShareLinkMessage(message: string): boolean {
  return (
    message.startsWith("You already have an application with this slug") ||
    message.startsWith("This slug is not available")
  );
}
