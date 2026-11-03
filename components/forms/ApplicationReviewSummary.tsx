"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@/components/admin/icons";
import {
  RECRUITER_INFO_FIELDS,
  type CandidateFieldKey,
} from "@/components/forms/CandidateFieldsSection";
import type { ApplicationFormStepId } from "@/components/forms/application-form-steps";
import { extractVideoId } from "@/lib/utils/youtube";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { getApplicationUrl } from "@/lib/utils/url";
import { type ReactNode } from "react";
import { FiAlertCircle, FiCheck, FiEyeOff, FiFileText } from "react-icons/fi";

export type ReviewSummaryTone = "neutral" | "ok" | "warn";

export type ReviewSlugState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "invalid"; message: string }
  | { kind: "unavailable"; message: string };

export interface ApplicationReviewSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: string;
  role: string;
  slug: string;
  slugReady: boolean;
  slugState?: ReviewSlugState;
  /** Slug last saved on the server. Empty on create. */
  savedSlug?: string | null;
  publicId?: string | null;
  fieldValues: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  hasProfilePicture: boolean;
  showProfilePicture: boolean;
  profilePictureUrl?: string | null;
  profilePictureVersion?: string | null;
  /** Ready CV display: filename or short ready label. Empty when missing. */
  cvLabel: string | null;
  hasVideo: boolean;
  videoUrl?: string | null;
  /**
   * `wizard` — collapsible nested panel (parked wizard).
   * `split` — always open, fills the paper form card.
   */
  variant?: "wizard" | "split";
  onJumpToStep?: (stepId: ApplicationFormStepId) => void;
  onPreview?: (trigger: HTMLButtonElement) => void;
}

function StatusChip({
  children,
  tone,
  icon,
  onClick,
}: {
  children: ReactNode;
  tone: ReviewSummaryTone;
  icon?: "warn" | "ok" | "hidden";
  onClick?: () => void;
}) {
  const toneClass =
    tone === "ok"
      ? "border-[var(--ink)]/15 bg-[var(--status-wash-viewed)] text-[var(--ink)]"
      : tone === "warn"
      ? "border-[#9d174d]/35 bg-[var(--status-warning-bg)] text-[#9d174d]"
      : "border-[var(--ink)]/20 bg-[var(--white)] text-[var(--ink)]";

  const glyph =
    icon === "warn" ? (
      <FiAlertCircle className="size-3.5 shrink-0" aria-hidden />
    ) : icon === "ok" ? (
      <FiCheck className="size-3.5 shrink-0" aria-hidden />
    ) : icon === "hidden" ? (
      <FiEyeOff className="size-3.5 shrink-0" aria-hidden />
    ) : null;

  const className = `inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold ${toneClass}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} cursor-pointer hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]`}
      >
        {glyph}
        {children}
      </button>
    );
  }

  return (
    <span className={className}>
      {glyph}
      {children}
    </span>
  );
}

function QuietNote({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const className =
    "text-sm font-medium text-[var(--muted)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`cursor-pointer ${className}`}>
        {children}
      </button>
    );
  }
  return <span className="text-sm font-medium text-[var(--muted)]">{children}</span>;
}

/** Title-case an all-lowercase word. Leave typed capitals alone so the slug stays unchanged. */
function displayName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word === word.toLowerCase()
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
}

function shareUrlParts(
  publicId: string | null | undefined,
  slug: string,
): { domain: string; prefix: string; slug: string } | null {
  const trimmed = slug.trim();
  if (!publicId || !trimmed) return null;
  const full = getApplicationUrl(publicId, trimmed);
  try {
    const url = new URL(full);
    const segments = url.pathname.split("/").filter(Boolean);
    const slugSegment = segments.pop() ?? trimmed;
    const prefix = `/${segments.join("/")}/`;
    return { domain: url.host, prefix, slug: slugSegment };
  } catch {
    return null;
  }
}

