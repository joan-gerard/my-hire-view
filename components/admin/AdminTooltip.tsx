"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
} from "react";

export type AdminTooltipProps = {
  /** Visible tip text (also linked via `aria-describedby`). */
  label: string;
  /** Single focusable/hoverable control (button, link, or span). */
  children: ReactElement;
  /** Prefer top for icon rows so tips stay clear of menus below. */
  side?: "top" | "bottom";
};

type TriggerProps = {
  "aria-describedby"?: string;
  title?: string;
  className?: string;
};

/**
 * Instant custom tooltip (no native `title` delay).
 * Shows on hover, or keyboard focus (`:focus-visible`) — not plain focus, so
 * returning focus after closing a dialog does not leave the tip stuck open.
 * Hides while the child reports `aria-expanded="true"` (open menus / dialogs).
 */
export default function AdminTooltip({
  label,
  children,
  side = "top",
}: AdminTooltipProps) {
  const tipId = useId();
  const child = Children.only(children);

  if (!isValidElement(child)) {
    return children;
  }

  const childProps = child.props as TriggerProps;
  const trigger = cloneElement(child as ReactElement<TriggerProps>, {
    "aria-describedby": tipId,
    // Avoid stacking the slow native browser tooltip on top of ours.
    title: undefined,
    className: [childProps.className, "peer"].filter(Boolean).join(" "),
  });

  const positionClass =
    side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5";

  const caretClass =
    side === "bottom"
      ? "bottom-full left-1/2 -mb-px -translate-x-1/2 border-b-[var(--ink)] border-l-transparent border-r-transparent border-t-transparent"
      : "top-full left-1/2 -mt-px -translate-x-1/2 border-t-[var(--ink)] border-l-transparent border-r-transparent border-b-transparent";

  return (
    <span className="relative inline-flex">
      {trigger}
      <span
        id={tipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 hidden w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-[var(--ink)] px-2 py-1 text-center text-xs font-medium leading-snug text-[var(--white)] shadow-[0_8px_20px_-8px_rgba(11,11,12,0.45)] peer-hover:block peer-focus-visible:block peer-[[aria-expanded=true]]:hidden ${positionClass}`}
      >
        {label}
        <span
          aria-hidden
          className={`absolute h-0 w-0 border-4 ${caretClass}`}
        />
      </span>
    </span>
  );
}
