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
 */
export default function ApplicationStatusLegend({
  open,
  onClose,
}: ApplicationStatusLegendProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const statusHeadingId = useId();
  const draftHeadingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

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
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,32rem)] max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--foreground)]/15 bg-[var(--secondary-background)] p-0 text-[var(--foreground)] shadow-lg backdrop:bg-black/40"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="space-y-5 p-5">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
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
              <div className="flex h-9 shrink-0 items-center">
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
