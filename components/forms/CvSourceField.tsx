"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";
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
  /** Resolves false when storage still has no file. */
  onRetryCvCheck?: () => Promise<boolean | void>;

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
  onPendingFileChange: (file: File | null) => void | Promise<void>;
  /** When set, users can manage the primary library from this form (modal). */
  onPrimaryLibraryChange?: (items: PrimaryCv[]) => void;

  switchToPrimaryConfirmOpen: boolean;
  onConfirmSwitchToPrimary: () => void;
  onCancelSwitchToPrimary: () => void;

  useOriginalCvFilename: boolean;
  onUseOriginalCvFilenameChange: (use: boolean) => void;
  slug: string;
  /** True while tailored CV is uploading on Save (F8-051 / F8-055). */
  uploading?: boolean;
  /** True while the selected PDF content digest is still computing. */
  preparing?: boolean;
  /** Disable file choose/remove for the full Save lifecycle (not only upload). */
  disabled?: boolean;
  /**
   * `checklist` is the create page: one selected file, library switch, and a
   * tailored PDF for this role.
   */
  variant?: "default" | "checklist";
}

function choiceCardClass(selected: boolean, disabled = false): string {
  return `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm ring-1 ring-inset ${
    disabled
      ? "cursor-not-allowed opacity-60"
      : "cursor-pointer"
  } ${
    selected
      ? "bg-[var(--paper)] text-[var(--ink)] ring-[var(--ink)]"
      : "bg-[var(--white)] text-[var(--ink)] ring-[var(--ink)]/15 hover:bg-[var(--paper)]/70"
  }`;
}

