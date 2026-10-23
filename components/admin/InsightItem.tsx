"use client";

import { type ReactNode } from "react";

export interface InsightItemProps {
  /** Label shown before the value (e.g. "Views:", "Created:") */
  label: string;
  /** Value content (number, date string, or "—") */
  children: ReactNode;
  /** Optional additional class names for the container */
  className?: string;
}

/**
 * Single insight row with label and value, wrapped in a bordered container.
 * Used in the application insights dialog and other admin insight lists.
 */
export default function InsightItem({ label, children, className = "" }: InsightItemProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] px-3 py-2 text-sm text-[var(--muted)] ${className}`.trim()}
    >
      {label}{" "}
      <strong className="font-medium text-[var(--ink)]">{children}</strong>
    </div>
  );
}
