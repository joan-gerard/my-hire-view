"use client";

import Switch from "@/components/ui/Switch";

interface VisibilityToggleProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  /** Used in the switch accessible name (e.g. Picture, Email). */
  subjectLabel: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Shared About you / profile visibility control: Visible|Hidden label + switch.
 * Unchecked uses neutral grey (never warning/error wash).
 */
export default function VisibilityToggle({
  visible,
  onVisibleChange,
  subjectLabel,
  disabled = false,
  className = "",
}: VisibilityToggleProps) {
  const stateLabel = visible ? "Visible" : "Hidden";
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <span
        className={`text-sm ${
          visible ? "text-[var(--ink)]" : "text-[var(--muted)]"
        }`}
        aria-hidden
      >
        {stateLabel}
      </span>
      <Switch
        checked={visible}
        onCheckedChange={onVisibleChange}
        disabled={disabled}
        aria-label={`${subjectLabel}: ${stateLabel}`}
      />
    </div>
  );
}
