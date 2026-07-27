"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import type { MasterCv } from "@/lib/types/master-cv";
import { MASTER_CV_MAX_PER_USER } from "@/lib/types/master-cv";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Profile section: upload and manage up to 5 master CVs.
 */
export default function MasterCvLibrarySection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MasterCv[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MasterCv | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/profile/master-cvs", {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to load master CVs");
        return;
      }
      setItems((json.data as MasterCv[]) ?? []);
    } catch {
      setError("Failed to load master CVs");
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/master-cvs", {
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

  const requestDelete = (cv: MasterCv) => {
    setPendingDelete(cv);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const cv = pendingDelete;
    setPendingDelete(null);
    setError(null);
    try {
      const res = await fetch(`/api/profile/master-cvs?id=${cv.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to delete master CV");
        return;
      }
      const affected = Number(json.applications_affected ?? 0);
      if (affected > 0) {
        setError(
          `Master CV deleted. ${affected} application${affected === 1 ? "" : "s"} still referenced it and will show “CV missing” until updated.`,
        );
      }
      await load();
    } catch {
      setError("Failed to delete master CV");
    }
  };

  const atLimit = items.length >= MASTER_CV_MAX_PER_USER;

  return (
    <section className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Master CVs
      </h2>
      <p className="mt-1 text-sm text-[var(--foreground)]/60">
        Upload up to {MASTER_CV_MAX_PER_USER} résumé PDFs to reuse on new
        applications. Deleting a master CV removes it from storage; applications
        that still pointed at it will show a missing-CV warning on the dashboard.
      </p>

      {error && (
        <p
          className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-[var(--foreground)]/60">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.length === 0 && (
            <li className="text-sm text-[var(--foreground)]/70">
              No master CVs yet. Upload one to reuse it on applications.
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
                  onClick={() => requestDelete(cv)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
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
          disabled={uploading || atLimit}
          onClick={() => fileInputRef.current?.click()}
          title={
            atLimit
              ? `Limit of ${MASTER_CV_MAX_PER_USER} master CVs reached`
              : undefined
          }
        >
          {uploading ? "Uploading…" : "Upload master CV"}
        </Button>
        {atLimit && (
          <p className="mt-2 text-xs text-[var(--foreground)]/60">
            Limit of {MASTER_CV_MAX_PER_USER} reached. Delete one to upload
            another.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete master CV?"
        message="If any applications still use this CV, they will keep the old link but the file will be gone — the dashboard will show “CV missing” until you pick another CV on those applications. This cannot be undone."
        confirmLabel="I Understand — Delete"
        cancelLabel="Cancel"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
