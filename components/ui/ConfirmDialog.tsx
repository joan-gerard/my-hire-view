"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Button from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  /** Optional extra content below the message (e.g. a preview list). */
  children?: ReactNode;
  /** Primary button label (destructive / confirm). */
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, only show the confirm button (no cancel). */
  confirmOnly?: boolean;
  /**
   * While true, confirm shows a spinner + loading label, cancel is disabled,
   * and Escape / backdrop dismiss are blocked.
   */
  confirming?: boolean;
  /** Label while `confirming` is true. Defaults to "Working…". */
  confirmLoadingLabel?: string;
  /** Confirm button look. Use `danger` for irreversible deletes. */
  confirmVariant?: "primary" | "danger";
  /**
   * Optional middle action (e.g. Save Draft on leave confirm), between
   * cancel and confirm.
   */
  midActionLabel?: string;
  midActionLoading?: boolean;
  midActionLoadingLabel?: string;
  midActionDisabled?: boolean;
  onMidAction?: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirm modal using a native `<dialog>`.
 *
 * Dismissal (Cancel, backdrop, Escape) always goes through `dialog.close()`;
 * `onCancel` is emitted only from the `close` listener so each cancel runs once
 * (F25-058). Confirm sets a flag so the same listener does not call `onCancel`.
 * While `confirming`, dismiss paths are blocked so in-flight work can finish.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmOnly = false,
  confirming = false,
  confirmLoadingLabel = "Working…",
  confirmVariant = "primary",
  midActionLabel,
  midActionLoading = false,
  midActionLoadingLabel = "Saving…",
  midActionDisabled = false,
  onMidAction,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmedRef = useRef(false);
  const cancelEmittedRef = useRef(false);
  const confirmingRef = useRef(confirming);
  const midActionLoadingRef = useRef(midActionLoading);
  const titleId = useId();
  const messageId = useId();

  confirmingRef.current = confirming;
  midActionLoadingRef.current = midActionLoading;

  const requestDismiss = () => {
    if (confirmingRef.current || midActionLoadingRef.current) return;
    confirmedRef.current = false;
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      confirmedRef.current = false;
      cancelEmittedRef.current = false;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      if (confirmedRef.current || cancelEmittedRef.current) return;
      cancelEmittedRef.current = true;
      onCancel();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,28rem)] max-h-[min(90vh,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-[var(--ink)]/8 bg-[var(--white)] p-0 text-[var(--ink)] shadow-lg backdrop:bg-black/40"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      aria-busy={confirming || undefined}
      onCancel={(e) => {
        if (confirmingRef.current || midActionLoadingRef.current) {
          e.preventDefault();
          return;
        }
        // Escape closes natively; clear the confirm flag so the `close` listener
        // still emits onCancel (e.g. after a failed confirm left confirmedRef true).
        confirmedRef.current = false;
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          requestDismiss();
        }
      }}
    >
      <div className="space-y-4 p-5">
        <h2
          id={titleId}
          className="font-heading text-lg font-semibold tracking-[-0.02em]"
        >
          {title}
        </h2>
        <div id={messageId} className="space-y-2 text-sm text-[var(--muted)]">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
        {children}
        <div className="flex flex-wrap justify-end gap-2">
          {!confirmOnly && (
            <Button
              type="button"
              variant="secondary"
              disabled={confirming || midActionLoading}
              onClick={requestDismiss}
            >
              {cancelLabel}
            </Button>
          )}
          {midActionLabel ? (
            <Button
              type="button"
              variant="secondary"
              loading={midActionLoading}
              loadingLabel={midActionLoadingLabel}
              disabled={
                confirming ||
                midActionDisabled ||
                midActionLoading ||
                !onMidAction
              }
              onClick={() => {
                if (
                  !onMidAction ||
                  confirmingRef.current ||
                  midActionLoadingRef.current ||
                  midActionDisabled
                ) {
                  return;
                }
                onMidAction();
              }}
            >
              {midActionLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={confirmVariant}
            loading={confirming}
            loadingLabel={confirmLoadingLabel}
            disabled={midActionLoading}
            onClick={() => {
              if (confirmingRef.current || midActionLoadingRef.current) {
                return;
              }
              confirmedRef.current = true;
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
