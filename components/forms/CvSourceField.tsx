"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";
import {
  ApplicationFormFieldRow,
  FIELD_IDLE_TIP,
  FIELD_READY_TIP,
} from "@/components/forms/ApplicationFormSinglePageLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import PrimaryCvLibraryModal from "@/components/forms/PrimaryCvLibraryModal";
import TailoredCvModal from "@/components/forms/TailoredCvModal";
import { getCvDownloadFilenamePreview } from "@/lib/utils/cv-filename";
import type { ApplicationCvType } from "@/lib/types/application";
import type { PrimaryCv } from "@/lib/types/primary-cv";
import { useRef, useState } from "react";

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

  slug: string;
  /** Candidate names for the generated download filename preview. */
  firstName?: string | null;
  lastName?: string | null;
  /** When true, recruiters download with the original PDF name. */
  useOriginalCvFilename?: boolean;
  onUseOriginalCvFilenameChange?: (useOriginal: boolean) => void;
  /** True while tailored CV is uploading on Save (F8-051 / F8-055). */
  uploading?: boolean;
  /** True while the selected PDF content digest is still computing. */
  preparing?: boolean;
  /** Disable file choose/remove for the full Save lifecycle (not only upload). */
  disabled?: boolean;
  /**
   * `checklist` matches the create Résumé demo: library cards, short tailored
   * choice, and a download-name result row.
   */
  variant?: "default" | "checklist";
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
  slug,
  firstName,
  lastName,
  useOriginalCvFilename = false,
  onUseOriginalCvFilenameChange,
  uploading = false,
  preparing = false,
  disabled = false,
  variant = "default",
}: CvSourceFieldProps) {
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [tailoredModalOpen, setTailoredModalOpen] = useState(false);
  const [checkingCv, setCheckingCv] = useState(false);
  const [cvRecheckNote, setCvRecheckNote] = useState<string | null>(null);
  const chooseTailoredTriggerRef = useRef<HTMLButtonElement>(null);
  const selectedPrimary = primaryCvs.find((cv) => cv.id === selectedPrimaryId);
  const hasPrimaryCvs = primaryCvs.length > 0;
  const canManageLibrary = typeof onPrimaryLibraryChange === "function";
  /** Create-only lock while library loads (F15-049); edit keeps saved cv_type. */
  const lockCvSourceWhileLoading = !isEdit && primaryCvsLoading;
  const sourceLocked = disabled || lockCvSourceWhileLoading;

  const hasSavedTailored =
    isEdit &&
    currentType === "tailored" &&
    Boolean(currentUrl.trim() || currentFilename);
  const hasCvSelection =
    mode === "primary"
      ? Boolean(selectedPrimaryId)
      : Boolean(pendingFile) || hasSavedTailored;
  const generatedPreview = getCvDownloadFilenamePreview({
    slug,
    firstName,
    lastName,
  });
  const originalName =
    mode === "primary"
      ? selectedPrimary?.filename?.trim() || null
      : pendingFile?.name?.trim() ||
        (hasSavedTailored ? currentFilename?.trim() || null : null);
  const usingOriginal = Boolean(useOriginalCvFilename && originalName);
  const downloadName = usingOriginal
    ? originalName!
    : generatedPreview.filename;
  const downloadNameLooksIncomplete = !usingOriginal && !generatedPreview.isComplete;
  const canUseOriginalName = Boolean(originalName);
  const downloadNameControl = hasCvSelection ? (
    <div className="flex items-center gap-3">
      <div
        id="application-cv-download-name"
        className={`min-w-0 flex-1 break-all rounded-xl border-0 bg-[var(--white)] px-3.5 py-1.5 ring-1 ring-inset ring-[var(--ink)]/15 sm:text-sm sm:leading-6 ${
          downloadNameLooksIncomplete
            ? "text-[var(--muted)]"
            : "text-[var(--ink)]"
        }`}
        aria-live="polite"
      >
        {downloadName}
      </div>
      <label className="flex shrink-0 items-center gap-2 text-sm text-[var(--muted)]">
        <span className="hidden sm:inline">Original name</span>
        <Switch
          checked={useOriginalCvFilename && canUseOriginalName}
          disabled={disabled || !canUseOriginalName || !onUseOriginalCvFilenameChange}
          onCheckedChange={(checked) =>
            onUseOriginalCvFilenameChange?.(checked)
          }
          aria-label="Use original file name"
        />
      </label>
    </div>
  ) : null;

  const openTailoredModal = () => {
    if (sourceLocked) return;
    setTailoredModalOpen(true);
  };

  const selectTailored = () => {
    if (sourceLocked) return;
    onSwitchToTailored();
    if (!pendingFile && !hasSavedTailored) {
      setTailoredModalOpen(true);
    }
  };

  const tailoredSummary =
    pendingFile?.name ||
    (hasSavedTailored ? currentFilename || "Saved PDF for this role" : null);

  const libraryModal = canManageLibrary ? (
    <PrimaryCvLibraryModal
      open={libraryModalOpen}
      onClose={() => setLibraryModalOpen(false)}
      onLibraryChange={onPrimaryLibraryChange!}
      initialItems={primaryCvsLoading ? undefined : primaryCvs}
      selectedPrimaryId={mode === "primary" ? selectedPrimaryId : null}
      onSelectPrimary={(id) => {
        onSelectPrimary(id);
      }}
    />
  ) : null;

  const tailoredModal = (
    <TailoredCvModal
      open={tailoredModalOpen}
      onClose={() => setTailoredModalOpen(false)}
      pendingFile={pendingFile}
      onPendingFileChange={onPendingFileChange}
      savedUrl={hasSavedTailored ? currentUrl : undefined}
      cvUrlExists={cvUrlExists}
      uploading={uploading}
      preparing={preparing}
      disabled={disabled}
      error={error}
      returnFocusRef={chooseTailoredTriggerRef}
    />
  );

  const tailoredPicker = (
    <div className="space-y-2">
      {mode === "tailored" && tailoredSummary ? (
        <p className="text-sm text-[var(--ink)]">
          <span className="font-medium">Selected:</span>{" "}
          <span className="break-all">{tailoredSummary}</span>
        </p>
      ) : mode === "tailored" ? (
        <p className="text-sm text-[var(--muted)]">No file chosen</p>
      ) : null}
      <Button
        ref={chooseTailoredTriggerRef}
        type="button"
        variant="secondary"
        disabled={sourceLocked}
        onClick={() => {
          if (mode === "tailored" && tailoredSummary) {
            openTailoredModal();
            return;
          }
          selectTailored();
        }}
      >
        {mode === "tailored" && tailoredSummary ? "Manage" : "Choose a PDF"}
      </Button>
    </div>
  );

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
    return (
      <>
        <ApplicationFormFieldRow
          id="application-row-library"
          label="Library"
          tip={
            mode === "primary" && selectedPrimary
              ? FIELD_READY_TIP
              : FIELD_IDLE_TIP
          }
          tipTone={
            mode === "primary" && selectedPrimary ? "ready" : "idle"
          }
          align="top"
        >
          <div className="space-y-2">
            {lockCvSourceWhileLoading ? (
              <p className="text-sm text-[var(--muted)]" role="status">
                Loading your CV library…
              </p>
            ) : mode === "primary" && selectedPrimary ? (
              <p className="text-sm text-[var(--ink)]">
                <span className="font-medium">Selected:</span>{" "}
                <span className="break-all">
                  {selectedPrimary.label?.trim() || selectedPrimary.filename}
                </span>
              </p>
            ) : !hasPrimaryCvs ? (
              <p className="text-sm text-[var(--muted)]">
                No résumés in your library yet.
              </p>
            ) : null}

            {canManageLibrary ? (
              <Button
                type="button"
                variant="secondary"
                disabled={disabled || lockCvSourceWhileLoading}
                onClick={() => setLibraryModalOpen(true)}
              >
                Manage
              </Button>
            ) : null}
          </div>
        </ApplicationFormFieldRow>
        <ApplicationFormFieldRow
          id="application-row-tailored"
          label="This role"
          tip={mode === "tailored" ? FIELD_READY_TIP : FIELD_IDLE_TIP}
          tipTone={mode === "tailored" ? "ready" : "idle"}
          align="top"
        >
          {tailoredPicker}

          {error ? (
            <p className="mt-2 text-sm text-[var(--status-danger-fg)]" role="alert">
              {error}
            </p>
          ) : null}
        </ApplicationFormFieldRow>
        {hasCvSelection ? (
          <ApplicationFormFieldRow
            id="application-row-download-as"
            label="Recruiters download it as"
            layout="result"
            hint="Generated from your link ending by default. Turn on Original name to keep the PDF’s filename."
            tip={FIELD_READY_TIP}
            tipTone="ready"
          >
            {downloadNameControl}
          </ApplicationFormFieldRow>
        ) : null}
        {switchConfirm}
        {libraryModal}
        {tailoredModal}
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
              Manage
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
              onChange={selectTailored}
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

          {mode === "tailored" ? (
            <div className="ml-6">{tailoredPicker}</div>
          ) : null}
        </div>

        {error && (
          <p className="text-sm text-[var(--status-danger-fg)]" role="alert">
            {error}
          </p>
        )}
      </div>

      {hasCvSelection ? (
        <div className="space-y-3 border-t border-[var(--ink)]/10 pt-4">
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">
              Recruiters download it as
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Generated from your link ending by default. Turn on Original name
              to keep the PDF’s filename.
            </p>
          </div>
          {downloadNameControl}
        </div>
      ) : null}

      {switchConfirm}
      {libraryModal}
      {tailoredModal}
    </fieldset>
  );
}
