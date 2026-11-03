"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import AdminModal from "@/components/admin/AdminModal";
import { QuestionIcon } from "@/components/admin/icons";

export type ApplicationFormPageRow =
  | {
      type: "section";
      id: string;
      label: string;
      optional?: boolean;
    }
  | {
      type: "field";
      id: string;
      label: string;
      /** Associates the row label with a single control. */
      labelFor?: string;
      /**
       * `field` lines the label up with a one-line input.
       * `top` keeps it with the first line of a taller group.
       */
      align?: "field" | "top";
      /** Helper under the title. */
      hint?: string;
      /** Opens in a dialog from an icon beside the title. */
      info?: string;
      className?: string;
      /**
       * `split` puts the title on the left and the control on the right.
       * `result` stacks them full width, for the finished shareable link.
       */
      layout?: "split" | "result";
      children: ReactNode;
    }
  | {
      /** Renders its own field rows, such as the résumé choices. */
      type: "block";
      id: string;
      children: ReactNode;
    };

interface ApplicationFormSinglePageLayoutProps {
  title: string;
  description: string;
  rows: ApplicationFormPageRow[];
  /** Save control. */
  actions: ReactNode;
  cancelHref: string;
  /** Why save is blocked, shown above the buttons. */
  blockedReason?: string | null;
  /** Moves focus to the first gap named by `blockedReason`. */
  onBlockedReason?: () => void;
}

const FIELD_TITLE = "text-sm font-normal leading-5 text-[var(--ink)]";
const FIELD_DESC = "mt-0.5 text-sm font-normal leading-5 text-[var(--muted)]";

const fieldRowClass =
  "grid scroll-mt-[calc(var(--admin-header-height,72px)+0.75rem)] gap-1 border-t border-[var(--ink)]/10 p-4 first:border-t-0 sm:grid-cols-2 sm:gap-6";

/**
 * One create-form entry: title (and optional description) on the left,
 * control on the right. Below `sm` the title sits above the control.
 */
export function ApplicationFormFieldRow({
  id,
  label,
  labelFor,
  hint,
  info,
  className = "",
  layout = "split",
  children,
}: {
  id: string;
  label: string;
  labelFor?: string;
  /** Accepted for older call sites. Labels always sit at the top of the row. */
  align?: "field" | "top";
  hint?: string;
  /** Opens in a dialog from an icon beside the title. */
  info?: string;
  /** Extra classes on the row, such as a stacking order for an open menu. */
  className?: string;
  /** `result` stacks the title above a full-width control. */
  layout?: "split" | "result";
  children: ReactNode;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const title = labelFor ? (
    <label htmlFor={labelFor} className={FIELD_TITLE}>
      {label}
    </label>
  ) : (
    <p className={FIELD_TITLE}>{label}</p>
  );
  const copy = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        {title}
        {info ? (
          <button
            type="button"
            className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            aria-label={`About ${label}`}
            aria-expanded={infoOpen}
            onClick={() => setInfoOpen(true)}
          >
            <QuestionIcon className="size-4" />
          </button>
        ) : null}
      </div>
      {hint ? <p className={FIELD_DESC}>{hint}</p> : null}
      {info ? (
        <AdminModal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={label}
          headerClose
          widthClassName="w-[min(100vw-2rem,24rem)]"
        >
          <p className="text-sm leading-6 text-[var(--ink)]">{info}</p>
        </AdminModal>
      ) : null}
    </div>
  );
  if (layout === "result") {
    return (
      <div
        id={id}
        className={`scroll-mt-[calc(var(--admin-header-height,72px)+0.75rem)] border-t border-[var(--ink)]/10 bg-[var(--ink)]/[0.03] p-4 ${className}`}
      >
        {copy}
        <div className="mt-3 min-w-0">{children}</div>
      </div>
    );
  }
  return (
    <div id={id} className={`${fieldRowClass} sm:items-start ${className}`}>
      {copy}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function groupRows(rows: ApplicationFormPageRow[]) {
  const groups: {
    section: Extract<ApplicationFormPageRow, { type: "section" }> | null;
    items: Exclude<ApplicationFormPageRow, { type: "section" }>[];
  }[] = [];
  let current: (typeof groups)[number] | null = null;

  for (const row of rows) {
    if (row.type === "section") {
      current = { section: row, items: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      current = { section: null, items: [] };
      groups.push(current);
    }
    current.items.push(row);
  }

  return groups;
}

/**
 * Create form: page title and description, then a titled card per section.
 * Each entry has its title on the left and the control on the right.
 */
export default function ApplicationFormSinglePageLayout({
  title,
  description,
  rows,
  actions,
  cancelHref,
  blockedReason,
  onBlockedReason,
}: ApplicationFormSinglePageLayoutProps) {
  const groups = groupRows(rows);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
          {title}
        </h1>
        <p className="mt-1 text-base font-normal leading-6 text-[var(--muted)]">
          {description}
        </p>
      </header>

      {groups.map((group) => (
        <section
          key={group.section?.id ?? group.items[0]?.id ?? "fields"}
          className="space-y-3"
        >
          {group.section ? (
            <h2
              id={group.section.id}
              className="scroll-mt-[calc(var(--admin-header-height,72px)+0.75rem)] text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]"
            >
              {group.section.label}
              {group.section.optional ? (
                <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                  (optional)
                </span>
              ) : null}
            </h2>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--white)]">
            {group.items.map((row) =>
              row.type === "block" ? (
                <div
                  key={row.id}
                  id={row.id}
                  className="scroll-mt-[calc(var(--admin-header-height,72px)+0.75rem)]"
                >
                  {row.children}
                </div>
              ) : (
                <ApplicationFormFieldRow
                  key={row.id}
                  id={row.id}
                  label={row.label}
                  labelFor={row.labelFor}
                  align={row.align}
                  hint={row.hint}
                  info={row.info}
                  className={row.className}
                  layout={row.type === "field" ? row.layout : undefined}
                >
                  {row.children}
                </ApplicationFormFieldRow>
              ),
            )}
          </div>
        </section>
      ))}

      <div className="flex flex-col items-end gap-2">
        {blockedReason ? (
          <button
            type="button"
            onClick={onBlockedReason}
            className="max-w-sm cursor-pointer text-right text-sm leading-snug text-[var(--muted)] underline decoration-[var(--ink)]/25 underline-offset-2 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            {blockedReason}
          </button>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <Link
            href={cancelHref}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--ink)]/12 bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            Cancel
          </Link>
          {actions}
        </div>
      </div>
    </div>
  );
}
