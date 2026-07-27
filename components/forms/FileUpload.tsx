'use client';

import { useState, useRef, useEffect } from 'react';

interface FileUploadProps {
  /** Saved CV URL (from server). Shown when no pending file is selected. */
  value?: string;
  /** Called when user selects a file (not uploaded yet; upload happens on form submit). */
  pendingFile?: File | null;
  onPendingFileChange: (file: File | null) => void;
  /** When false, hide the View link (e.g. CV missing in storage). When true or undefined, show View if value is set. */
  cvUrlExists?: boolean;
  /** When provided and cvUrlExists is false, show a "Check again" button to re-run the existence check. */
  onRetryCvCheck?: () => Promise<void>;
  error?: string;
  /** Hide the top "CV (PDF)" label when nested in CvSourceField. */
  hideLabel?: boolean;
  /** Custom label for the file input affordance (accessibility / helper text). */
  chooseLabel?: string;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function FileUpload({
  value,
  pendingFile,
  onPendingFileChange,
  cvUrlExists = true,
  onRetryCvCheck,
  error,
  hideLabel = false,
  chooseLabel = "CV (PDF)",
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checkingCv, setCheckingCv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Create/revoke object URL for preview when pendingFile changes
  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onPendingFileChange(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      alert('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    onPendingFileChange(file);
  };

  const handleClearPending = () => {
    onPendingFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openPreview = () => {
    dialogRef.current?.showModal();
  };

  const closePreview = () => {
    dialogRef.current?.close();
  };

  const showPending = !!pendingFile;
  const showSaved = !showPending && !!value;
  const canPreview = showPending && previewUrl;

  return (
    <div>
      {!hideLabel && (
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {chooseLabel}
        </label>
      )}
      <div className={hideLabel ? "flex flex-col gap-2" : "mt-1 flex flex-col gap-2"}>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            aria-label={chooseLabel}
            className="block w-full text-sm text-[var(--foreground)]/60 file:mr-4 file:rounded-md file:border-0 file:bg-[var(--brand-secondary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--foreground)] hover:file:opacity-90"
          />
          {showPending && (
            <button
              type="button"
              onClick={handleClearPending}
              className="text-sm text-[var(--foreground)]/80 hover:text-[var(--foreground)] underline"
            >
              Remove selection
            </button>
          )}
        </div>

        {showPending && pendingFile && (
          <div className="rounded border border-[var(--foreground)]/10 bg-[var(--background)] p-3">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Selected: {pendingFile.name}
            </p>
            <p className="text-xs text-[var(--foreground)]/60 mt-0.5">
              File will be uploaded when you save the application.
            </p>
            {canPreview && (
              <button
                type="button"
                onClick={openPreview}
                className="mt-2 text-sm text-[var(--brand-primary)] hover:opacity-80 hover:underline"
              >
                Preview PDF
              </button>
            )}
          </div>
        )}

        {canPreview && (
          <dialog
            ref={dialogRef}
            onCancel={closePreview}
            className="w-[90vw] max-w-4xl rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-0 shadow-xl backdrop:bg-black/50"
          >
            <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 px-4 py-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                CV preview
              </span>
              <button
                type="button"
                onClick={closePreview}
                className="rounded px-2 py-1 text-sm text-[var(--foreground)]/80 hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                aria-label="Close preview"
              >
                Close
              </button>
            </div>
            <div className="p-2">
              <iframe
                src={previewUrl!}
                title="CV preview"
                className="h-[70vh] w-full rounded border border-[var(--foreground)]/10"
              />
            </div>
          </dialog>
        )}

        {showSaved && cvUrlExists && (
          <p className="text-sm text-[var(--foreground)]/80">
            CV uploaded:{' '}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-primary)] hover:underline"
            >
              View
            </a>
          </p>
        )}
        {showSaved && !cvUrlExists && (
          <div
            role="alert"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            <p className="font-semibold">CV file not found in storage</p>
            <p className="mt-0.5 text-amber-800">
              The file may have been removed from storage (e.g. Cloudflare R2).
              Please upload a new CV below to replace it.
            </p>
            {onRetryCvCheck && (
              <>
                <p className="mt-2 text-xs text-amber-700">
                  If this might be a temporary issue (e.g. network), you can check again.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setCheckingCv(true);
                    await onRetryCvCheck();
                    setCheckingCv(false);
                  }}
                  disabled={checkingCv}
                  className="mt-2 rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  {checkingCv ? 'Checking…' : 'Check again'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
