"use client";

import { publishApplication } from "@/lib/api/applications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DraftPreviewBannerProps {
  applicationId: string;
}

/**
 * Sticky owner banner on the public share URL when viewing a draft (F16-050).
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
      className="sticky top-0 z-50 border-b border-amber-500/40 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm font-medium">
          Draft preview — recruiters cannot see this page until you publish.
          {error ? (
            <span className="mt-1 block font-normal text-red-700">{error}</span>
          ) : null}
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/admin"
            className="rounded-md border border-amber-700/30 bg-white px-3 py-1.5 text-sm font-medium text-amber-950 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-1"
          >
            Dashboard
          </Link>
          <Link
            href={`/admin/edit/${applicationId}`}
            className="rounded-md border border-amber-700/30 bg-white px-3 py-1.5 text-sm font-medium text-amber-950 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-1"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-md bg-amber-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-1 disabled:opacity-60"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
