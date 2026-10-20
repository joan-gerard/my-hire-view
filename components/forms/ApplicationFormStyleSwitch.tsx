"use client";

import type { ApplicationFormStyle } from "@/lib/utils/application-form-style";
import { APPLICATION_FORM_STYLE_VALUES } from "@/lib/utils/application-form-style";

const LABELS: Record<ApplicationFormStyle, string> = {
  sections: "Sections",
  wizard: "Wizard",
};

/** Focus ring on the visible pill when the nested radio is focused. */
const PILL_FOCUS =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ink)]";

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
      className="inline-flex rounded-full border border-[var(--ink)]/12 bg-[var(--white)] p-0.5"
      role="radiogroup"
      aria-label="Application form layout (testing)"
    >
      {APPLICATION_FORM_STYLE_VALUES.map((value) => {
        const active = style === value;
        return (
          <label
            key={value}
            className={
              active
                ? `cursor-pointer rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-[var(--white)] ${PILL_FOCUS}`
                : `cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] ${PILL_FOCUS}`
            }
          >
            <input
              type="radio"
              name="application-form-style"
              value={value}
              checked={active}
              onChange={() => {
                if (value === style) return;
                onChange(value);
              }}
              className="sr-only"
            />
            {LABELS[value]}
          </label>
        );
      })}
    </div>
  );
}
