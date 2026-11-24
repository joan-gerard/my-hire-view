"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import {
  ADMIN_ICON_SECONDARY_CLASS,
  ADMIN_PANEL_CLASS,
} from "@/components/admin/admin-chrome";
import AdminTooltip from "@/components/admin/AdminTooltip";
import {
  EllipsisIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "@/components/admin/icons";
import PrimaryCvUsedByPreview from "@/components/forms/PrimaryCvUsedByPreview";
import type { PrimaryCv, PrimaryCvApplicationPreview } from "@/lib/types/primary-cv";
import {
  PRIMARY_CV_MAX_PER_USER,
  primaryCvDeleteConfirmLabel,
  primaryCvDeleteConfirmMessage,
  primaryCvPostDeleteStatusMessage,
} from "@/lib/types/primary-cv";
import { notifyOnboardingChecklistChanged } from "@/lib/utils/onboarding-checklist-sync";
import { useCallback, useEffect, useRef, useState } from "react";

export type PrimaryCvLibrarySectionProps = {
  /** Called whenever the library list is refreshed after load/upload/delete. */
  onLibraryChange?: (items: PrimaryCv[]) => void;
  /**
   * Omit the outer card chrome (for embedding in a modal).
   * Delete always confirms (inline here so we do not nest native dialogs).
   */
  embedded?: boolean;
  /**
   * True while an upload or delete request is in flight (not initial load).
   * Manage library uses this to block Escape / backdrop / Done until finished.
   */
  onMutationBusyChange?: (busy: boolean) => void;
  /**
   * Known library from the parent form. When set (including `[]`), skip the
   * initial Loading… flash and still refresh in the background.
   */
  initialItems?: PrimaryCv[];
  /** Currently selected primary for this application (Manage library modal). */
  selectedId?: string | null;
  /** Choose a primary for this application from the modal list. */
  onSelect?: (id: string) => void;
};

type PendingDelete = {
  cv: PrimaryCv;
  applicationsCount: number;
  usedBy: PrimaryCvApplicationPreview[];
};

function PrimaryCvRowMenu({
  url,
  disabled,
  onDelete,
}: {
  url: string;
  disabled: boolean;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <AdminTooltip label="More options">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={ADMIN_ICON_SECONDARY_CLASS}
          aria-label="More options"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <EllipsisIcon className="h-4 w-4" />
        </button>
      </AdminTooltip>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] py-1 shadow-lg"
          role="menu"
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View
          </a>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)] disabled:opacity-40"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Upload and manage up to 5 primary CVs (profile page or application-form modal).
 */
