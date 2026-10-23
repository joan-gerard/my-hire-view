"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@/components/admin/icons";
import {
  RECRUITER_INFO_FIELDS,
  type CandidateFieldKey,
} from "@/components/forms/CandidateFieldsSection";
import type { ReactNode } from "react";

export type ReviewSummaryTone = "neutral" | "ok" | "warn";

export interface ApplicationReviewSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: string;
  role: string;
  slug: string;
  slugReady: boolean;
  fieldValues: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  hasProfilePicture: boolean;
  showProfilePicture: boolean;
  /** Ready CV display: filename or short ready label. Empty when missing. */
  cvLabel: string | null;
  hasVideo: boolean;
}

function StatusChip({
  children,
  tone,
}: {
  children: ReactNode;
  tone: ReviewSummaryTone;
}) {
  const toneClass =
    tone === "ok"
      ? "border-[var(--status-dot-viewed)]/50 bg-[var(--status-wash-viewed)] text-[var(--ink)]"
      : tone === "warn"
        ? "border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]"
        : "border-[var(--ink)]/10 bg-[var(--paper)] text-[var(--muted)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

function SummaryGroup({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-[var(--white)] text-[0.65rem] font-semibold text-[var(--ink)]/70"
          aria-hidden
        >
          {step}
        </span>
        <h4 className="font-heading text-sm font-semibold tracking-[-0.02em] text-[var(--ink)]">
          {title}
        </h4>
      </div>
      <dl className="space-y-3 pl-[2.125rem]">{children}</dl>
    </div>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 min-w-0 text-sm font-medium text-[var(--ink)]">
        {children}
      </dd>
    </div>
  );
}

function recruiterFieldDisplay(
  included: boolean,
  value: string,
): { kind: "value"; text: string } | { kind: "chip"; text: string; tone: ReviewSummaryTone } {
  if (!included) return { kind: "chip", text: "Hidden", tone: "neutral" };
  const trimmed = value.trim();
  if (!trimmed) return { kind: "chip", text: "Empty", tone: "neutral" };
  return { kind: "value", text: trimmed };
}

export default function ApplicationReviewSummary({
  open,
  onOpenChange,
  company,
  role,
  slug,
  slugReady,
  fieldValues,
  include,
  hasProfilePicture,
  showProfilePicture,
  cvLabel,
  hasVideo,
}: ApplicationReviewSummaryProps) {
  const companyTrim = company.trim();
  const roleTrim = role.trim();
  const slugTrim = slug.trim();
  const roleHero =
    companyTrim || roleTrim
      ? `${companyTrim || "—"} · ${roleTrim || "—"}`
      : "—";

  const pictureChip = !hasProfilePicture
    ? { text: "None", tone: "neutral" as const }
    : showProfilePicture
      ? { text: "Shown", tone: "ok" as const }
      : { text: "Hidden", tone: "neutral" as const };

  return (
    <section className="rounded-xl bg-[var(--paper)]/60">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <h3 className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Summary
        </h3>
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="inline-flex shrink-0 cursor-pointer rounded p-1 text-[var(--muted)] hover:bg-[var(--ink)]/5 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          aria-expanded={open}
          aria-controls="application-review-summary"
          aria-label={
            open ? "Hide application summary" : "Show application summary"
          }
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
              {roleHero}
            </dd>
          </div>
          <SummaryRow label="Share slug">
            <div className="flex flex-wrap items-center gap-2">
              <span className="max-w-full truncate">{slugTrim || "—"}</span>
              {slugTrim ? (
                <StatusChip tone={slugReady ? "ok" : "warn"}>
                  {slugReady ? "Available" : "Not ready"}
                </StatusChip>
              ) : (
                <StatusChip tone="warn">Missing</StatusChip>
              )}
            </div>
          </SummaryRow>
        </SummaryGroup>

        <div className="border-t border-[var(--ink)]/10" role="separator" />

        <SummaryGroup step={2} title="About you">
          <SummaryRow label="Profile picture">
            <StatusChip tone={pictureChip.tone}>{pictureChip.text}</StatusChip>
          </SummaryRow>
          {RECRUITER_INFO_FIELDS.map(({ key, label }) => {
            const display = recruiterFieldDisplay(
              include[key],
              fieldValues[key] ?? "",
            );
            return (
              <SummaryRow key={key} label={label}>
                {display.kind === "chip" ? (
                  <StatusChip tone={display.tone}>{display.text}</StatusChip>
                ) : (
                  <span className="break-words">{display.text}</span>
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
              <StatusChip tone="warn">Missing</StatusChip>
            )}
          </SummaryRow>
        </SummaryGroup>

        <div className="border-t border-[var(--ink)]/10" role="separator" />

        <SummaryGroup step={4} title="Video">
          <SummaryRow label="YouTube intro">
            {hasVideo ? (
              <StatusChip tone="ok">Ready</StatusChip>
            ) : (
              <StatusChip tone="warn">Missing</StatusChip>
            )}
          </SummaryRow>
        </SummaryGroup>
      </div>
    </section>
  );
}