function SummaryGroup({
  step,
  title,
  complete,
  children,
  split,
  onEdit,
  actionLabel = "Edit",
}: {
  step: number;
  title: string;
  complete?: boolean;
  children: ReactNode;
  split?: boolean;
  onEdit?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {split && complete ? (
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"
              aria-hidden
            >
              <FiCheck className="size-3.5" strokeWidth={2.75} />
            </span>
          ) : split ? (
            <span
              className="size-7 shrink-0 rounded-full border-2 border-[var(--ink)] bg-[var(--white)]"
              aria-hidden
            />
          ) : (
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-[var(--white)] text-[0.65rem] font-semibold text-[var(--ink)]"
              aria-hidden
            >
              {step}
            </span>
          )}
          <h4
            className={
              split
                ? "font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]"
                : "font-heading text-sm font-semibold tracking-[-0.02em] text-[var(--ink)]"
            }
          >
            {title}
            {split && complete ? <span className="sr-only">, complete</span> : null}
            {split && !complete ? <span className="sr-only">, not finished</span> : null}
          </h4>
        </div>
        {split && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer text-sm font-semibold text-[var(--ink)] underline underline-offset-2 hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <dl className={split ? "space-y-3" : "space-y-3 pl-[2.125rem]"}>
        {children}
      </dl>
    </div>
  );
}

function SummaryRow({
  label,
  children,
  split,
}: {
  label: string;
  children: ReactNode;
  split?: boolean;
}) {
  if (split) {
    return (
      <div className="grid min-w-0 grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
        <dt className="text-sm font-semibold text-[var(--ink)]">{label}</dt>
        <dd className="min-w-0 text-sm font-medium text-[var(--ink)]">
          {children}
        </dd>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <dt className="text-sm font-semibold text-[var(--ink)]">{label}</dt>
      <dd className="mt-1 min-w-0 text-sm font-medium text-[var(--ink)]">
        {children}
      </dd>
    </div>
  );
}

function recruiterFieldDisplay(
  included: boolean,
  value: string,
): { kind: "value"; text: string } | { kind: "hidden"; text: string } | { kind: "empty" } {
  const trimmed = value.trim();
  if (!trimmed) return { kind: "empty" };
  if (!included) return { kind: "hidden", text: trimmed };
  return { kind: "value", text: trimmed };
}

export default function ApplicationReviewSummary({
  open,
  onOpenChange,
  company,
  role,
  slug,
  slugReady,
  slugState = { kind: "idle" },
  publicId,
  fieldValues,
  include,
  hasProfilePicture,
  showProfilePicture,
  profilePictureUrl,
  profilePictureVersion,
  savedSlug = "",
  cvLabel,
  hasVideo,
  videoUrl,
  variant = "wizard",
  onJumpToStep,
  onPreview,
}: ApplicationReviewSummaryProps) {
  const split = variant === "split";
  const companyTrim = company.trim();
  const roleTrim = role.trim();
  const slugTrim = slug.trim();
  const savedSlugTrim = (savedSlug ?? "").trim();
  const roleHero =
    companyTrim || roleTrim
      ? `${companyTrim ? displayName(companyTrim) : "—"} · ${
          roleTrim ? displayName(roleTrim) : "—"
        }`
      : null;
  const jump = (stepId: ApplicationFormStepId) => onJumpToStep?.(stepId);
  const pictureSrc = cacheBustProfilePictureUrl(
    profilePictureUrl,
    profilePictureVersion,
  );

  const pictureShown = hasProfilePicture && showProfilePicture;
  const roleHasContent = Boolean(companyTrim || roleTrim || slugTrim);
  const aboutHasContent =
    hasProfilePicture ||
    RECRUITER_INFO_FIELDS.some(({ key }) => (fieldValues[key] ?? "").trim());
  const roleComplete = Boolean(companyTrim && roleTrim && slugReady);
  // About you has no required fields, so it does not count as unfinished.
  const aboutComplete = true;
  const cvComplete = Boolean(cvLabel);
  const videoComplete = hasVideo;
  const completeCount = [roleComplete, aboutComplete, cvComplete, videoComplete].filter(
    Boolean,
  ).length;
  const slugReplacesSharedLink = Boolean(
    savedSlugTrim && slugTrim && slugTrim !== savedSlugTrim,
  );

  const requiredChip = (stepId: ApplicationFormStepId) => (
    <StatusChip tone="warn" icon="warn" onClick={onJumpToStep ? () => jump(stepId) : undefined}>
      Required
    </StatusChip>
  );

  const notAdded = (stepId: ApplicationFormStepId) => (
    <QuietNote onClick={onJumpToStep ? () => jump(stepId) : undefined}>Not added</QuietNote>
  );

  const slugNote = (() => {
    if (!slugTrim) return null;
    if (slugState.kind === "checking") return "Still being checked";
    if (slugState.kind === "unavailable") return slugState.message || "Taken";
    if (slugState.kind === "invalid") return slugState.message || "Not valid";
    if (!slugReady) return "Not ready";
    return null;
  })();

  const share = shareUrlParts(publicId, slugTrim);
  const videoId = videoUrl ? extractVideoId(videoUrl) : null;

  const pictureRow = (
    <SummaryRow label="Profile picture" split={split}>
      {pictureShown && pictureSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pictureSrc}
          alt=""
          className="size-8 rounded-full object-cover"
        />
      ) : hasProfilePicture && !showProfilePicture ? (
        <span className="inline-flex min-w-0 items-center gap-2">
          {pictureSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pictureSrc}
              alt=""
              className="size-8 shrink-0 rounded-full object-cover opacity-60"
            />
          ) : null}
          <StatusChip
            tone="neutral"
            icon="hidden"
            onClick={onJumpToStep ? () => jump("candidate") : undefined}
          >
            Hidden from recruiters
          </StatusChip>
        </span>
      ) : (
        notAdded("candidate")
      )}
    </SummaryRow>
  );

  const slugStatus = slugNote ? (
    <StatusChip
      tone="warn"
      icon="warn"
      onClick={onJumpToStep ? () => jump("role") : undefined}
    >
      {slugState.kind === "checking"
        ? "Checking"
        : slugState.kind === "unavailable"
          ? "Taken"
          : slugState.kind === "invalid"
            ? "Not valid"
            : "Required"}
    </StatusChip>
  ) : (
    <span
      tabIndex={0}
      className="group relative inline-flex text-[#3f8f22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
    >
      <FiCheck className="size-4" strokeWidth={2.75} aria-hidden />
      <span className="sr-only">Available</span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-sm font-medium text-[var(--white)] shadow-lg group-hover:block group-focus-within:block"
      >
        Available
      </span>
    </span>
  );

  const slugRow = (
    <SummaryRow label="Share link" split={split}>
      {share || slugTrim ? (
        <div className="min-w-0">
          <div className="break-all text-sm leading-relaxed">
            {share ? (
              <>
                <span className="text-[var(--muted)]">
                  {share.domain}
                  {share.prefix}
                </span>
                <span className="text-[var(--ink)]">{share.slug}</span>
              </>
            ) : (
              <span className="text-[var(--ink)]">{slugTrim}</span>
            )}
            <span className="ml-1.5 inline-flex align-middle">{slugStatus}</span>
          </div>
          {slugReplacesSharedLink ? (
            <p className="mt-1.5 text-sm font-medium text-[var(--ink)]">
              Saving replaces the link you already shared.
            </p>
          ) : null}
        </div>
      ) : (
        requiredChip("role")
      )}
    </SummaryRow>
  );

  const aboutGroup = (
    <SummaryGroup
      step={2}
      title="About you"
      complete={aboutComplete}
      split={split}
      actionLabel={aboutHasContent ? "Edit" : "Add details"}
      onEdit={onJumpToStep ? () => jump("candidate") : undefined}
    >
      {pictureRow}
      {RECRUITER_INFO_FIELDS.map(({ key, label }) => {
        const display = recruiterFieldDisplay(include[key], fieldValues[key] ?? "");
        return (
          <SummaryRow key={key} label={label} split={split}>
            {display.kind === "value" ? (
              <span className="break-all">{display.text}</span>
            ) : display.kind === "hidden" ? (
              <span className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="min-w-0 break-all">{display.text}</span>
                <StatusChip
                  tone="neutral"
                  icon="hidden"
                  onClick={onJumpToStep ? () => jump("candidate") : undefined}
                >
                  Hidden from recruiters
                </StatusChip>
              </span>
            ) : (
              notAdded("candidate")
            )}
          </SummaryRow>
        );
      })}
    </SummaryGroup>
  );

  const cvGroup = (
    <SummaryGroup
      step={3}
      title="CV"
      complete={cvComplete}
      split={split}
      actionLabel={cvLabel ? "Edit" : "Add résumé"}
      onEdit={onJumpToStep ? () => jump("materials") : undefined}
    >
      <SummaryRow label="Résumé" split={split}>
        {cvLabel ? (
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <FiFileText className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate" title={cvLabel}>
                {cvLabel}
              </span>
            </div>
            {onPreview ? (
              <button
                type="button"
                onClick={(event) => onPreview?.(event.currentTarget)}
                className="mt-1 cursor-pointer text-sm font-semibold text-[var(--ink)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
              >
                Preview
              </button>
            ) : null}
          </div>
        ) : (
          requiredChip("materials")
        )}
      </SummaryRow>
    </SummaryGroup>
  );

  const videoGroup = (
    <SummaryGroup
      step={4}
      title="Video"
      complete={videoComplete}
      split={split}
      actionLabel={hasVideo ? "Edit" : "Add video"}
      onEdit={onJumpToStep ? () => jump("video") : undefined}
    >
      <SummaryRow label="YouTube intro" split={split}>
        {hasVideo && videoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
            alt="YouTube intro"
            className="h-12 w-20 rounded-md object-cover"
          />
        ) : hasVideo ? (
          <span className="break-all">{videoUrl}</span>
        ) : (
          requiredChip("video")
        )}
      </SummaryRow>
    </SummaryGroup>
  );

  if (split) {
    return (
      <section aria-labelledby="application-review-summary-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            id="application-review-summary-heading"
            className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]"
          >
            Summary
          </h3>
          <p className="text-sm font-semibold text-[var(--ink)]">
            {completeCount} of 4 complete
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-[var(--white)] p-5 sm:p-6">
          <SummaryGroup
            step={1}
            title="Role & share URL"
            complete={roleComplete}
            split
            actionLabel={roleHasContent ? "Edit" : "Add role"}
            onEdit={onJumpToStep ? () => jump("role") : undefined}
          >
              <SummaryRow label="Company" split>
                {companyTrim ? (
                  displayName(companyTrim)
                ) : (
                  requiredChip("role")
                )}
              </SummaryRow>
              <SummaryRow label="Role" split>
                {roleTrim ? displayName(roleTrim) : requiredChip("role")}
              </SummaryRow>
              {slugRow}
            </SummaryGroup>

          <div className="mt-6 grid grid-cols-1 gap-8 border-t border-[var(--ink)]/10 pt-6 sm:grid-cols-2 sm:gap-x-10">
            {aboutGroup}
            <div className="space-y-8">
              {cvGroup}
              {videoGroup}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-[var(--paper)]/60">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <h3 className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Summary
        </h3>
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="inline-flex shrink-0 cursor-pointer rounded p-1 text-[var(--ink)] hover:bg-[var(--ink)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          aria-expanded={open}
          aria-controls="application-review-summary"
          aria-label={open ? "Hide application summary" : "Show application summary"}
          title={open ? "Hide summary" : "Show summary"}
        >
          {open ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        id="application-review-summary"
        hidden={!open}
        className="space-y-5 border-t border-[var(--ink)]/10 px-4 py-4"
      >
        <SummaryGroup step={1} title="Role & share URL">
          <div className="min-w-0">
            <dt className="sr-only">Company and role</dt>
            <dd className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
              {roleHero ?? "Not added"}
            </dd>
          </div>
          {slugRow}
        </SummaryGroup>

        <div className="border-t border-[var(--ink)]/10" role="separator" />

        <SummaryGroup step={2} title="About you">
          {pictureRow}
          {RECRUITER_INFO_FIELDS.map(({ key, label }) => {
            const display = recruiterFieldDisplay(include[key], fieldValues[key] ?? "");
            return (
              <SummaryRow key={key} label={label}>
                {display.kind === "value" ? (
                  <span className="break-all">{display.text}</span>
                ) : display.kind === "hidden" ? (
                  <span className="flex min-w-0 flex-col items-start gap-1.5">
                    <span className="min-w-0 break-all">{display.text}</span>
                    <StatusChip tone="neutral" icon="hidden">
                      Hidden from recruiters
                    </StatusChip>
                  </span>
                ) : (
                  notAdded("candidate")
                )}
              </SummaryRow>
            );
          })}
        </SummaryGroup>

        <div className="border-t border-[var(--ink)]/10" role="separator" />

        <SummaryGroup step={3} title="CV">
          <SummaryRow label="Résumé">
            {cvLabel ? (
              <span className="break-words">{cvLabel}</span>
            ) : (
              <StatusChip tone="warn" icon="warn">Required</StatusChip>
            )}
          </SummaryRow>
        </SummaryGroup>

        <div className="border-t border-[var(--ink)]/10" role="separator" />

        <SummaryGroup step={4} title="Video">
          <SummaryRow label="YouTube intro">
            {hasVideo && videoId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                alt="YouTube intro"
                className="h-12 w-20 rounded-md object-cover"
              />
            ) : hasVideo ? (
              <span className="break-all">{videoUrl}</span>
            ) : (
              <StatusChip tone="warn" icon="warn">Required</StatusChip>
            )}
          </SummaryRow>
        </SummaryGroup>
      </div>
    </section>
  );
}
