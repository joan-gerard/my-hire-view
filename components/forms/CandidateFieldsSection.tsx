"use client";

import AdminTooltip from "@/components/admin/AdminTooltip";
import { EyeIcon, EyeOffIcon } from "@/components/admin/icons";
import {
  ApplicationFormFieldRow,
  FieldLabelTip,
  PROFILE_EMPTY_TIP,
  PROFILE_INITIAL_DATA_TIP,
} from "@/components/forms/ApplicationFormSinglePageLayout";
import Input from "@/components/ui/Input";
import Link from "next/link";

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

function EditProfileLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/admin/profile" className={`${profileLinkClass} ${className}`}>
      Edit profile
    </Link>
  );
}

function ReadOnlyValue({
  id,
  label,
  value,
  included,
  showOuterLabel,
  canToggle,
  onIncludeChange,
}: {
  id: string;
  label: string;
  value: string;
  included: boolean;
  showOuterLabel: boolean;
  canToggle: boolean;
  onIncludeChange?: (included: boolean) => void;
}) {
  const trimmed = value.trim();
  const empty = !trimmed;
  const omitted = canToggle && !empty && !included;
  const tooltipLabel = included
    ? `Hide ${label} for this application`
    : `Show ${label} for this application`;

  if (empty) {
    return (
      <div className={showOuterLabel ? "space-y-1" : undefined}>
        {showOuterLabel ? (
          <p className="text-sm font-medium leading-[18px] text-[var(--ink)]">
            {label}
          </p>
        ) : null}
        <p className="text-sm text-[var(--muted)]">
          Not set on your profile.{" "}
          <EditProfileLink />
        </p>
      </div>
    );
  }

  return (
    <Input
      id={id}
      dense
      label={showOuterLabel ? label : undefined}
      type="text"
      readOnly
      value={trimmed}
      omitted={omitted}
      aria-label={label}
      endAdornment={
        canToggle && onIncludeChange ? (
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
        ) : undefined
      }
    />
  );
}

/**
 * Profile-owned identity for an application (read-only on create/edit).
 * Names are always shown when present. Location, LinkedIn, and Portfolio can
 * be hidden on this page. Change values on Profile.
 */
export default function CandidateFieldsSection({
  values,
  include,
  onIncludeChange,
  layout = "stack",
}: CandidateFieldsSectionProps) {
  const tipFor = (field: CandidateFieldKey) => {
    const hasValue = Boolean((values[field] ?? "").trim());
    return hasValue
      ? { tip: PROFILE_INITIAL_DATA_TIP, tone: "ready" as const }
      : { tip: PROFILE_EMPTY_TIP, tone: "idle" as const };
  };

  const firstNameTip = tipFor("first_name");
  const lastNameTip = tipFor("last_name");

  const editProfileRow = (
    <div className="flex justify-end">
      <EditProfileLink className="text-sm" />
    </div>
  );

  if (layout === "rows") {
    return (
      <>
        {editProfileRow}
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
          />
        </ApplicationFormFieldRow>
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
      {editProfileRow}
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
        />
      </div>
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
