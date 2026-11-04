'use client';

import AdminTooltip from '@/components/admin/AdminTooltip';
import { EyeIcon, EyeOffIcon } from '@/components/admin/icons';
import {
  ApplicationFormFieldRow,
  FieldLabelTip,
  PROFILE_EMPTY_TIP,
  PROFILE_INITIAL_DATA_TIP,
  PROFILE_WRITE_THROUGH_TIP,
  type FieldLabelTipTone,
} from '@/components/forms/ApplicationFormSinglePageLayout';
import Input from '@/components/ui/Input';
import {
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from '@/lib/types/profile';
import {
  linkedInUrlFieldWarning,
  portfolioUrlFieldWarning,
} from '@/lib/utils/profile-link-url';

export type CandidateFieldKey =
  | 'first_name'
  | 'last_name'
  | 'location'
  | 'portfolio_url'
  | 'linkedin_url';

export interface CandidateFieldsSectionProps {
  values: Record<CandidateFieldKey, string>;
  /**
   * Last identity written to the profile (or loaded into the form).
   * The write-through tip shows only when a field differs from this.
   */
  savedValues: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  onIncludeChange: (field: CandidateFieldKey, included: boolean) => void;
  onValueChange: (field: CandidateFieldKey, value: string) => void;
  errors?: Partial<Record<CandidateFieldKey, string>>;
  /**
   * `rows` puts each label on the left and the control on the right.
   * Used on the one-page create form.
   */
  layout?: 'stack' | 'rows';
}

function identityFieldPending(
  values: Record<CandidateFieldKey, string>,
  savedValues: Record<CandidateFieldKey, string>,
  field: CandidateFieldKey,
): boolean {
  return (values[field] ?? '').trim() !== (savedValues[field] ?? '').trim();
}

/**
 * Green = unchanged prefilled profile data.
 * Yellow = edited, awaiting save.
 * Grey = still empty.
 */
function identityFieldTip(
  values: Record<CandidateFieldKey, string>,
  savedValues: Record<CandidateFieldKey, string>,
  field: CandidateFieldKey,
): { tip: string; tone: FieldLabelTipTone } {
  const saved = (savedValues[field] ?? '').trim();
  const pending = identityFieldPending(values, savedValues, field);
  if (pending) {
    return { tip: PROFILE_WRITE_THROUGH_TIP, tone: 'draft' };
  }
  if (saved) {
    return { tip: PROFILE_INITIAL_DATA_TIP, tone: 'ready' };
  }
  return { tip: PROFILE_EMPTY_TIP, tone: 'idle' };
}

export const RECRUITER_INFO_FIELDS: {
  key: CandidateFieldKey;
  label: string;
  type: 'text' | 'url';
}[] = [
  { key: 'first_name', label: 'First name', type: 'text' },
  { key: 'last_name', label: 'Last name', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'portfolio_url', label: 'Portfolio URL', type: 'url' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
];

const SHARE_FIELDS: {
  key: Extract<CandidateFieldKey, 'location' | 'portfolio_url' | 'linkedin_url'>;
  label: string;
  /** Always `text` so we use our under-field warnings, not the browser URL bubble. */
  inputType: 'text';
  inputMode?: 'text' | 'url';
  placeholder: string;
  maxLength: number;
  autoComplete: string;
}[] = [
  {
    key: 'location',
    label: 'Location',
    inputType: 'text',
    placeholder: 'City, country',
    maxLength: PROFILE_LOCATION_MAX_LENGTH,
    autoComplete: 'address-level2',
  },
  {
    key: 'portfolio_url',
    label: 'Portfolio',
    inputType: 'text',
    inputMode: 'url',
    placeholder: 'https://yoursite.com',
    maxLength: PROFILE_URL_MAX_LENGTH,
    autoComplete: 'url',
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn',
    inputType: 'text',
    inputMode: 'url',
    placeholder: 'https://www.linkedin.com/in/…',
    maxLength: PROFILE_URL_MAX_LENGTH,
    autoComplete: 'url',
  },
];

const visibilityToggleClass =
  'inline-flex size-7 items-center justify-center rounded-lg border border-[var(--ink)]/15 bg-[var(--white)] shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]';

function shareWarning(
  key: (typeof SHARE_FIELDS)[number]['key'],
  value: string,
): string | undefined {
  if (key === 'portfolio_url') {
    return portfolioUrlFieldWarning(value) ?? undefined;
  }
  if (key === 'linkedin_url') {
    return linkedInUrlFieldWarning(value) ?? undefined;
  }
  return undefined;
}

function ShareFieldControl({
  fieldKey,
  label,
  inputId,
  inputType,
  inputMode = 'text',
  placeholder,
  maxLength,
  autoComplete,
  value,
  included,
  error,
  showOuterLabel,
  showWriteThroughTip,
  writeThroughTip = PROFILE_WRITE_THROUGH_TIP,
  writeThroughTipTone = 'draft',
  onValueChange,
  onIncludeChange,
}: {
  fieldKey: (typeof SHARE_FIELDS)[number]['key'];
  label: string;
  inputId: string;
  inputType: 'text';
  inputMode?: 'text' | 'url';
  placeholder: string;
  maxLength: number;
  autoComplete: string;
  value: string;
  included: boolean;
  error?: string;
  showOuterLabel: boolean;
  showWriteThroughTip: boolean;
  writeThroughTip?: string;
  writeThroughTipTone?: FieldLabelTipTone;
  onValueChange: (value: string) => void;
  onIncludeChange: (included: boolean) => void;
}) {
  const trimmed = value.trim();
  const warning = error ? undefined : shareWarning(fieldKey, value);
  const showToggle = Boolean(trimmed);
  const tooltipLabel = included
    ? `Hide ${label} from recruiters`
    : `Show ${label} to recruiters`;

  return (
    <Input
      id={inputId}
      dense
      label={showOuterLabel ? label : undefined}
      labelEnd={
        showOuterLabel && showWriteThroughTip ? (
          <FieldLabelTip tip={writeThroughTip} tone={writeThroughTipTone} />
        ) : undefined
      }
      type={inputType}
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      maxLength={maxLength}
      value={value}
      error={error}
      warning={warning}
      onChange={(event) => onValueChange(event.target.value)}
      endAdornment={
        showToggle ? (
          <AdminTooltip label={tooltipLabel} side="top">
            <button
              type="button"
              role="switch"
              aria-checked={included}
              aria-label={tooltipLabel}
              onClick={() => onIncludeChange(!included)}
              className={`${visibilityToggleClass} cursor-pointer text-[var(--ink)] hover:bg-[var(--paper)]`}
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
 * Profile-owned identity for an application.
 * Names are always shown. Location, portfolio, and LinkedIn can be hidden
 * on this page. Edits sync back to the profile when the application is saved.
 */
export default function CandidateFieldsSection({
  values,
  savedValues,
  include,
  onIncludeChange,
  onValueChange,
  errors,
  layout = 'stack',
}: CandidateFieldsSectionProps) {
  const tipFor = (field: CandidateFieldKey) =>
    identityFieldTip(values, savedValues, field);

  const firstNameTip = tipFor('first_name');
  const lastNameTip = tipFor('last_name');

  if (layout === 'rows') {
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
          <Input
            id="application-first-name"
            dense
            required
            autoComplete="given-name"
            maxLength={PROFILE_NAME_MAX_LENGTH}
            value={values.first_name}
            error={errors?.first_name}
            onChange={(event) =>
              onValueChange('first_name', event.target.value)
            }
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
          <Input
            id="application-last-name"
            dense
            required
            autoComplete="family-name"
            maxLength={PROFILE_NAME_MAX_LENGTH}
            value={values.last_name}
            error={errors?.last_name}
            onChange={(event) => onValueChange('last_name', event.target.value)}
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
            <ShareFieldControl
              fieldKey={field.key}
              label={field.label}
              inputId={`application-${field.key}`}
              inputType={field.inputType}
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              autoComplete={field.autoComplete}
              value={values[field.key] ?? ''}
              included={include[field.key] ?? false}
              error={errors?.[field.key]}
              showOuterLabel={false}
              showWriteThroughTip={false}
              onValueChange={(value) => onValueChange(field.key, value)}
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
      <Input
        id="application-first-name"
        dense
        label="First name"
        labelEnd={
          <FieldLabelTip tip={firstNameTip.tip} tone={firstNameTip.tone} />
        }
        required
        autoComplete="given-name"
        maxLength={PROFILE_NAME_MAX_LENGTH}
        value={values.first_name}
        error={errors?.first_name}
        onChange={(event) => onValueChange('first_name', event.target.value)}
      />
      <Input
        id="application-last-name"
        dense
        label="Last name"
        labelEnd={
          <FieldLabelTip tip={lastNameTip.tip} tone={lastNameTip.tone} />
        }
        required
        autoComplete="family-name"
        maxLength={PROFILE_NAME_MAX_LENGTH}
        value={values.last_name}
        error={errors?.last_name}
        onChange={(event) => onValueChange('last_name', event.target.value)}
      />
      {SHARE_FIELDS.map((field) => {
        const tip = tipFor(field.key);
        return (
          <ShareFieldControl
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            inputId={`application-${field.key}`}
            inputType={field.inputType}
            inputMode={field.inputMode}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            autoComplete={field.autoComplete}
            value={values[field.key] ?? ''}
            included={include[field.key] ?? false}
            error={errors?.[field.key]}
            showOuterLabel
            showWriteThroughTip
            writeThroughTip={tip.tip}
            writeThroughTipTone={tip.tone}
            onValueChange={(value) => onValueChange(field.key, value)}
            onIncludeChange={(included) => onIncludeChange(field.key, included)}
          />
        );
      })}
    </div>
  );
}
