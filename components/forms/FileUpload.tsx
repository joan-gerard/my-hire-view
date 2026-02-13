'use client';

import { useState, useRef, useEffect } from 'react';

interface FileUploadProps {
  /** Saved CV URL (from server). Shown when no pending file is selected. */
  value?: string;
  /** Called when user selects a file (not uploaded yet; upload happens on form submit). */
  pendingFile?: File | null;
  onPendingFileChange: (file: File | null) => void;
  error?: string;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function FileUpload({
  value,
  pendingFile,
  onPendingFileChange,
  error,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      <label className="block text-sm font-medium text-gray-700">
        CV (PDF)
      </label>
      <div className="mt-1 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          {showPending && (
            <button
              type="button"
              onClick={handleClearPending}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Remove selection
            </button>
          )}
        </div>

        {showPending && pendingFile && (
          <div className="rounded border border-gray-200 bg-gray-50/80 p-3">
            <p className="text-sm font-medium text-gray-700">
              Selected: {pendingFile.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              File will be uploaded when you save the application.
            </p>
            {canPreview && (
              <button
                type="button"
                onClick={openPreview}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
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
            className="w-[90vw] max-w-4xl rounded-lg border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
              <span className="text-sm font-medium text-gray-700">
                CV preview
              </span>
              <button
                type="button"
                onClick={closePreview}
                className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close preview"
              >
                Close
              </button>
            </div>
            <div className="p-2">
              <iframe
                src={previewUrl!}
                title="CV preview"
                className="h-[70vh] w-full rounded border border-gray-200"
              />
            </div>
          </dialog>
        )}

        {showSaved && (
          <p className="text-sm text-gray-600">
            CV uploaded:{' '}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View
            </a>
          </p>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
