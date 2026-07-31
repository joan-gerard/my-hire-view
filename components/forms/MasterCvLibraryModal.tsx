"use client";

import Button from "@/components/ui/Button";
import MasterCvLibrarySection from "@/components/forms/MasterCvLibrarySection";
import type { MasterCv } from "@/lib/types/master-cv";
import { MASTER_CV_MAX_PER_USER } from "@/lib/types/master-cv";
import { useEffect, useId, useRef } from "react";

export interface MasterCvLibraryModalProps {
  open: boolean;
  onClose: () => void;
  /** Fired when the library list changes (load / upload / delete). */
  onLibraryChange: (items: MasterCv[]) => void;
}

/**
 * Modal to manage the master CV library from application new/edit flows
 * so users need not leave for /admin/profile.
 */
export default function MasterCvLibraryModal({
  open,
  onClose,
  onLibraryChange,
}: MasterCvLibraryModalProps) {
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
            Master CV library
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/80">
            Upload up to {MASTER_CV_MAX_PER_USER} résumé PDFs to reuse across
            applications. Changes are saved to your library immediately.
          </p>
        </div>

        {open && (
          <MasterCvLibrarySection
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
