"use client";

import Button from "@/components/ui/Button";
import PrimaryCvLibrarySection from "@/components/forms/PrimaryCvLibrarySection";
import type { PrimaryCv } from "@/lib/types/primary-cv";
import { PRIMARY_CV_MAX_PER_USER } from "@/lib/types/primary-cv";
import { useEffect, useId, useRef } from "react";

export interface PrimaryCvLibraryModalProps {
  open: boolean;
  onClose: () => void;
  /** Fired when the library list changes (load / upload / delete). */
  onLibraryChange: (items: PrimaryCv[]) => void;
}

/**
 * Modal to manage the primary CV library from application new/edit flows
 * so users need not leave for /admin/profile.
 */
export default function PrimaryCvLibraryModal({
  open,
  onClose,
  onLibraryChange,
}: PrimaryCvLibraryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
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
      <div className="space-y-4 p-5">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            Primary CV library
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/80">
            Upload up to {PRIMARY_CV_MAX_PER_USER} résumé PDFs to reuse across
            applications. Changes are saved to your library immediately.
          </p>
        </div>

        {open && (
          <PrimaryCvLibrarySection
            embedded
            onLibraryChange={onLibraryChange}
          />
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--foreground)]/10 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </dialog>
  );
}
