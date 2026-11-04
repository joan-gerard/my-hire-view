"use client";

import type { ButtonHTMLAttributes } from "react";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "aria-checked" | "onClick" | "children"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name when there is no visible label. */
  "aria-label": string;
};

/**
 * Compact on/off control. Checked is an ink track with a lime thumb;
 * unchecked is a quiet wash with a white thumb.
 */
export default function Switch({
  checked,
  onCheckedChange,
  className = "",
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`peer inline-flex h-5 w-[34px] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--ink)] data-[state=checked]:hover:bg-[var(--ink)]/90 data-[state=unchecked]:bg-[var(--ink)]/15 data-[state=unchecked]:hover:bg-[var(--ink)]/25 ${className}`}
      {...props}
    >
      <span
        aria-hidden
        data-state={checked ? "checked" : "unchecked"}
        className="pointer-events-none block size-4 rounded-full bg-[var(--white)] shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[15px] data-[state=checked]:bg-[var(--lime)] data-[state=unchecked]:translate-x-px"
      />
    </button>
  );
}
