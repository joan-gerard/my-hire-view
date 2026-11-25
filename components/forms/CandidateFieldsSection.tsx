"use client";

import {
  ApplicationFormFieldRow,
  FieldLabelTip,
  PROFILE_EMPTY_TIP,
  PROFILE_INITIAL_DATA_TIP,
  RequiredFieldMark,
} from "@/components/forms/ApplicationFormSinglePageLayout";
import VisibilityToggle from "@/components/forms/VisibilityToggle";
import Link from "next/link";
import type { ReactNode } from "react";

export type CandidateFieldKey =
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
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
  /**
   * Red asterisk on First / Last name. On create/draft, names are publish-only
   * so leave this false; live edit needs them to save.
   */
  markNamesRequired?: boolean;
}

export const RECRUITER_INFO_FIELDS: {
  key: CandidateFieldKey;
  label: string;
  type: "text" | "url" | "email" | "tel";
}[] = [
  { key: "first_name", label: "First name", type: "text" },
  { key: "last_name", label: "Last name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "location", label: "Location", type: "text" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { key: "portfolio_url", label: "Portfolio URL", type: "url" },
];

const SHARE_FIELDS: {
  key: Extract<
    CandidateFieldKey,
    "email" | "phone" | "location" | "portfolio_url" | "linkedin_url"
  >;
  label: string;
}[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "portfolio_url", label: "Portfolio" },
];

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
    <div
      className={
        showToggle ? "space-y-2" : showOuterLabel ? "space-y-1" : undefined
      }
    >
      {showOuterLabel ? (
        <p className="text-sm font-medium leading-[18px] text-[var(--ink)]">
          {label}
        </p>
      ) : null}
      <div
        id={id}
        className={`${displayValueClass} ${
          omitted
            ? "bg-[var(--paper)] text-[var(--muted)] ring-[var(--ink)]/10 line-through decoration-[var(--muted)]/70"
            : alwaysShown
              ? `${alwaysShownValueClass} text-[var(--ink)]`
              : "bg-[var(--ink)]/[0.02] text-[var(--ink)] ring-[var(--ink)]/15"
        } cursor-default select-text`}
        aria-label={label}
      >
        {trimmed}
      </div>
      {showToggle && onIncludeChange ? (
        <div className="flex justify-end">
          <VisibilityToggle
            visible={included}
            onVisibleChange={onIncludeChange}
            subjectLabel={label}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Profile-owned identity for an application (read-only on create/edit).
 * Names first (always shown when present), then optional `afterNames`
 * (e.g. Picture), then Email / Phone / Location / LinkedIn / Portfolio
 * with show/hide. Change values on Profile.
 */
export default function CandidateFieldsSection({
  values,
  include,
  onIncludeChange,
  layout = "stack",
  afterNames,
  markNamesRequired = true,
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
          required={markNamesRequired}
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
          required={markNamesRequired}
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
          {markNamesRequired ? <RequiredFieldMark /> : null}
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
          {markNamesRequired ? <RequiredFieldMark /> : null}
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
