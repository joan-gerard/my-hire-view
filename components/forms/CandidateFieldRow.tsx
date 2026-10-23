"use client";

import Input from "@/components/ui/Input";

export interface CandidateFieldRowProps {
  id: string;
  label: string;
  type?: "text" | "url";
  value: string;
  included: boolean;
  onValueChange: (value: string) => void;
  onIncludedChange: (included: boolean) => void;
}

const choiceClass = (selected: boolean) =>
  selected
    ? "rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-[var(--white)]"
    : "rounded-full px-3 py-1 text-xs font-semibold text-[var(--muted)]";

export default function CandidateFieldRow({
  id,
  label,
  type = "text",
  value,
  included,
  onValueChange,
  onIncludedChange,
}: CandidateFieldRowProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={id}
          className={`text-sm font-medium ${included ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
        >
          {label}
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={included}
          aria-label={`Show ${label} to recruiters`}
          onClick={() => onIncludedChange(!included)}
          className="inline-flex rounded-full border border-[var(--ink)]/12 bg-[var(--white)] p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2"
        >
          <span className={choiceClass(included)}>Show</span>
          <span className={choiceClass(!included)}>Hidden</span>
        </button>
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={!included}
        placeholder={included ? undefined : "Hidden from recruiters"}
      />
    </div>
  );
}
