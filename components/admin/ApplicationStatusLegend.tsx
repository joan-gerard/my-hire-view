'use client';

import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import {
  APPLICATION_STATUS_LEGEND_ITEMS,
  CV_MISSING_LEGEND,
  PROFILE_PICTURE_MISSING_LEGEND,
  DRAFT_ACTION_LEGEND_ITEMS,
} from '@/lib/utils/application-status-display';
import {
  ApplicationStatusIconBadge,
  MissingCvBadge,
  MissingProfilePictureBadge,
} from '@/components/admin/ApplicationStatusIcon';
import {
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
} from '@/components/admin/admin-chrome';
import { requestAccountSettingsTab } from '@/lib/admin/account-settings-tabs';

export type ApplicationStatusLegendProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Modal help for dashboard status icons and draft card actions (F19-047).
 *
 * Dismissal (Close, backdrop, Escape) goes through `dialog.close()`;
 * `onClose` is emitted only from the native `close` event so it runs once.
 */
export default function ApplicationStatusLegend({
  open,
  onClose,
}: ApplicationStatusLegendProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeEmittedRef = useRef(false);
  const titleId = useId();
  const statusHeadingId = useId();
  const draftHeadingId = useId();

  const requestDismiss = () => {
    const dialog = dialogRef.current;
    if (!dialog) {
      onClose();
      return;
    }
    if (dialog.open) {
      dialog.close();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      closeEmittedRef.current = false;
      dialog.showModal();
      // Prefer the heading over Close; suppress the open-time focus ring (FocusOptions.focusVisible).
      const title = titleRef.current;
      if (title) {
        title.focus({
          preventScroll: true,
          focusVisible: false,
        } as FocusOptions & { focusVisible?: boolean });
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      if (closeEmittedRef.current) return;
      closeEmittedRef.current = true;
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,32rem)] max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40 open:flex open:flex-col"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          requestDismiss();
        }
      }}
    >
      {/* Inner panel keeps chrome; dialog stays transparent so light-dismiss / display rules work. */}
      <div
        className={`flex max-h-[min(90vh,40rem)] w-full flex-col overflow-hidden text-[var(--ink)] shadow-[0_12px_40px_-16px_rgba(11,11,12,0.28)] ${ADMIN_PANEL_CLASS}`}
      >
        <header className="shrink-0 border-b border-[var(--ink)]/8 px-5 pb-4 pt-5 sm:px-6">
          <h2
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="font-heading text-lg font-semibold tracking-[-0.02em] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            Status icons & draft actions
          </h2>
          <p className="mt-1.5 text-sm leading-snug text-[var(--muted)]">
            What the icons on each application card mean, and how draft actions
            differ from a live share link. Change the indicator style (colorful
            dots or high-contrast icons) under{' '}
            <Link
              href="/admin/profile"
              onClick={() => {
                requestAccountSettingsTab("preferences");
                requestDismiss();
              }}
              className="font-medium text-[var(--ink)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            >
              Account settings → Preferences
            </Link>
            .
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
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
                <div className="flex h-9 shrink-0 items-center" aria-hidden>
                  <MissingProfilePictureBadge />
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

        <footer className="relative z-10 flex shrink-0 justify-end border-t border-[var(--ink)]/8 bg-[var(--white)] px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={requestDismiss}
            className={ADMIN_SECONDARY_CLASS}
          >
            Close
          </button>
        </footer>
      </div>
    </dialog>
  );
}
