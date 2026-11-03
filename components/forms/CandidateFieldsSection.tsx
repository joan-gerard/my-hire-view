'use client';

import { ApplicationFormFieldRow } from '@/components/forms/ApplicationFormSinglePageLayout';
import ProfileLinkDialog, {
  type ProfileLinkField,
} from '@/components/forms/ProfileLinkDialog';
import Link from 'next/link';
import { useRef, useState } from 'react';

export type CandidateFieldKey =
  | 'first_name'
  | 'last_name'
  | 'location'
  | 'portfolio_url'
  | 'linkedin_url';

export interface CandidateFieldsSectionProps {
  values: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  onIncludeChange: (field: CandidateFieldKey, included: boolean) => void;
  /** Portfolio and LinkedIn added here are saved on the profile. */
  onProfileLinkSaved?: (field: ProfileLinkField, url: string) => void;
  /**
   * `rows` puts each label on the left and the value on the right.
   * Used on the one-page create form.
   */
  layout?: 'stack' | 'rows';
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
  emptyLabel: string;
  /** Empty state opens a profile-save dialog instead of leaving the form. */
  dialog?: ProfileLinkField;
}[] = [
  { key: 'location', label: 'Location', emptyLabel: 'location' },
  {
    key: 'portfolio_url',
    label: 'Portfolio',
    emptyLabel: 'portfolio',
    dialog: 'portfolio_url',
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn',
    emptyLabel: 'LinkedIn',
    dialog: 'linkedin_url',
  },
];

const choiceClass = (selected: boolean) =>
  selected
    ? 'rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-[var(--white)]'
    : 'rounded-full px-3 py-1 text-xs font-semibold text-[var(--muted)]';

const profileLinkClass =
  'rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]';

function ShareFieldBody({
  label,
  emptyLabel,
  value,
  included,
  dialog,
  showLabel,
  canSaveLink,
  onIncludeChange,
  onOpenDialog,
}: {
  label: string;
  emptyLabel: string;
  value: string;
  included: boolean;
  dialog?: ProfileLinkField;
  showLabel: boolean;
  canSaveLink: boolean;
  onIncludeChange: (included: boolean) => void;
  onOpenDialog: (trigger: HTMLButtonElement) => void;
}) {
  const switchButton = value ? (
    <button
      type="button"
      role="switch"
      aria-checked={included}
      aria-label={`Show ${label} to recruiters`}
      onClick={() => onIncludeChange(!included)}
      className="inline-flex rounded-full border border-[var(--ink)]/12 bg-[var(--white)] p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2"
    >
      <span className={choiceClass(included)}>Show</span>
      <span className={choiceClass(!included)}>Hidden</span>
    </button>
  ) : null;
  const empty = dialog && canSaveLink ? (
    <button
      type="button"
      className={`cursor-pointer ${profileLinkClass}`}
      aria-haspopup="dialog"
      onClick={(event) => onOpenDialog(event.currentTarget)}
    >
      Add {emptyLabel}
    </button>
  ) : (
    <Link href="/admin/profile" className={profileLinkClass}>
      Add {emptyLabel} on your profile
    </Link>
  );
  const valueNode = value ? (
    <p
      className={`text-sm break-all ${
        included ? 'text-[var(--ink)]' : 'text-[var(--muted)]'
      }`}
    >
      {value}
    </p>
  ) : (
    <p className="text-sm text-[var(--muted)]">{empty}</p>
  );

  if (!showLabel) {
    return switchButton ? (
      <div className="flex flex-wrap items-center justify-between gap-2">
        {valueNode}
        {switchButton}
      </div>
    ) : (
      valueNode
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
        {switchButton}
      </div>
      <div className="mt-0.5">{valueNode}</div>
    </div>
  );
}

/**
 * Profile-owned identity for an application.
 * Names are always shown. Location, portfolio, and LinkedIn can be hidden
 * on this page; their text is edited on Profile.
 */
export default function CandidateFieldsSection({
  values,
  include,
  onIncludeChange,
  onProfileLinkSaved,
  layout = 'stack',
}: CandidateFieldsSectionProps) {
  const [linkDialog, setLinkDialog] = useState<ProfileLinkField | null>(null);
  const linkTriggerRef = useRef<HTMLButtonElement | null>(null);
  const name = [values.first_name?.trim(), values.last_name?.trim()]
    .filter(Boolean)
    .join(' ');

  const nameBody = (
    <>
      {name ? (
        <p className="text-sm text-[var(--ink)]">{name}</p>
      ) : (
        <p className="text-sm text-[var(--muted)]">No name yet.</p>
      )}
      <p className="mt-0.5 text-sm text-[var(--muted)]">
        From your profile, and always shown.{' '}
        <Link href="/admin/profile" className={profileLinkClass}>
          Edit on Profile
        </Link>
      </p>
    </>
  );

  if (layout === 'rows') {
    return (
      <>
        <ApplicationFormFieldRow id="application-row-name" label="Name" align="top">
          {nameBody}
        </ApplicationFormFieldRow>
        {SHARE_FIELDS.map(({ key, label, emptyLabel, dialog }) => (
          <ApplicationFormFieldRow
            key={key}
            id={`application-row-${key}`}
            label={label}
            align="top"
          >
            <ShareFieldBody
              label={label}
              emptyLabel={emptyLabel}
              value={values[key]?.trim() ?? ''}
              included={include[key] ?? false}
              dialog={dialog}
              showLabel={false}
              canSaveLink={Boolean(onProfileLinkSaved)}
              onIncludeChange={(included) => onIncludeChange(key, included)}
              onOpenDialog={(trigger) => {
                linkTriggerRef.current = trigger;
                if (dialog) setLinkDialog(dialog);
              }}
            />
          </ApplicationFormFieldRow>
        ))}
        <ProfileLinkDialog
          open={linkDialog !== null}
          field={linkDialog}
          returnFocusRef={linkTriggerRef}
          onClose={() => setLinkDialog(null)}
          onSaved={(field, url) => onProfileLinkSaved?.(field, url)}
        />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">Name</p>
        <div className="mt-0.5">{nameBody}</div>
      </div>
      {SHARE_FIELDS.map(({ key, label, emptyLabel, dialog }) => (
        <ShareFieldBody
          key={key}
          label={label}
          emptyLabel={emptyLabel}
          value={values[key]?.trim() ?? ''}
          included={include[key] ?? false}
          dialog={dialog}
          showLabel
          canSaveLink={Boolean(onProfileLinkSaved)}
          onIncludeChange={(included) => onIncludeChange(key, included)}
          onOpenDialog={(trigger) => {
            linkTriggerRef.current = trigger;
            if (dialog) setLinkDialog(dialog);
          }}
        />
      ))}
      <ProfileLinkDialog
        open={linkDialog !== null}
        field={linkDialog}
        returnFocusRef={linkTriggerRef}
        onClose={() => setLinkDialog(null)}
        onSaved={(field, url) => onProfileLinkSaved?.(field, url)}
      />
    </div>
  );
}
