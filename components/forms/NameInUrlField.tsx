"use client";

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
    <fieldset className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
      <legend className="px-1 text-base font-semibold text-[var(--foreground)]">
        Name in URL
      </legend>
      <p className="mt-0.5 mb-3 text-sm text-[var(--foreground)]/80">
        Choose where your name appears in the shareable link (if at all).
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === null}
            onChange={() => onChange(null)}
            className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <span className="text-base font-medium text-[var(--foreground)]">None</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === "start"}
            onChange={() => onChange("start")}
            className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <span className="text-base font-medium text-[var(--foreground)]">At start</span>
          <span className="text-sm text-[var(--foreground)]/60">
            (e.g. john-doe-company-role)
          </span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === "end"}
            onChange={() => onChange("end")}
            className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
          />
          <span className="text-base font-medium text-[var(--foreground)]">At end</span>
          <span className="text-sm text-[var(--foreground)]/60">
            (e.g. company-role-john-doe)
          </span>
        </label>
      </div>
    </fieldset>
  );
}
