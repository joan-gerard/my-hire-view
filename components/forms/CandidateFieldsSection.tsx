"use client";

import AdminTooltip from "@/components/admin/AdminTooltip";
import { EyeIcon, EyeOffIcon } from "@/components/admin/icons";
import {
  ApplicationFormFieldRow,
  FieldLabelTip,
  PROFILE_EMPTY_TIP,
  PROFILE_INITIAL_DATA_TIP,
} from "@/components/forms/ApplicationFormSinglePageLayout";
import Link from "next/link";
import type { ReactNode } from "react";

export type CandidateFieldKey =
  | "first_name"
  | "last_name"
  | "location"
  | "portfolio_url"
  | "linkedin_url";

export interface CandidateFieldsSectionProps {
  values: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  onIncludeChange: (field: CandidateFieldKey, included: boolean) => void;
  /**
   * `rows` puts each label on the left and the control on the right.
   * Used on the one-page create/edit form.
   */
  layout?: "stack" | "rows";
  /** Rendered after names and before location / links (e.g. Picture). */
  afterNames?: ReactNode;
}

export const RECRUITER_INFO_FIELDS: {
  key: CandidateFieldKey;
  label: string;
  type: "text" | "url";
}[] = [
  { key: "first_name", label: "First name", type: "text" },
  { key: "last_name", label: "Last name", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { key: "portfolio_url", label: "Portfolio URL", type: "url" },
];

const SHARE_FIELDS: {
  key: Extract<CandidateFieldKey, "location" | "portfolio_url" | "linkedin_url">;
  label: string;
}[] = [
  { key: "location", label: "Location" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "portfolio_url", label: "Portfolio" },
];

const visibilityToggleClass =
  "inline-flex size-7 items-center justify-center rounded-lg border border-[var(--ink)]/15 bg-[var(--white)] shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

const profileLinkClass =
  "font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-2 hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

export function EditProfileLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/admin/profile" className={`${profileLinkClass} ${className}`}>
      Edit profile
    </Link>
  );
}

/** Slightly stronger fill than other dense About you fields (always shown). */
const alwaysShownValueClass = "bg-[var(--ink)]/[0.07] ring-[var(--ink)]/20";

const displayValueClass =
  "relative block w-full rounded-xl border-0 px-3.5 py-1.5 text-sm leading-6 ring-1 ring-inset sm:text-sm sm:leading-6";

