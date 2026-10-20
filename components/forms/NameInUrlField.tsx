"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";

export type SlugNamePosition = "start" | "end" | null;

export interface NameInUrlFieldProps {
  value: SlugNamePosition;
  onChange: (value: SlugNamePosition) => void;
}

export default function NameInUrlField({
  value,
  onChange,
}: NameInUrlFieldProps) {
  return (
    <fieldset className={ADMIN_FIELDSET_CLASS}>
      <legend className="text-base font-semibold text-[var(--ink)]">
        Name in URL
      </legend>
      <p className="mt-0.5 mb-3 text-sm text-[var(--muted)]">
        Choose where your name appears in the shareable link (if at all).
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === null}
            onChange={() => onChange(null)}
            className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
          />
          <span className="text-base font-medium text-[var(--ink)]">None</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === "start"}
            onChange={() => onChange("start")}
            className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
          />
          <span className="text-base font-medium text-[var(--ink)]">At start</span>
          <span className="text-sm text-[var(--muted)]">
            (e.g. john-doe-company-role)
          </span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === "end"}
            onChange={() => onChange("end")}
            className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
          />
          <span className="text-base font-medium text-[var(--ink)]">At end</span>
          <span className="text-sm text-[var(--muted)]">
            (e.g. company-role-john-doe)
          </span>
        </label>
      </div>
    </fieldset>
  );
}
