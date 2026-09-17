'use client';

import { useEffect, useId, useRef } from 'react';
import {
  APPLICATION_STATUS_LEGEND_ITEMS,
  CV_MISSING_LEGEND,
  DRAFT_ACTION_LEGEND_ITEMS,
} from '@/lib/utils/application-status-display';
import {
  ApplicationStatusIconBadge,
  MissingCvBadge,
} from '@/components/admin/ApplicationStatusIcon';
import Button from '@/components/ui/Button';

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
    dialogRef.current?.close();
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
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,32rem)] max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--foreground)]/15 bg-[var(--secondary-background)] p-0 text-[var(--foreground)] shadow-lg backdrop:bg-black/40"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          requestDismiss();
        }
      }}
    >
      <div className="space-y-5 p-5">
        <div>
          <h2
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="text-lg font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]"
          >
            Status icons & draft actions
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/80">
            What the icons on each application card mean, and how draft actions
            differ from a live share link.
          </p>
        </div>

        <section aria-labelledby={statusHeadingId}>
          <h3
            id={statusHeadingId}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/55"
          >
            Status icons
          </h3>
          <ul className="space-y-3 text-sm">
            {APPLICATION_STATUS_LEGEND_ITEMS.map((item) => (
              <li key={item.key} className="flex items-start gap-3">
                <ApplicationStatusIconBadge
                  visual={item.key}
                  label={item.label}
                  decorative
                />
                <div className="min-w-0 pt-1">
                  <p className="font-medium text-[var(--foreground)]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[var(--foreground)]/70">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <div className="flex h-9 shrink-0 items-center" aria-hidden>
                <MissingCvBadge />
              </div>
              <div className="min-w-0 pt-1">
                <p className="font-medium text-[var(--foreground)]">
                  {CV_MISSING_LEGEND.label}
                </p>
                <p className="mt-0.5 text-[var(--foreground)]/70">
                  {CV_MISSING_LEGEND.description}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section aria-labelledby={draftHeadingId}>
          <h3
            id={draftHeadingId}
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/55"
          >
            Draft card actions
          </h3>
          <ul className="space-y-2.5 text-sm">
            {DRAFT_ACTION_LEGEND_ITEMS.map((item) => (
              <li key={item.label}>
                <p className="font-medium text-[var(--foreground)]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[var(--foreground)]/70">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--foreground)]/10 pt-4">
          <Button type="button" variant="secondary" onClick={requestDismiss}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
