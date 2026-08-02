"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/forms/FileUpload";
import PrimaryCvLibraryModal from "@/components/forms/PrimaryCvLibraryModal";
import { getCvDownloadFilename } from "@/lib/utils/cv-filename";
import type { ApplicationCvType } from "@/lib/types/application";
import type { PrimaryCv } from "@/lib/types/primary-cv";
import { useState } from "react";

interface CvSourceFieldProps {
  /** Create form vs edit form — controls the "Current" summary. */
  isEdit: boolean;
  /** Saved / initial CV filename (not the in-progress selection). */
  currentFilename: string | null;
  currentType: ApplicationCvType | null;
  currentUrl: string;
  cvUrlExists?: boolean;
  onRetryCvCheck?: () => Promise<void>;

  mode: ApplicationCvType;
  primaryCvs: PrimaryCv[];
  primaryCvsLoading: boolean;
  selectedPrimaryId: string | null;
  /** In-progress tailored upload (not saved yet). */
  pendingFile: File | null;
  error?: string;

  onSelectPrimary: (primaryId: string) => void;
  onSwitchToTailored: () => void;
  onSwitchToPrimary: () => void;
  onPendingFileChange: (file: File | null) => void;
  /** When set, users can manage the primary library from this form (modal). */
  onPrimaryLibraryChange?: (items: PrimaryCv[]) => void;

  switchToPrimaryConfirmOpen: boolean;
  onConfirmSwitchToPrimary: () => void;
  onCancelSwitchToPrimary: () => void;

  useOriginalCvFilename: boolean;
  onUseOriginalCvFilenameChange: (use: boolean) => void;
  slug: string;
}

/**
 * Single CV section: current summary (edit), change source (radios), download name.
 */