export default function PrimaryCvLibrarySection({
  onLibraryChange,
  embedded = false,
  onMutationBusyChange,
  initialItems,
  selectedId = null,
  onSelect,
}: PrimaryCvLibrarySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onLibraryChangeRef = useRef(onLibraryChange);
  onLibraryChangeRef.current = onLibraryChange;
  const onMutationBusyChangeRef = useRef(onMutationBusyChange);
  onMutationBusyChangeRef.current = onMutationBusyChange;
  /** Serializes upload vs delete so a later `load()` cannot wipe the other op's UI. */
  const opLockRef = useRef<"idle" | "upload" | "delete">("idle");
  /** Bumped on every `load()` so a slower in-flight GET cannot apply stale items. */
  const loadGenerationRef = useRef(0);
  /** False after unmount — blocks mutation follow-up `load()` / parent callbacks. */
  const mountedRef = useRef(true);
  const seededFromParent = initialItems !== undefined;
  const [items, setItems] = useState<PrimaryCv[]>(() => initialItems ?? []);
  const [loading, setLoading] = useState(!seededFromParent);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const applyItems = useCallback((next: PrimaryCv[]) => {
    if (!mountedRef.current) return;
    setItems(next);
    onLibraryChangeRef.current?.(next);
  }, []);

  const load = useCallback(async (): Promise<boolean> => {
    if (!mountedRef.current) return false;
    const generation = ++loadGenerationRef.current;
    try {
      setError(null);
      const res = await fetch("/api/profile/primary-cvs", {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (
        !mountedRef.current ||
        generation !== loadGenerationRef.current
      ) {
        return false;
      }
      if (!res.ok) {
        setError(json.error ?? "Failed to load primary CVs");
        return false;
      }
      applyItems((json.data as PrimaryCv[]) ?? []);
      return true;
    } catch {
      if (
        !mountedRef.current ||
        generation !== loadGenerationRef.current
      ) {
        return false;
      }
      setError("Failed to load primary CVs");
      return false;
    } finally {
      if (
        mountedRef.current &&
        generation === loadGenerationRef.current
      ) {
        setLoading(false);
      }
    }
  }, [applyItems]);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    return () => {
      mountedRef.current = false;
      // Invalidate in-flight GETs so an unmounted Manage-library instance cannot
      // call onLibraryChange after a newer modal upload (close/reopen race).
      loadGenerationRef.current += 1;
      onMutationBusyChangeRef.current?.(false);
    };
  }, [load]);

  useEffect(() => {
    onMutationBusyChangeRef.current?.(uploading || deleting);
  }, [uploading, deleting]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("File size must be less than 3MB.");
      return;
    }
    if (loading || opLockRef.current !== "idle") return;
    opLockRef.current = "upload";
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/primary-cvs", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!mountedRef.current) return;
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      await load();
      notifyOnboardingChecklistChanged();
    } catch {
      if (mountedRef.current) {
        setError("Upload failed");
      }
    } finally {
      opLockRef.current = "idle";
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  };

  const performDelete = async (cv: PrimaryCv): Promise<boolean> => {
    if (opLockRef.current !== "idle") return false;
    opLockRef.current = "delete";
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/profile/primary-cvs?id=${cv.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!mountedRef.current) return false;
      if (!res.ok) {
        setError(json.error ?? "Failed to delete primary CV");
        return false;
      }
      const affected = Number(json.applications_affected ?? 0);
      // `load()` clears `error` at start; restore still-referenced warning after
      // refresh (including when refresh fails so the user still sees the risk).
      const refreshed = await load();
      notifyOnboardingChecklistChanged();
      if (!mountedRef.current) return false;
      const status = primaryCvPostDeleteStatusMessage({
        applicationsAffected: affected,
        refreshed,
      });
      if (status) {
        setError(status);
      }
      return true;
    } catch {
      if (mountedRef.current) {
        setError("Failed to delete primary CV");
      }
      return false;
    } finally {
      opLockRef.current = "idle";
      if (mountedRef.current) {
        setDeleting(false);
      }
    }
  };

  const requestDelete = (cv: PrimaryCv) => {
    if (loading || opLockRef.current !== "idle") return;
    const applicationsCount = Math.max(0, cv.applications_count ?? 0);
    setPendingDelete({
      cv,
      applicationsCount,
      usedBy: cv.used_by ?? [],
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    const { cv } = pendingDelete;
    const ok = await performDelete(cv);
    if (ok && mountedRef.current) {
      setPendingDelete(null);
    }
  };

  const atLimit = items.length >= PRIMARY_CV_MAX_PER_USER;
  const libraryBusy = loading || uploading || deleting;
  const deleteMessage = pendingDelete
    ? primaryCvDeleteConfirmMessage(pendingDelete.applicationsCount)
    : "";
  const deleteConfirmLabel = pendingDelete
    ? primaryCvDeleteConfirmLabel(pendingDelete.applicationsCount)
    : "Delete";

  const body = (
    <>
      {!embedded && (
        <>
          <h2 className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Primary CVs
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Upload up to {PRIMARY_CV_MAX_PER_USER} résumé PDFs to reuse on new
            applications. Deleting a primary CV removes it from storage;
            applications that still pointed at it will show a missing-CV warning
            on the dashboard.
          </p>
        </>
      )}

      {error && (
        <p
          className={`${embedded ? "mt-0" : "mt-3"} rounded-xl border border-[var(--status-warning-fg)]/20 bg-[var(--status-warning-bg)] p-3 text-sm text-[var(--status-warning-fg)]`}
          role="status"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p
          className={`${embedded && !error ? "mt-0" : "mt-4"} text-sm text-[var(--muted)]`}
        >
          Loading…
        </p>
      ) : items.length === 0 ? (
        <p
          className={`${embedded && !error ? "mt-0" : "mt-4"} text-sm text-[var(--muted)]`}
        >
          No primary CVs yet.
        </p>
      ) : (
        <ul
          className={`${embedded && !error ? "mt-0" : "mt-4"} space-y-2`}
          role={onSelect ? "radiogroup" : undefined}
          aria-label={onSelect ? "Primary CVs for this application" : undefined}
        >
          {items.map((cv) => {
            const title = cv.label?.trim() || cv.filename;
            const selected = Boolean(onSelect) && selectedId === cv.id;
            const confirmingThis =
              embedded && pendingDelete?.cv.id === cv.id;
            const rowClass = `flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 ${
              confirmingThis
                ? "border-[var(--status-warning-fg)]/30 bg-[var(--status-warning-bg)]"
                : selected
                  ? "border-[var(--ink)]/20 bg-[var(--paper)]"
                  : "border-[var(--ink)]/10 bg-[var(--white)]"
            }`;
            const rowBusy = libraryBusy || pendingDelete !== null;
            const applicationsCount = Math.max(0, cv.applications_count ?? 0);
            const usageLabel =
              applicationsCount === 1
                ? "Used by 1 application"
                : `Used by ${applicationsCount} applications`;

            return (
              <li key={cv.id} className="space-y-2">
                <div className={rowClass}>
                  {onSelect ? (
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                      <input
                        type="radio"
                        name="primary-cv-library-select"
                        value={cv.id}
                        checked={selected}
                        disabled={rowBusy}
                        onChange={() => onSelect(cv.id)}
                        className="size-4 shrink-0 accent-[var(--ink)]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[var(--ink)]">
                          {title}
                        </span>
                        {cv.label?.trim() ? (
                          <span className="block truncate text-xs text-[var(--muted)]">
                            {cv.filename}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--ink)]">
                        {title}
                      </p>
                      {cv.label?.trim() ? (
                        <p className="truncate text-xs text-[var(--muted)]">
                          {cv.filename}
                        </p>
                      ) : null}
                    </div>
                  )}
                  <span
                    className="shrink-0 tabular-nums text-sm text-[var(--muted)]"
                    title={usageLabel}
                    aria-label={usageLabel}
                  >
                    {applicationsCount}
                  </span>
                  <PrimaryCvRowMenu
                    url={cv.url}
                    disabled={rowBusy}
                    onDelete={() => requestDelete(cv)}
                  />
                </div>
                {confirmingThis && pendingDelete ? (
                  <div
                    className="space-y-3 rounded-xl border border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)] p-3"
                    role="alertdialog"
                    aria-labelledby="primary-cv-delete-desc"
                  >
                    <p
                      id="primary-cv-delete-desc"
                      className="text-sm text-[var(--status-warning-fg)]"
                    >
                      {deleteMessage}
                    </p>
                    {pendingDelete.applicationsCount > 0 ? (
                      <PrimaryCvUsedByPreview
                        applications={pendingDelete.usedBy}
                        totalCount={pendingDelete.applicationsCount}
                        tone="warning"
                      />
                    ) : null}
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={deleting}
                        onClick={() => setPendingDelete(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        loading={deleting}
                        loadingLabel="Deleting…"
                        onClick={() => void confirmDelete()}
                      >
                        {deleteConfirmLabel}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => void handleUpload(e)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={libraryBusy || atLimit || pendingDelete !== null}
          onClick={() => fileInputRef.current?.click()}
          title={
            loading
              ? "Wait for the library to finish loading"
              : atLimit
                ? `Limit of ${PRIMARY_CV_MAX_PER_USER} primary CVs reached`
                : undefined
          }
        >
          {uploading ? "Uploading…" : "Upload primary CV"}
        </Button>
        {atLimit && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Limit of {PRIMARY_CV_MAX_PER_USER} reached. Delete one to upload
            another.
          </p>
        )}
      </div>

      {!embedded && (
        <ConfirmDialog
          open={pendingDelete !== null}
          title="Delete primary CV?"
          message={deleteMessage}
          confirmLabel={deleteConfirmLabel}
          cancelLabel="Cancel"
          confirming={deleting}
          confirmLoadingLabel="Deleting…"
          confirmVariant="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => {
            if (!deleting) setPendingDelete(null);
          }}
        >
          {pendingDelete && pendingDelete.applicationsCount > 0 ? (
            <PrimaryCvUsedByPreview
              applications={pendingDelete.usedBy}
              totalCount={pendingDelete.applicationsCount}
            />
          ) : null}
        </ConfirmDialog>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-0">{body}</div>;
  }

  return (
    <section className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}>
      {body}
    </section>
  );
}
