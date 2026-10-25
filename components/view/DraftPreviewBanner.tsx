"use client";

import {
  ADMIN_PRIMARY_CLASS,
  ADMIN_SECONDARY_CLASS,
} from "@/components/admin/admin-chrome";
import { VIEW_SHELL_CLASS } from "@/components/view/view-chrome";
import { publishApplication } from "@/lib/api/applications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DraftPreviewBannerProps {
  applicationId: string;
}

const BANNER_SECONDARY_CLASS = `${ADMIN_SECONDARY_CLASS} border-[var(--status-warning-fg)]/30 text-[var(--status-warning-fg)] hover:bg-[var(--status-warning-fg)]/10`;

/**
 * Sticky owner banner on the public share URL when viewing a draft (F16-050).
 * Pink-text warning chrome on light paper (F34) — not generic amber SaaS.
 */
export default function DraftPreviewBanner({
  applicationId,
}: DraftPreviewBannerProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    setError(null);
    try {
      await publishApplication(applicationId);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish application",
      );
      setPublishing(false);
    }
  };

  return (
    <div
      role="status"
      className="sticky top-0 z-50 border-b border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)] py-3 text-[var(--status-warning-fg)]"
    >
      <div
        className={`${VIEW_SHELL_CLASS} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <p className="min-w-0 text-sm font-medium">
          Draft preview — recruiters cannot see this page until you publish.
          {error ? (
            <span className="mt-1 block font-normal text-[var(--status-danger-fg)]">
              {error}
            </span>
          ) : null}
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/admin" className={BANNER_SECONDARY_CLASS}>
            Dashboard
          </Link>
          <Link
            href={`/admin/edit/${applicationId}`}
            className={BANNER_SECONDARY_CLASS}
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className={ADMIN_PRIMARY_CLASS}
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