export default function CvSourceField({
  isEdit,
  currentFilename,
  currentType,
  currentUrl,
  cvUrlExists = true,
  onRetryCvCheck,
  mode,
  primaryCvs,
  primaryCvsLoading,
  selectedPrimaryId,
  pendingFile,
  error,
  onSelectPrimary,
  onSwitchToTailored,
  onSwitchToPrimary,
  onPendingFileChange,
  onPrimaryLibraryChange,
  switchToPrimaryConfirmOpen,
  onConfirmSwitchToPrimary,
  onCancelSwitchToPrimary,
  useOriginalCvFilename,
  onUseOriginalCvFilenameChange,
  slug,
}: CvSourceFieldProps) {
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const selectedPrimary = primaryCvs.find((cv) => cv.id === selectedPrimaryId);
  const hasPrimaryCvs = primaryCvs.length > 0;
  const canManageLibrary = typeof onPrimaryLibraryChange === "function";

  const pendingOrCurrentName =
    pendingFile?.name ??
    (mode === "primary"
      ? (selectedPrimary?.filename ?? currentFilename)
      : currentFilename);
  const generatedName = slug ? getCvDownloadFilename(slug) : "CV-Slug.pdf";

  return (
    <fieldset className="space-y-5 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
      <legend className="px-1 text-base font-semibold text-[var(--foreground)]">
        CV
      </legend>

      {/* Current (edit) */}
      {isEdit && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--foreground)]">Current</p>
          {currentUrl.trim() || currentFilename ? (
            <div className="rounded-md border border-[var(--foreground)]/10 bg-[var(--secondary-background)] px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {currentType && (
                  <span className="shrink-0 rounded border border-[var(--foreground)]/15 px-1.5 py-0.5 text-xs text-[var(--foreground)]/70">
                    {currentType === "primary" ? "Primary library" : "Tailored"}
                  </span>
                )}
                {cvUrlExists !== false && currentUrl.trim() ? (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 truncate text-sm font-medium text-[var(--brand-primary)] hover:underline"
                  >
                    {currentFilename?.trim() || "CV.pdf"}
                  </a>
                ) : (
                  <span className="min-w-0 truncate text-sm font-medium text-[var(--foreground)]">
                    {currentFilename?.trim() || "CV.pdf"}
                  </span>
                )}
              </div>
              {cvUrlExists === false && (
                <div
                  role="alert"
                  className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                >
                  <p className="font-semibold">CV file missing</p>
                  <p className="mt-0.5 text-amber-800">
                    The file is no longer in storage. Choose a primary CV or
                    upload a new tailored PDF below.
                  </p>
                  {onRetryCvCheck && (
                    <button
                      type="button"
                      onClick={() => void onRetryCvCheck()}
                      className="mt-2 rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500"
                    >
                      Check again
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground)]/70">
              No CV on this application yet.
            </p>
          )}
        </div>
      )}

      {/* Change CV */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {isEdit ? "Change CV" : "Choose a CV"}
          </p>
          {canManageLibrary && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setLibraryModalOpen(true)}
            >
              Manage library
            </Button>
          )}
        </div>
        {!isEdit && (
          <p className="text-sm text-[var(--foreground)]/70">
            Prefer a primary CV from your library so you can reuse it across
            applications.
          </p>
        )}

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="radio"
              name="cvSource"
              className="mt-1 h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              checked={mode === "primary"}
              disabled={!hasPrimaryCvs && !primaryCvsLoading}
              onChange={() => onSwitchToPrimary()}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[var(--foreground)]">
                {isEdit && currentType === "tailored"
                  ? "Replace with a primary CV"
                  : isEdit && currentType === "primary"
                    ? "Use a different primary CV"
                    : "Use a primary CV"}
              </span>
              {!hasPrimaryCvs && !primaryCvsLoading && (
                <span className="mt-0.5 block text-xs text-[var(--foreground)]/60">
                  No primary CVs yet.
                  {canManageLibrary ? (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={() => setLibraryModalOpen(true)}
                        className="font-medium text-[var(--brand-primary)] hover:opacity-80"
                      >
                        Upload one to your library
                      </button>
                    </>
                  ) : null}
                </span>
              )}
            </span>
          </label>

          {mode === "primary" && (
            <div className="ml-6 space-y-2">
              {primaryCvsLoading ? (
                <p className="text-sm text-[var(--foreground)]/60">
                  Loading primary CVs…
                </p>
              ) : hasPrimaryCvs ? (
                <>
                  <label className="block text-sm text-[var(--foreground)]/80">
                    Choose from your library
                  </label>
                  <select
                    className="w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--secondary-background)] px-3 py-2 text-sm"
                    value={selectedPrimaryId ?? ""}
                    onChange={(e) => onSelectPrimary(e.target.value)}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {primaryCvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.label?.trim() || cv.filename}
                      </option>
                    ))}
                  </select>
                  {selectedPrimary && (
                    <p className="text-xs text-[var(--foreground)]/60">
                      {selectedPrimary.filename}{" "}
                      <a
                        href={selectedPrimary.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--brand-primary)]"
                      >
                        View
                      </a>
                    </p>
                  )}
                </>
              ) : canManageLibrary ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setLibraryModalOpen(true)}
                >
                  Upload primary CV
                </Button>
              ) : null}
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="radio"
              name="cvSource"
              className="mt-1 h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              checked={mode === "tailored"}
              onChange={() => onSwitchToTailored()}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[var(--foreground)]">
                Upload a different CV
              </span>
              <span className="mt-0.5 block text-xs text-[var(--foreground)]/60">
                Tailored files are removed from storage when you delete this
                application or switch back to a primary CV.
              </span>
            </span>
          </label>

          {mode === "tailored" && (
            <div className="ml-6">
              <FileUpload
                pendingFile={pendingFile}
                onPendingFileChange={onPendingFileChange}
                hideLabel
                chooseLabel="Choose PDF"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Download name */}
      <div className="space-y-3 border-t border-[var(--foreground)]/10 pt-4">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Download name for recruiters
        </p>
        <p className="text-sm text-[var(--foreground)]/70">
          Filename recruiters see when they download your CV.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="useOriginalCvFilename"
              checked={useOriginalCvFilename !== false}
              onChange={() => onUseOriginalCvFilenameChange(true)}
              className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Original file name
            </span>
            {pendingOrCurrentName && (
              <span className="text-xs text-[var(--foreground)]/60">
                ({pendingOrCurrentName})
              </span>
            )}
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="useOriginalCvFilename"
              checked={useOriginalCvFilename === false}
              onChange={() => onUseOriginalCvFilenameChange(false)}
              className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Generated name
            </span>
            <span className="text-xs text-[var(--foreground)]/60">
              ({generatedName})
            </span>
          </label>
        </div>
        <p className="text-xs text-[var(--foreground)]/60">
          Downloadable file name:{" "}
          {useOriginalCvFilename !== false && pendingOrCurrentName
            ? pendingOrCurrentName
            : slug
              ? getCvDownloadFilename(slug)
              : "…"}
        </p>
      </div>

      <ConfirmDialog
        open={switchToPrimaryConfirmOpen}
        title="Replace tailored CV with a primary CV?"
        message="Saving with a primary CV will remove this application’s tailored PDF from storage. Your profile primary library is unchanged."
        confirmLabel="Choose a primary CV"
        cancelLabel="Keep tailored CV"
        onConfirm={onConfirmSwitchToPrimary}
        onCancel={onCancelSwitchToPrimary}
      />

      {canManageLibrary && (
        <PrimaryCvLibraryModal
          open={libraryModalOpen}
          onClose={() => setLibraryModalOpen(false)}
          onLibraryChange={onPrimaryLibraryChange!}
        />
      )}
    </fieldset>
  );
}
