"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";
import type { SlugSegmentOrder } from "@/lib/utils/slug-generate";

export type { SlugSegmentOrder };

export interface SlugSegmentOrderFieldProps {
  value: SlugSegmentOrder;
  onChange: (value: SlugSegmentOrder) => void;
}

export default function SlugSegmentOrderField({
  value,
  onChange,
}: SlugSegmentOrderFieldProps) {
  return (
    <fieldset className={ADMIN_FIELDSET_CLASS}>
      <legend className="text-base font-semibold text-[var(--ink)]">
        URL segment order
      </legend>
      <p className="mt-0.5 mb-3 text-sm text-[var(--muted)]">
        Choose how company and role appear in the shareable link after your
        username.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
        <label className="inline-flex cursor-pointer items-start gap-2.5 sm:items-center">
          <input
            type="radio"
            name="slugSegmentOrder"
            checked={value === "company_role"}
            onChange={() => onChange("company_role")}
            className="mt-0.5 h-4 w-4 shrink-0 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)] sm:mt-0"
          />
          <span>
            <span className="block text-base font-medium text-[var(--ink)]">
              Company then role
            </span>
            <span className="text-sm text-[var(--muted)]">
              e.g. acme-software-engineer
            </span>
          </span>
        </label>
        <label className="inline-flex cursor-pointer items-start gap-2.5 sm:items-center">
          <input
            type="radio"
            name="slugSegmentOrder"
            checked={value === "role_company"}
            onChange={() => onChange("role_company")}
            className="mt-0.5 h-4 w-4 shrink-0 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)] sm:mt-0"
          />
          <span>
            <span className="block text-base font-medium text-[var(--ink)]">
              Role then company
            </span>
            <span className="text-sm text-[var(--muted)]">
              e.g. software-engineer-acme
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
