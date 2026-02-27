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
 * Used in application cards and other admin insight lists.
 */
export default function InsightItem({ label, children, className = "" }: InsightItemProps) {
  return (
    <div
      className={`rounded border border-[var(--foreground)]/10 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]/60 ${className}`.trim()}
    >
      {label}{" "}
      <strong className="font-medium text-[var(--foreground)]">{children}</strong>
    </div>
  );
}
