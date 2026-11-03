"use client";

import { CheckIcon } from "@/components/admin/icons";
import Button from "@/components/ui/Button";
import { useEffect, useRef, type ReactNode } from "react";

export type ChecklistChapterId = "role" | "candidate" | "materials" | "video";

export type ChecklistChapterTone = "done" | "pending" | "optional";

export type ChecklistChapter = {
  id: ChecklistChapterId;
  title: string;
  description: string;
  /** One line shown when the chapter is closed, and under the checklist title. */
  summary: string;
  /** Pink summary: the line is a gap, not an answer. */
  summaryPending: boolean;
  /** Grey summary for an in-flight check, such as "Checking...". */
  summaryProgress?: boolean;
  tone: ChecklistChapterTone;
  content: ReactNode;
};

const CHAPTER_ORDER: ChecklistChapterId[] = [
  "role",
  "candidate",
  "materials",
  "video",
];

const NEXT_LABEL: Record<ChecklistChapterId, string | null> = {
  role: "Next, about you",
  candidate: "Next, résumé",
  materials: "Next, pitch",
  video: null,
};

const ROW_CLASS =
  "flex min-h-11 w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left outline-none hover:bg-[var(--ink)]/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

interface ApplicationFormChecklistLayoutProps {
  chapters: ChecklistChapter[];
  openId: ChecklistChapterId;
  onOpen: (id: ChecklistChapterId) => void;
  /** Path recruiters will open, without the site origin. */
  sharePath: string;
  /** Save, its reason, and preview. */
  actions: ReactNode;
}

export default function ApplicationFormChecklistLayout({
  chapters,
  openId,
  onOpen,
  sharePath,
  actions,
}: ApplicationFormChecklistLayoutProps) {
  const skipFocus = useRef(true);
  const completed = chapters.filter((chapter) => chapter.tone !== "pending").length;
  const total = chapters.length;
  const allDone = total > 0 && completed === total;
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const openChapter = chapters.find((chapter) => chapter.id === openId) ?? chapters[0];
  const nextId = CHAPTER_ORDER[CHAPTER_ORDER.indexOf(openId) + 1] ?? null;

  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    document.getElementById(`application-chapter-${openId}`)?.focus();
  }, [openId]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
            New application
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
            One part of the form is open. The others stay as a single line.
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>

      <div className="mt-10 grid items-start gap-8 min-[1100px]:grid-cols-[22rem_minmax(0,1fr)] min-[1100px]:gap-12">
        <section
          className="overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-[var(--white)] min-[1100px]:sticky min-[1100px]:top-[calc(var(--admin-header-height,72px)+1.5rem)]"
          aria-labelledby="application-checklist-heading"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
            <h2
              id="application-checklist-heading"
              className="font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]"
            >
              This application
            </h2>
            <span
              className="shrink-0 rounded-full bg-[var(--lime)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--ink)]"
              aria-hidden
            >
              {allDone ? "Done" : `${completed}/${total}`}
            </span>
          </div>
          <div className="border-t border-[var(--ink)]/8 px-4 pt-3 pb-3 sm:px-5">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/[0.08]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={completed}
              aria-label={
                allDone
                  ? "All steps done"
                  : `${completed} of ${total} steps complete`
              }
            >
              <div
                className="h-full rounded-full bg-[var(--lime)] motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <ol className="space-y-0 px-3 py-2">
            {chapters.map((chapter) => {
              const open = chapter.id === openId;
              const settled = chapter.tone !== "pending";
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    aria-current={open ? "step" : undefined}
                    onClick={() => onOpen(chapter.id)}
                    className={`${ROW_CLASS} ${open ? "bg-[var(--ink)]/[0.04]" : ""}`}
                  >
                    <ChecklistMark tone={chapter.tone} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm font-medium leading-snug ${
                            settled
                              ? "text-[var(--muted)] line-through"
                              : "text-[var(--ink)]"
                          }`}
                        >
                          {chapter.title}
                        </span>
                        {chapter.tone === "optional" ? (
                          <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                            Optional
                          </span>
                        ) : null}
                      </span>
                      {chapter.tone === "optional" ? null : (
                        <span
                          className={`mt-0.5 block text-sm leading-snug break-words ${summaryClass(chapter)}`}
                        >
                          {chapter.summary}
                        </span>
                      )}
                    </span>
                    {chapter.tone === "done" ? (
                      <span className="sr-only">Completed</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="border-t border-[var(--ink)]/8 px-5 py-3 text-sm leading-relaxed break-words text-[var(--ink)]">
            {sharePath}
          </p>
        </section>

        <div className="overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-[var(--white)]">
          {chapters.map((chapter) => {
            const open = chapter.id === openId;
            const panelId = `application-chapter-panel-${chapter.id}`;
            const headingId = `application-chapter-heading-${chapter.id}`;
            return (
              <div
                key={chapter.id}
                className="border-b border-[var(--ink)]/10 last:border-b-0"
              >
                <h2
                  id={headingId}
                  className="text-base font-semibold tracking-[-0.01em]"
                >
                  <button
                    id={`application-chapter-${chapter.id}`}
                    type="button"
                    aria-expanded={open}
                    aria-controls={open ? panelId : undefined}
                    onClick={() => onOpen(chapter.id)}
                    className="flex w-full flex-col items-start gap-0.5 px-5 py-4 text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--ink)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <span>{chapter.title}</span>
                    {open ? null : (
                      <span
                        className={`min-w-0 truncate text-sm font-normal ${summaryClass(chapter)}`}
                      >
                        {chapter.summary}
                      </span>
                    )}
                  </button>
                </h2>
                {open && openChapter ? (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-5 pb-5"
                  >
                    <p className="mb-5 max-w-prose text-sm leading-relaxed text-[var(--muted)]">
                      {openChapter.description}
                    </p>
                    {openChapter.content}
                    {nextId && NEXT_LABEL[openId] ? (
                      <div className="mt-6">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => onOpen(nextId)}
                        >
                          {NEXT_LABEL[openId]}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function summaryClass(chapter: ChecklistChapter): string {
  if (chapter.summaryProgress) return "text-[var(--muted)] italic opacity-60";
  if (chapter.summaryPending) return "text-[var(--pink-text)]";
  return "text-[var(--muted)]";
}

function ChecklistMark({ tone }: { tone: ChecklistChapterTone }) {
  if (tone === "done") {
    return (
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"
        aria-hidden
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (tone === "optional") {
    return (
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--ink)]/20"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[var(--white)]"
      aria-hidden
    />
  );
}
