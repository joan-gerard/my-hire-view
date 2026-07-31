"use client";

import Link from "next/link";
import type { MasterCvApplicationPreview } from "@/lib/types/master-cv";
import { masterCvApplicationPreviewLabel } from "@/lib/types/master-cv";

type MasterCvUsedByPreviewProps = {
  applications: MasterCvApplicationPreview[];
  /** Full count of apps using the master (may exceed `applications.length`). */
  totalCount: number;
  /** Tighter styling for the amber inline confirm inside the library modal. */
  tone?: "default" | "warning";
};

/**
 * Scrollable preview of applications that still reference a master CV.
 */
export default function MasterCvUsedByPreview({
  applications,
  totalCount,
  tone = "default",
}: MasterCvUsedByPreviewProps) {
  if (applications.length === 0) return null;

  const remaining = Math.max(0, totalCount - applications.length);
  const listClass =
    tone === "warning"
      ? "max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-amber-300/80 bg-amber-100/60 px-3 py-2"
      : "max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-[var(--foreground)]/10 bg-[var(--background)] px-3 py-2";
  const metaClass =
    tone === "warning"
      ? "shrink-0 text-xs capitalize text-amber-900/70"
      : "shrink-0 text-xs capitalize text-[var(--foreground)]/60";
  const linkClass =
    tone === "warning"
      ? "min-w-0 truncate text-sm font-medium text-amber-950 underline-offset-2 hover:underline"
      : "min-w-0 truncate text-sm font-medium text-[var(--brand-primary)] hover:underline";
  const moreClass =
    tone === "warning"
      ? "pt-1 text-xs text-amber-900/80"
      : "pt-1 text-xs text-[var(--foreground)]/60";

  return (
    <div className="space-y-1.5">
      <p
        className={
          tone === "warning"
            ? "text-xs font-medium text-amber-950"
            : "text-xs font-medium text-[var(--foreground)]/70"
        }
      >
        Applications using this CV
      </p>
      <ul className={listClass}>
        {applications.map((app) => (
          <li key={app.id} className="flex items-baseline justify-between gap-2">
            <Link
              href={`/admin/edit/${app.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {masterCvApplicationPreviewLabel(app)}
            </Link>
            <span className={metaClass}>{app.status}</span>
          </li>
        ))}
        {remaining > 0 && (
          <li className={moreClass}>
            and {remaining} more application{remaining === 1 ? "" : "s"}
          </li>
        )}
      </ul>
    </div>
  );
}
