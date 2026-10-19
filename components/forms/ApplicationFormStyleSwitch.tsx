"use client";

import type { ApplicationFormStyle } from "@/lib/utils/application-form-style";
import { APPLICATION_FORM_STYLE_VALUES } from "@/lib/utils/application-form-style";

const LABELS: Record<ApplicationFormStyle, string> = {
  sections: "Sections",
  wizard: "Wizard",
};

interface ApplicationFormStyleSwitchProps {
  style: ApplicationFormStyle;
  onChange: (next: ApplicationFormStyle) => void;
}

/**
 * Dev / eval control for F35 layout A/B — not a product setting for candidates.
 */
export default function ApplicationFormStyleSwitch({
  style,
  onChange,
}: ApplicationFormStyleSwitchProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--ink)]/20 bg-[var(--paper)]/80 px-3 py-2.5"
      role="group"
      aria-label="Application form layout (testing)"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Form layout (F35 test)
        </p>
        <p className="text-xs text-[var(--muted)]">
          Switch freely while manual-testing. Choice is saved in this browser.
        </p>
      </div>
      <div className="inline-flex shrink-0 rounded-full border border-[var(--ink)]/12 bg-[var(--white)] p-0.5">
        {APPLICATION_FORM_STYLE_VALUES.map((value) => {
          const active = style === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-pressed={active}
              className={
                active
                  ? "cursor-pointer rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-[var(--white)]"
                  : "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
              }
            >
              {LABELS[value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