function ReadOnlyValue({
  id,
  label,
  value,
  included,
  showOuterLabel,
  canToggle,
  alwaysShown = false,
  onIncludeChange,
}: {
  id: string;
  label: string;
  value: string;
  included: boolean;
  showOuterLabel: boolean;
  canToggle: boolean;
  /** Stronger field fill for values that cannot be hidden on this page. */
  alwaysShown?: boolean;
  onIncludeChange?: (included: boolean) => void;
}) {
  const trimmed = value.trim();
  const empty = !trimmed;
  const omitted = canToggle && !empty && !included;
  const tooltipLabel = included
    ? `Hide ${label} for this application`
    : `Show ${label} for this application`;
  const showToggle = canToggle && Boolean(onIncludeChange);

  if (empty) {
    return (
      <div className={showOuterLabel ? "space-y-1" : undefined}>
        {showOuterLabel ? (
          <p className="text-sm font-medium leading-[18px] text-[var(--ink)]">
            {label}
          </p>
        ) : null}
        <p
          className={`text-sm text-[var(--muted)] ${
            alwaysShown
              ? `${displayValueClass} ${alwaysShownValueClass}`
              : ""
          }`}
        >
          Not set on your profile.{" "}
          <EditProfileLink />
        </p>
      </div>
    );
  }

  return (
    <div className={showOuterLabel ? "space-y-1" : undefined}>
      {showOuterLabel ? (
        <p className="text-sm font-medium leading-[18px] text-[var(--ink)]">
          {label}
        </p>
      ) : null}
      <div
        id={id}
        className={`${displayValueClass} ${showToggle ? "pr-12" : ""} ${
          omitted
            ? "bg-[var(--paper)] text-[var(--muted)] ring-[var(--ink)]/10 line-through decoration-[var(--muted)]/70"
            : alwaysShown
              ? `${alwaysShownValueClass} text-[var(--ink)]`
              : "bg-[var(--ink)]/[0.02] text-[var(--ink)] ring-[var(--ink)]/15"
        } cursor-default select-text`}
        aria-label={label}
      >
        {trimmed}
        {showToggle && onIncludeChange ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <AdminTooltip label={tooltipLabel} side="top">
              <button
                type="button"
                role="switch"
                aria-checked={included}
                aria-label={tooltipLabel}
                onClick={() => onIncludeChange(!included)}
                className={`${visibilityToggleClass} cursor-pointer ${
                  included
                    ? "text-[var(--ink)] hover:bg-[var(--paper)]"
                    : "border-[var(--status-warning-fg)]/30 bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] hover:brightness-95"
                }`}
              >
                {included ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeOffIcon className="h-4 w-4" />
                )}
              </button>
            </AdminTooltip>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Profile-owned identity for an application (read-only on create/edit).
 * Names first (always shown when present), then optional `afterNames`
 * (e.g. Picture), then Location / LinkedIn / Portfolio with show/hide.
 * Change values on Profile.
 */
export default function CandidateFieldsSection({
  values,
  include,
  onIncludeChange,
  layout = "stack",
  afterNames,
}: CandidateFieldsSectionProps) {
  const tipFor = (field: CandidateFieldKey) => {
    const hasValue = Boolean((values[field] ?? "").trim());
    return hasValue
      ? { tip: PROFILE_INITIAL_DATA_TIP, tone: "ready" as const }
      : { tip: PROFILE_EMPTY_TIP, tone: "idle" as const };
  };

  const firstNameTip = tipFor("first_name");
  const lastNameTip = tipFor("last_name");

  if (layout === "rows") {
    return (
      <>
        <ApplicationFormFieldRow
          id="application-row-first_name"
          label="First name"
          labelFor="application-first-name"
          tip={firstNameTip.tip}
          tipTone={firstNameTip.tone}
          align="field"
        >
          <ReadOnlyValue
            id="application-first-name"
            label="First name"
            value={values.first_name}
            included
            showOuterLabel={false}
            canToggle={false}
            alwaysShown
          />
        </ApplicationFormFieldRow>
        <ApplicationFormFieldRow
          id="application-row-last_name"
          label="Last name"
          labelFor="application-last-name"
          tip={lastNameTip.tip}
          tipTone={lastNameTip.tone}
          align="field"
        >
          <ReadOnlyValue
            id="application-last-name"
            label="Last name"
            value={values.last_name}
            included
            showOuterLabel={false}
            canToggle={false}
            alwaysShown
          />
        </ApplicationFormFieldRow>
        {afterNames}
        {SHARE_FIELDS.map((field) => {
          const tip = tipFor(field.key);
          return (
            <ApplicationFormFieldRow
              key={field.key}
              id={`application-row-${field.key}`}
              label={field.label}
              labelFor={`application-${field.key}`}
              tip={tip.tip}
              tipTone={tip.tone}
              align="field"
            >
              <ReadOnlyValue
                id={`application-${field.key}`}
                label={field.label}
                value={values[field.key] ?? ""}
                included={include[field.key] ?? false}
                showOuterLabel={false}
                canToggle
                onIncludeChange={(included) =>
                  onIncludeChange(field.key, included)
                }
              />
            </ApplicationFormFieldRow>
          );
        })}
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-sm font-medium leading-[18px] text-[var(--ink)]">
          <FieldLabelTip tip={firstNameTip.tip} tone={firstNameTip.tone} />
          First name
        </p>
        <ReadOnlyValue
          id="application-first-name"
          label="First name"
          value={values.first_name}
          included
          showOuterLabel={false}
          canToggle={false}
          alwaysShown
        />
      </div>
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-sm font-medium leading-[18px] text-[var(--ink)]">
          <FieldLabelTip tip={lastNameTip.tip} tone={lastNameTip.tone} />
          Last name
        </p>
        <ReadOnlyValue
          id="application-last-name"
          label="Last name"
          value={values.last_name}
          included
          showOuterLabel={false}
          canToggle={false}
          alwaysShown
        />
      </div>
      {afterNames}
      {SHARE_FIELDS.map((field) => {
        const tip = tipFor(field.key);
        return (
          <div key={field.key} className="space-y-1">
            <p className="flex items-center gap-1.5 text-sm font-medium leading-[18px] text-[var(--ink)]">
              <FieldLabelTip tip={tip.tip} tone={tip.tone} />
              {field.label}
            </p>
            <ReadOnlyValue
              id={`application-${field.key}`}
              label={field.label}
              value={values[field.key] ?? ""}
              included={include[field.key] ?? false}
              showOuterLabel={false}
              canToggle
              onIncludeChange={(included) =>
                onIncludeChange(field.key, included)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
