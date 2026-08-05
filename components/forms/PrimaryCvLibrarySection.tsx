"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import PrimaryCvUsedByPreview from "@/components/forms/PrimaryCvUsedByPreview";
import type { PrimaryCv, PrimaryCvApplicationPreview } from "@/lib/types/primary-cv";
import {
  PRIMARY_CV_MAX_PER_USER,
  primaryCvDeleteConfirmMessage,
} from "@/lib/types/primary-cv";
import { useCallback, useEffect, useRef, useState } from "react";

export type PrimaryCvLibrarySectionProps = {
  /** Called whenever the library list is refreshed after load/upload/delete. */
  onLibraryChange?: (items: PrimaryCv[]) => void;
  /**
   * Omit the outer card chrome (for embedding in a modal).
   * Also uses an inline delete confirm so we do not nest native dialogs.
   */
  embedded?: boolean;
};

type PendingDelete = {
  cv: PrimaryCv;
  applicationsCount: number;
  usedBy: PrimaryCvApplicationPreview[];
};

/**
 * Upload and manage up to 5 primary CVs (profile page or application-form modal).
 */
export default function PrimaryCvLibrarySection({
  onLibraryChange,
  embedded = false,
}: PrimaryCvLibrarySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onLibraryChangeRef = useRef(onLibraryChange);
  onLibraryChangeRef.current = onLibraryChange;
  const [items, setItems] = useState<PrimaryCv[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const applyItems = useCallback((next: PrimaryCv[]) => {
    setItems(next);
    onLibraryChangeRef.current?.(next);
  }, []);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/profile/primary-cvs", {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to load primary CVs");
        return;
      }
      applyItems((json.data as PrimaryCv[]) ?? []);
    } catch {
      setError("Failed to load primary CVs");
    } finally {
      setLoading(false);
    }
  }, [applyItems]);

  useEffect(() => {
    void load();
  }, [load]);

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
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      await load();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const performDelete = async (cv: PrimaryCv) => {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/profile/primary-cvs?id=${cv.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to delete primary CV");
        return;
      }
      const affected = Number(json.applications_affected ?? 0);
      if (affected > 0) {
        setError(
          `Primary CV deleted. ${affected} application${affected === 1 ? "" : "s"} still referenced it and will show “CV missing” until updated.`,
        );
      }
      await load();
    } catch {
      setError("Failed to delete primary CV");
    } finally {
      setDeleting(false);
    }
  };

  const requestDelete = (cv: PrimaryCv) => {
    const applicationsCount = Math.max(0, cv.applications_count ?? 0);
    if (applicationsCount === 0) {
      void performDelete(cv);
      return;
    }
    setPendingDelete({
      cv,
      applicationsCount,
      usedBy: cv.used_by ?? [],
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { cv } = pendingDelete;
    setPendingDelete(null);
    await performDelete(cv);
  };

  const atLimit = items.length >= PRIMARY_CV_MAX_PER_USER;
  const deleteMessage = pendingDelete
    ? primaryCvDeleteConfirmMessage(pendingDelete.applicationsCount)
    : "";

  const body = (
    <>
      {!embedded && (
        <>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Primary CVs
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            Upload up to {PRIMARY_CV_MAX_PER_USER} résumé PDFs to reuse on new
            applications. Deleting a primary CV removes it from storage;
            applications that still pointed at it will show a missing-CV warning
            on the dashboard.
          </p>
        </>
      )}

      {error && (
        <p
          className={`${embedded ? "mt-0" : "mt-3"} rounded-md bg-amber-50 p-3 text-sm text-amber-900`}
          role="status"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p
          className={`${embedded && !error ? "mt-0" : "mt-4"} text-sm text-[var(--foreground)]/60`}
        >
          Loading…
        </p>
      ) : (
        <ul className={`${embedded && !error ? "mt-0" : "mt-4"} space-y-2`}>
          {items.length === 0 && (
            <li className="text-sm text-[var(--foreground)]/70">
              No primary CVs yet. Upload one to reuse it on applications.
            </li>
          )}
          {items.map((cv) => (
            <li
              key={cv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--foreground)]/10 bg-[var(--background)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {cv.label?.trim() || cv.filename}
                </p>
                {cv.label?.trim() && (
                  <p className="truncate text-xs text-[var(--foreground)]/60">
                    {cv.filename}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={cv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--brand-primary)] hover:opacity-80"
                >
                  View
                </a>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={deleting}
                  onClick={() => requestDelete(cv)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {embedded && pendingDelete && (
        <div
          className="mt-4 space-y-3 rounded-md border border-amber-300 bg-amber-50 p-3"
          role="alertdialog"
          aria-labelledby="primary-cv-delete-title"
          aria-describedby="primary-cv-delete-desc"
        >
          <p
            id="primary-cv-delete-title"
            className="text-sm font-semibold text-amber-950"
          >
            Delete primary CV?
          </p>
          <p id="primary-cv-delete-desc" className="text-sm text-amber-900">
            {deleteMessage}
          </p>
          <PrimaryCvUsedByPreview
            applications={pendingDelete.usedBy}
            totalCount={pendingDelete.applicationsCount}
            tone="warning"
          />
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
              variant="primary"
              loading={deleting}
              onClick={() => void confirmDelete()}
            >
              I Understand — Delete
            </Button>
          </div>
        </div>
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
          disabled={uploading || atLimit || deleting || pendingDelete !== null}
          onClick={() => fileInputRef.current?.click()}
          title={
            atLimit
              ? `Limit of ${PRIMARY_CV_MAX_PER_USER} primary CVs reached`
              : undefined
          }
        >
          {uploading ? "Uploading…" : "Upload primary CV"}
        </Button>
        {atLimit && (
          <p className="mt-2 text-xs text-[var(--foreground)]/60">
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
          confirmLabel="I Understand — Delete"
          cancelLabel="Cancel"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setPendingDelete(null)}
        >
          {pendingDelete && (
            <PrimaryCvUsedByPreview
              applications={pendingDelete.usedBy}
              totalCount={pendingDelete.applicationsCount}
            />
          )}
        </ConfirmDialog>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-0">{body}</div>;
  }

  return (
    <section className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-6 shadow-sm">
      {body}
    </section>
  );
}
