"use client";

import { useEffect, useId, useRef } from "react";
import InsightItem from "./InsightItem";
import {
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
} from "@/components/admin/admin-chrome";

export interface ApplicationCardInsightsProps {
  open: boolean;
  onClose: () => void;
  /** Shown in the dialog title for context. */
  applicationLabel: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  /** Last time the page was viewed by a non-owner (null if never viewed). */
  lastViewedAt: string | null;
}

/**
 * Application insights in a modal dialog (same dismiss pattern as status legend).
 */
export default function ApplicationCardInsights({
  open,
  onClose,
  applicationLabel,
  viewCount,
  downloadCount,
  createdAt,
  lastViewedAt,
}: ApplicationCardInsightsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeEmittedRef = useRef(false);
  const titleId = useId();

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
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,28rem)] max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40 open:flex open:flex-col"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          requestDismiss();
        }
      }}
    >
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
            Insights
          </h2>
          <p className="mt-1.5 truncate text-sm leading-snug text-[var(--muted)]">
            {applicationLabel}
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
          <InsightItem label="Views:">{viewCount}</InsightItem>
          <InsightItem label="CV downloads:">{downloadCount}</InsightItem>
          <InsightItem label="Created:">
            {new Date(createdAt).toLocaleDateString()}
          </InsightItem>
          <InsightItem label="Last viewed:">
            {lastViewedAt
              ? new Date(lastViewedAt).toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "—"}
          </InsightItem>
        </div>

        <footer className="shrink-0 border-t border-[var(--ink)]/8 px-5 py-4 sm:px-6">
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
