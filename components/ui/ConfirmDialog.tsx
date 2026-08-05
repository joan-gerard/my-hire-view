"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Optional extra content below the message (e.g. a preview list). */
  children?: ReactNode;
  /** Primary button label (destructive / confirm). */
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, only show the confirm button (no cancel). */
  confirmOnly?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirm modal using a native `<dialog>`.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmOnly = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmedRef = useRef(false);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      confirmedRef.current = false;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      if (!confirmedRef.current) onCancel();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,28rem)] max-h-[min(90vh,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--foreground)]/15 bg-[var(--secondary-background)] p-0 text-[var(--foreground)] shadow-lg backdrop:bg-black/40"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          confirmedRef.current = false;
          onCancel();
        }
      }}
    >
      <div className="space-y-4 p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={messageId} className="text-sm text-[var(--foreground)]/80">
          {message}
        </p>
        {children}
        <div className="flex flex-wrap justify-end gap-2">
          {!confirmOnly && (
            <button
              type="button"
              onClick={() => {
                confirmedRef.current = false;
                onCancel();
              }}
              className="rounded-md border border-[var(--foreground)]/20 px-3 py-1.5 text-sm font-medium hover:bg-[var(--foreground)]/5"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              confirmedRef.current = true;
              onConfirm();
            }}
            className="rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary-text)] hover:opacity-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
