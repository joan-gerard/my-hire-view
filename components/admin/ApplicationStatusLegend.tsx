'use client';

import { useId } from 'react';
import Link from 'next/link';
import AdminModal, { useAdminModalDismiss } from '@/components/admin/AdminModal';
import {
  APPLICATION_STATUS_LEGEND_ITEMS,
  CV_MISSING_LEGEND,
  PROFILE_PICTURE_MISSING_LEGEND,
  DRAFT_ACTION_LEGEND_ITEMS,
} from '@/lib/utils/application-status-display';
import {
  ApplicationStatusIconBadge,
  MissingCvBadge,
  MissingProfilePictureLegendMarker,
} from '@/components/admin/ApplicationStatusIcon';
import { requestAccountSettingsTab } from '@/lib/admin/account-settings-tabs';

export type ApplicationStatusLegendProps = {
  open: boolean;
  onClose: () => void;
};

function LegendDescription() {
  const dismiss = useAdminModalDismiss();
  return (
    <p>
      What the icons on each application card mean, and how draft actions differ
      from a live share link. Change the indicator style (colorful dots or
      high-contrast icons) under{' '}
      <Link
        href="/admin/profile"
        onClick={() => {
          requestAccountSettingsTab('preferences');
          dismiss();
        }}
        className="font-medium text-[var(--ink)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      >
        Account settings → Preferences
      </Link>
      .
    </p>
  );
}

/**
 * Modal help for dashboard status icons and draft card actions (F19-047).
 */
export default function ApplicationStatusLegend({
  open,
  onClose,
}: ApplicationStatusLegendProps) {
  const statusHeadingId = useId();
  const draftHeadingId = useId();

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Status icons & draft actions"
      description={<LegendDescription />}
    >
      <div className="space-y-6">
        <section aria-labelledby={statusHeadingId}>
          <h3
            id={statusHeadingId}
            className="px-1 font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]"
          >
            Status icons
          </h3>
          <ul className="mt-3 divide-y divide-[var(--ink)]/8">
            {APPLICATION_STATUS_LEGEND_ITEMS.map((item) => (
              <li
                key={item.key}
                className="flex items-start gap-3 px-1 py-3 first:pt-1 last:pb-1"
              >
                <ApplicationStatusIconBadge
                  visual={item.key}
                  label={item.label}
                  decorative
                />
                <div className="min-w-0 pt-1">
                  <p className="text-sm font-medium leading-snug text-[var(--ink)]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
            <li className="flex items-start gap-3 px-1 py-3 last:pb-1">
              <div className="flex h-9 shrink-0 items-center" aria-hidden>
                <MissingCvBadge />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium leading-snug text-[var(--ink)]">
                  {CV_MISSING_LEGEND.label}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
                  {CV_MISSING_LEGEND.description}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 px-1 py-3 last:pb-1">
              <div className="flex h-9 shrink-0 items-center">
                <MissingProfilePictureLegendMarker />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium leading-snug text-[var(--ink)]">
                  {PROFILE_PICTURE_MISSING_LEGEND.label}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
                  {PROFILE_PICTURE_MISSING_LEGEND.description}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section aria-labelledby={draftHeadingId}>
          <h3
            id={draftHeadingId}
            className="px-1 font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]"
          >
            Draft card actions
          </h3>
          <ul className="mt-3 divide-y divide-[var(--ink)]/8">
            {DRAFT_ACTION_LEGEND_ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-3 px-1 py-3 first:pt-1 last:pb-1"
              >
                <span className="mt-0.5 inline-flex h-9 shrink-0 items-center rounded-full border border-[var(--ink)]/12 bg-[var(--white)] px-2.5 text-xs font-semibold text-[var(--ink)]">
                  {item.label}
                </span>
                <p className="min-w-0 pt-2 text-sm leading-snug text-[var(--muted)]">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminModal>
  );
}