const textButtonClass =
  "rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline";

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
  uploading = false,
  preparing = false,
  disabled = false,
  variant = "default",
}: CvSourceFieldProps) {
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [checkingCv, setCheckingCv] = useState(false);
  const [cvRecheckNote, setCvRecheckNote] = useState<string | null>(null);
  const selectedPrimary = primaryCvs.find((cv) => cv.id === selectedPrimaryId);
  const hasPrimaryCvs = primaryCvs.length > 0;
  const canManageLibrary = typeof onPrimaryLibraryChange === "function";
  /** Create-only lock while library loads (F15-049); edit keeps saved cv_type. */
  const lockCvSourceWhileLoading = !isEdit && primaryCvsLoading;
  const sourceLocked = disabled || lockCvSourceWhileLoading;

  const hasCvSelection =
    mode === "primary"
      ? Boolean(selectedPrimaryId)
      : Boolean(pendingFile) ||
        (isEdit &&
          currentType === "tailored" &&
          Boolean(currentUrl.trim() || currentFilename));
  const pendingOrCurrentName =
    pendingFile?.name ??
    (mode === "primary"
      ? (selectedPrimary?.filename ?? currentFilename)
      : currentFilename);
  const generatedName = slug ? getCvDownloadFilename(slug) : "CV-Slug.pdf";
  const downloadName =
    useOriginalCvFilename !== false && pendingOrCurrentName
      ? pendingOrCurrentName
      : slug
        ? getCvDownloadFilename(slug)
        : "…";

  const libraryModal = canManageLibrary ? (
    <PrimaryCvLibraryModal
      open={libraryModalOpen}
      onClose={() => setLibraryModalOpen(false)}
      onLibraryChange={onPrimaryLibraryChange!}
    />
  ) : null;

  const switchConfirm = (
    <ConfirmDialog
      open={switchToPrimaryConfirmOpen}
      title="Replace tailored CV with a primary CV?"
      message="Saving with a primary CV will remove this application’s tailored PDF from storage. Your profile primary library is unchanged."
      confirmLabel="Choose a primary CV"
      cancelLabel="Keep tailored CV"
      onConfirm={onConfirmSwitchToPrimary}
      onCancel={onCancelSwitchToPrimary}
    />
  );

  if (variant === "checklist") {
    const selectedPrimaryName =
      selectedPrimary?.label?.trim() || selectedPrimary?.filename || pendingOrCurrentName;
    return (
      <>
        <fieldset>
          <legend className="sr-only">Résumé</legend>
          {lockCvSourceWhileLoading ? (
            <p className="nas-status" role="status">
              Loading your CV library…
            </p>
          ) : null}

          {hasCvSelection ? (
            <div className="nas-cv">
              <div className="nas-pdf">PDF</div>
              <div>
                <p className="nas-cv-file">{selectedPrimaryName}</p>
                <p className="nas-cv-sent">
                  {preparing
                    ? "Preparing file…"
                    : uploading
                      ? "Uploading…"
                      : (
                        <>
                          Sent as <b>{downloadName}</b>
                        </>
                      )}
                </p>
              </div>
              <div className="nas-ok" aria-hidden>
                ✓
              </div>
            </div>
          ) : !lockCvSourceWhileLoading ? (
            <div className="nas-up">
              {hasPrimaryCvs
                ? "Choose a résumé from your library, or a PDF for this role."
                : "No résumé in your library yet. Upload one, or use a PDF for this role."}
            </div>
          ) : null}

          {mode === "primary" && hasPrimaryCvs && (primaryCvs.length > 1 || !hasCvSelection) ? (
            <div className="nas-crow">
              <span className="nas-lbl">Library</span>
              <div className="nas-chips">
                {primaryCvs.map((cv) => {
                  const selected = selectedPrimaryId === cv.id;
                  const label = cv.label?.trim() || cv.filename;
                  return (
                    <button
                      key={cv.id}
                      type="button"
                      className={selected ? "nas-chip" : "nas-chip is-quiet"}
                      disabled={sourceLocked}
                      onClick={() => onSelectPrimary(cv.id)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <p className="nas-cv-actions">
            {mode !== "tailored" ? (
              <button
                type="button"
                disabled={sourceLocked}
                onClick={() => onSwitchToTailored()}
              >
                Use a tailored PDF for this role
              </button>
            ) : null}
            {mode === "tailored" && hasPrimaryCvs ? (
              <button
                type="button"
                disabled={sourceLocked}
                onClick={() => onSwitchToPrimary()}
              >
                Use a library CV
              </button>
            ) : null}
            {canManageLibrary ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => setLibraryModalOpen(true)}
              >
                Manage library
              </button>
            ) : null}
          </p>

          {mode === "tailored" ? (
            <div className="nas-tailored">
              <FileUpload
                pendingFile={pendingFile}
                onPendingFileChange={onPendingFileChange}
                hideLabel
                chooseLabel="Choose a PDF"
                uploading={uploading}
                preparing={preparing}
                disabled={disabled}
              />
            </div>
          ) : null}

          {error ? (
            <p className="nas-err" role="alert">
              {error}
            </p>
          ) : null}

          {hasCvSelection ? (
            <button
              type="button"
              className="nas-textbtn"
              disabled={disabled}
              onClick={() =>
                onUseOriginalCvFilenameChange(useOriginalCvFilename === false)
              }
            >
              {useOriginalCvFilename !== false
                ? "Use a generated name"
                : "Use the original file name"}
            </button>
          ) : null}
        </fieldset>
        {switchConfirm}
        {libraryModal}
      </>
    );
  }

  return (
    <fieldset className={`space-y-4 sm:space-y-5 ${ADMIN_FIELDSET_CLASS}`}>
      <legend className="text-base font-semibold text-[var(--ink)]">
        CV
      </legend>

      {/* Current (edit) */}
      {isEdit && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--ink)]">Current</p>
          {currentUrl.trim() || currentFilename ? (
            <div className="rounded-xl bg-[var(--white)] px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {currentType && (
                  <span className="shrink-0 rounded border border-[var(--ink)]/15 px-1.5 py-0.5 text-xs text-[var(--muted)]">
                    {currentType === "primary" ? "Primary library" : "Tailored"}
                  </span>
                )}
                {cvUrlExists !== false && currentUrl.trim() ? (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 truncate text-sm font-medium text-[var(--ink)] hover:underline"
                  >
                    {currentFilename?.trim() || "CV.pdf"}
                  </a>
                ) : (
                  <span className="min-w-0 truncate text-sm font-medium text-[var(--ink)]">
                    {currentFilename?.trim() || "CV.pdf"}
                  </span>
                )}
              </div>
              {cvUrlExists === false && (
                <div
                  role="alert"
                  className="mt-2 rounded-xl border border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)] px-3 py-2 text-sm text-[var(--status-warning-fg)]"
                >
                  <p className="font-semibold">CV file missing</p>
                  <p className="mt-0.5 text-[var(--status-warning-fg)]">
                    The file is no longer in storage. Choose a primary CV or
                    upload a new tailored PDF below.
                  </p>
                  {onRetryCvCheck && (
                    <div className="mt-2">
                      <button
                        type="button"
                        disabled={checkingCv}
                        aria-busy={checkingCv}
                        onClick={() => {
                          void (async () => {
                            setCheckingCv(true);
                            setCvRecheckNote(null);
                            try {
                              const found = await onRetryCvCheck();
                              if (found === false) {
                                setCvRecheckNote(
                                  "Checked just now. The file is still not in storage.",
                                );
                              }
                            } catch {
                              setCvRecheckNote(
                                "Could not check storage. Try again.",
                              );
                            } finally {
                              setCheckingCv(false);
                            }
                          })();
                        }}
                        className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-medium text-[var(--white)] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {checkingCv ? "Checking…" : "Check again"}
                      </button>
                      {cvRecheckNote ? (
                        <p className="mt-2 text-xs" role="status">
                          {cvRecheckNote}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No CV on this application yet.
            </p>
          )}
        </div>
      )}

      {/* Change CV */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--ink)]">
            {isEdit ? "Change CV" : "Choose a CV"}
          </p>
          {canManageLibrary && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setLibraryModalOpen(true)}
              disabled={disabled}
            >
              Manage library
            </Button>
          )}
        </div>
        {!isEdit && (
          <p className="text-sm text-[var(--muted)]">
            Prefer a primary CV from your library so you can reuse it across
            applications.
          </p>
        )}

        <div className="space-y-3">
          {/* F15-049: on create only, lock source radios until the library finishes
              loading so a mid-load choice cannot be overwritten. Edit keeps the
              saved cv_type, so locking there only blocks switching. */}
          {lockCvSourceWhileLoading && (
            <p className="text-xs text-[var(--muted)]" role="status">
              Loading your CV library…
            </p>
          )}
          <label
            className={`flex items-start gap-2.5 ${
              sourceLocked
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name="cvSource"
              className="mt-1 h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
              checked={mode === "primary"}
              disabled={sourceLocked || !hasPrimaryCvs}
              onChange={() => onSwitchToPrimary()}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[var(--ink)]">
                {isEdit && currentType === "tailored"
                  ? "Replace with a primary CV"
                  : isEdit && currentType === "primary"
                    ? "Use a different primary CV"
                    : "Use a primary CV"}
              </span>
              {!hasPrimaryCvs && !primaryCvsLoading && (
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  No primary CVs yet.
                  {canManageLibrary ? (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={() => setLibraryModalOpen(true)}
                        disabled={disabled}
                        className="font-medium text-[var(--ink)] hover:opacity-80 disabled:opacity-50"
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
                <p className="text-sm text-[var(--muted)]">
                  Loading primary CVs…
                </p>
              ) : hasPrimaryCvs ? (
                <>
                  <label className="block text-sm text-[var(--muted)]">
                    Choose from your library
                  </label>
                  <select
                    className="w-full rounded-xl border-0 bg-[var(--white)] px-3 py-2 text-sm text-[var(--ink)] shadow-sm outline-none ring-1 ring-inset ring-[var(--ink)]/15 focus:ring-2 focus:ring-inset focus:ring-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPrimaryId ?? ""}
                    disabled={disabled}
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
                    <p className="text-xs text-[var(--muted)]">
                      {selectedPrimary.filename}{" "}
                      <a
                        href={selectedPrimary.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--ink)]"
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
                  disabled={disabled}
                >
                  Upload primary CV
                </Button>
              ) : null}
            </div>
          )}

          <label
            className={`flex items-start gap-2.5 ${
              sourceLocked
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name="cvSource"
              className="mt-1 h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
              checked={mode === "tailored"}
              disabled={sourceLocked}
              onChange={() => onSwitchToTailored()}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[var(--ink)]">
                Upload a different CV
              </span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">
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
                uploading={uploading}
                preparing={preparing}
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-[var(--status-danger-fg)]" role="alert">
            {error}
          </p>
        )}
      </div>

      {hasCvSelection ? (
      <div className="space-y-3 border-t border-[var(--ink)]/10 pt-4">
        <p className="text-sm font-medium text-[var(--ink)]">
          Download name for recruiters
        </p>
        <p className="text-sm text-[var(--muted)]">
          Filename recruiters see when they download your CV.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label
            className={`inline-flex items-center gap-2.5 ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name="useOriginalCvFilename"
              checked={useOriginalCvFilename !== false}
              disabled={disabled}
              onChange={() => onUseOriginalCvFilenameChange(true)}
              className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
            />
            <span className="text-sm font-medium text-[var(--ink)]">
              Original file name
            </span>
            {pendingOrCurrentName && (
              <span className="text-xs text-[var(--muted)]">
                ({pendingOrCurrentName})
              </span>
            )}
          </label>
          <label
            className={`inline-flex items-center gap-2.5 ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name="useOriginalCvFilename"
              checked={useOriginalCvFilename === false}
              disabled={disabled}
              onChange={() => onUseOriginalCvFilenameChange(false)}
              className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
            />
            <span className="text-sm font-medium text-[var(--ink)]">
              Generated name
            </span>
            <span className="text-xs text-[var(--muted)]">
              ({generatedName})
            </span>
          </label>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Downloadable file name:{" "}
          {useOriginalCvFilename !== false && pendingOrCurrentName
            ? pendingOrCurrentName
            : slug
              ? getCvDownloadFilename(slug)
              : "…"}
        </p>
      </div>
      ) : null}

      {switchConfirm}
      {libraryModal}
    </fieldset>
  );
}
