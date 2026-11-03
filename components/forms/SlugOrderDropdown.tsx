"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/admin/icons";
import type { SlugSegmentOrder } from "@/lib/utils/slug-generate";

const OPTIONS: { value: SlugSegmentOrder; label: string }[] = [
  { value: "company_role", label: "Company + Role" },
  { value: "role_company", label: "Role + Company" },
];

/**
 * Create-form order picker. Company + Role is the first option and the
 * default when nothing else is stored.
 */
export default function SlugOrderDropdown({
  id,
  value,
  onChange,
  fieldLabel,
}: {
  id: string;
  value: SlugSegmentOrder;
  onChange: (next: SlugSegmentOrder) => void;
  /** Names the control without tying a clickable label to the button. */
  fieldLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(
    0,
    OPTIONS.findIndex((option) => option.value === value),
  );
  const selected = OPTIONS[selectedIndex] ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const choose = (next: SlugSegmentOrder) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={
          fieldLabel ? `${fieldLabel}, ${selected.label}` : selected.label
        }
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 bg-[var(--ink)]/[0.02] py-1.5 pr-3 pl-3.5 text-left text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)]/15 outline-hidden focus:ring-2 focus:ring-inset focus:ring-[var(--ink)] sm:text-sm sm:leading-6"
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((prev) => !prev);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              setActiveIndex(selectedIndex);
              setOpen(true);
              return;
            }
            const delta = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex(
              (index) => (index + delta + OPTIONS.length) % OPTIONS.length,
            );
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) {
              setActiveIndex(selectedIndex);
              setOpen(true);
            } else {
              choose(OPTIONS[activeIndex]?.value ?? selected.value);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span>{selected.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Company and role order"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] py-1 shadow-[0_12px_32px_-16px_rgba(11,11,12,0.45)]"
        >
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left text-sm text-[var(--ink)] ${
                    isActive ? "bg-[var(--ink)]/[0.04]" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <CheckIcon className="h-4 w-4 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
