/**
 * Resolve the recruiter-facing email from profile contact_email + Auth account email.
 * Applications snapshot this string (or null when hidden / unavailable).
 */

export type ProfileContactEmailSource = {
  contact_email?: string | null;
};

/**
 * Effective contact email for applications / About you display.
 * Prefers the saved profile `contact_email`; falls back to the Auth account email.
 */
export function resolveApplicationContactEmail(
  profile: ProfileContactEmailSource | null | undefined,
  accountEmail: string | null | undefined,
): string | null {
  const contact = profile?.contact_email?.trim() ?? "";
  if (contact) return contact;
  const account = accountEmail?.trim() ?? "";
  return account || null;
}

/** True when a non-empty string is present. */
export function hasContactValue(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * Channels recruiters can use to reach a candidate (portfolio is not enough).
 * `show*` is the Visible toggle / default_show flag for that channel.
 */
export type RecruiterContactVisibility = {
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  showEmail: boolean;
  showPhone: boolean;
  showLinkedin: boolean;
};

/** Short footer / publish-blocker label. */
export const RECRUITER_CONTACT_BLOCKER_NAME = "Contact method";

/** Publish footer note (“To publish, add …”). */
export const RECRUITER_CONTACT_PUBLISH_NOTE =
  "a way to reach you (email, phone, or LinkedIn)";

/** Inline warning on create/edit About you. */
export const RECRUITER_CONTACT_APPLICATION_WARNING =
  "Recruiters need a way to reach you. Show email, phone, or LinkedIn on this page — or add a missing value on Edit profile.";

/** Inline warning + save gate on Profile defaults. */
export const RECRUITER_CONTACT_PROFILE_WARNING =
  "New applications need at least one visible contact method by default (email, phone, or LinkedIn). Turn one Visible, or add the missing value.";

/**
 * True when at least one of email, phone, or LinkedIn is both filled and shown.
 */
export function hasVisibleRecruiterContact(
  channels: RecruiterContactVisibility,
): boolean {
  if (channels.showEmail && hasContactValue(channels.email)) return true;
  if (channels.showPhone && hasContactValue(channels.phone)) return true;
  if (channels.showLinkedin && hasContactValue(channels.linkedin_url)) {
    return true;
  }
  return false;
}

/**
 * Applications store null for hidden fields, so a non-empty stored value means
 * that channel is visible on the public page.
 */
export function applicationHasVisibleRecruiterContact(app: {
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
}): boolean {
  return hasVisibleRecruiterContact({
    email: app.email,
    phone: app.phone,
    linkedin_url: app.linkedin_url,
    showEmail: true,
    showPhone: true,
    showLinkedin: true,
  });
}
