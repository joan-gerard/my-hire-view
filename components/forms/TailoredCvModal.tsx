"use client";

import AdminModal from "@/components/admin/AdminModal";
import FileUpload from "@/components/forms/FileUpload";
import Button from "@/components/ui/Button";
import type { RefObject } from "react";

export interface TailoredCvModalProps {
  open: boolean;
  onClose: () => void;
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void | Promise<void>;
  /** Saved tailored URL on edit (shown when no new file is pending). */
  savedUrl?: string;
  cvUrlExists?: boolean;
  uploading?: boolean;
  preparing?: boolean;
  disabled?: boolean;
  error?: string;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Modal to pick a PDF just for this application — same chrome pattern as
 * Manage library. Close with Done (or Escape / backdrop).
 */
export default function TailoredCvModal({
  open,
  onClose,
  pendingFile,
  onPendingFileChange,
  savedUrl,
  cvUrlExists = true,
  uploading = false,
  preparing = false,
  disabled = false,
  error,
  returnFocusRef,
}: TailoredCvModalProps) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      returnFocusRef={returnFocusRef}
      title="PDF for this role"
      description="Choose a résumé PDF used only for this application. It uploads when you save."
      widthClassName="w-[min(100vw-2rem,28rem)]"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <FileUpload
        value={savedUrl}
        pendingFile={pendingFile}
        onPendingFileChange={onPendingFileChange}
        cvUrlExists={cvUrlExists}
        hideLabel
        chooseLabel="Choose a PDF"
        uploading={uploading}
        preparing={preparing}
        disabled={disabled}
        error={error}
      />
    </AdminModal>
  );
}
