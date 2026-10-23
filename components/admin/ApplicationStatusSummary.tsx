"use client";

import { useId, useLayoutEffect, useState } from "react";
import { ADMIN_PANEL_CLASS } from "@/components/admin/admin-chrome";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/admin/icons";
import type { ApplicationDashboardCounts } from "@/lib/types/application";

const SUMMARY_EXPANDED_STORAGE_KEY = "myhireview:dashboard-summary-expanded";

export type ApplicationStatusSummaryProps = {
  counts: ApplicationDashboardCounts;
  loading?: boolean;
  /** When set, counts are unreliable — show the message instead of zeros. */
  error?: string | null;
};

type SummaryRow = {
  key: keyof ApplicationDashboardCounts;
  label: string;
  hint: string;
};

const ROWS: SummaryRow[] = [
  { key: "all", label: "All", hint: "Every application" },
  { key: "active", label: "Live", hint: "Published and shareable" },
  { key: "draft", label: "Draft", hint: "Not visible to recruiters yet" },
  { key: "archived", label: "Archived", hint: "Hidden from recruiters" },
];

function readStoredExpanded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SUMMARY_EXPANDED_STORAGE_KEY);
    if (raw === null) return true;
    return raw !== "false";
  } catch {
    return true;
  }
}

/**
 * Right-rail tally of applications by status (dashboard only). Collapsible.
 */
export default function ApplicationStatusSummary({
  counts,
  loading = false,
  error = null,
}: ApplicationStatusSummaryProps) {
  const panelId = useId();
  const headingId = useId();
  const [expanded, setExpanded] = useState(true);

  useLayoutEffect(() => {
    setExpanded(readStoredExpanded());
  }, []);

  const setExpandedAndPersist = (next: boolean) => {
    setExpanded(next);
    try {
      window.localStorage.setItem(
        SUMMARY_EXPANDED_STORAGE_KEY,
        next ? "true" : "false",
      );
    } catch {
      // ignore quota / private mode
    }
  };

  return (
    <section
      className={`${ADMIN_PANEL_CLASS} overflow-hidden`}
      aria-labelledby={headingId}
      aria-busy={loading || undefined}
    >
      <h2 id={headingId} className="m-0">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left sm:px-5 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpandedAndPersist(!expanded)}
        >
          <span className="min-w-0">
            <span className="block font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]">
              Summary
            </span>
            <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">
              {expanded
                ? "Across all your applications"
                : `${counts.all} total · ${counts.active} live`}
            </span>
          </span>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-2 text-[var(--muted)]">
            {!expanded ? (
              <span
                className={`text-sm font-semibold tabular-nums text-[var(--ink)] ${
                  loading ? "opacity-40" : ""
                }`}
              >
                {counts.all}
              </span>
            ) : null}
            {expanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </span>
        </button>
      </h2>

      {expanded ? (
        error ? (
          <p
            id={panelId}
            role="alert"
            className="border-t border-[var(--ink)]/8 px-4 py-3 text-sm text-[var(--status-danger-fg)] sm:px-5"
          >
            Couldn’t load status counts. Try refreshing the page.
          </p>
        ) : (
        <ul
          id={panelId}
          className="divide-y divide-[var(--ink)]/8 border-t border-[var(--ink)]/8"
        >
          {ROWS.map((row) => (
            <li
              key={row.key}
              className="flex items-baseline justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--ink)]">
                  {row.label}
                </p>
                <p className="text-xs text-[var(--muted)]">{row.hint}</p>
              </div>
              <p
                className={`shrink-0 text-lg font-semibold tabular-nums tracking-[-0.02em] text-[var(--ink)] ${
                  loading ? "opacity-40" : ""
                }`}
              >
                {counts[row.key]}
              </p>
            </li>
          ))}
        </ul>
        )
      ) : (
        <div id={panelId} hidden />
      )}
    </section>
  );
}
