"use client";

import { CheckIcon } from "@/components/admin/icons";
import CandidateFieldRow from "@/components/forms/CandidateFieldRow";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LogoBlack } from "@/components/ui/Logo";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * UI-only proposal for creating an application.
 * Typing updates the sketch on this page. Nothing is saved or uploaded.
 */

type ChapterId = "role" | "you" | "cv" | "intro";
type SegmentOrder = "company-role" | "role-company";
type CvSource = "saved" | "tailored";

type DemoValues = {
  company: string;
  role: string;
  segmentOrder: SegmentOrder;
  /** Null follows company and role. A string is the link the person typed. */
  slugManual: string | null;
  showPicture: boolean;
  firstName: string;
  lastName: string;
  showFirst: boolean;
  showLast: boolean;
  location: string;
  showLocation: boolean;
  portfolio: string;
  showPortfolio: boolean;
  linkedin: string;
  showLinkedin: boolean;
  cvSource: CvSource;
  savedCv: string;
  tailoredName: string;
  useOriginalName: boolean;
  videoUrl: string;
};

const SAVED_CVS = ["Product-design-2026.pdf", "General-CV.pdf"] as const;

const CHAPTERS: { id: ChapterId; title: string; description: string }[] = [
  {
    id: "role",
    title: "Role",
    description: "Company, role, and the link recruiters open.",
  },
  {
    id: "you",
    title: "About you",
    description: "Choose what this page shows about you. None of this is required.",
  },
  {
    id: "cv",
    title: "Résumé",
    description: "A résumé from your library, or a PDF only for this role.",
  },
  {
    id: "intro",
    title: "Pitch",
    description: "A YouTube video they can watch on the page.",
  },
];

const INITIAL_VALUES: DemoValues = {
  company: "Northwind",
  role: "Product designer",
  segmentOrder: "company-role",
  slugManual: null,
  showPicture: true,
  firstName: "Alex",
  lastName: "Mora",
  showFirst: true,
  showLast: true,
  location: "Lisbon",
  showLocation: true,
  portfolio: "https://mora.design",
  showPortfolio: true,
  linkedin: "https://www.linkedin.com/in/alexmora",
  showLinkedin: false,
  cvSource: "saved",
  savedCv: SAVED_CVS[0],
  tailoredName: "",
  useOriginalName: true,
  videoUrl: "",
};

const textButtonClass =
  "rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

const linkClass =
  "font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Keeps a trailing hyphen so a person can keep typing the next word. */
function slugifyLive(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, 80);
}

function suggestedSlug(values: DemoValues): string {
  const company = slugify(values.company);
  const role = slugify(values.role);
  const parts =
    values.segmentOrder === "role-company" ? [role, company] : [company, role];
  return parts.filter(Boolean).join("-");
}

function displaySlug(values: DemoValues): string {
  if (values.slugManual === null) return suggestedSlug(values);
  return slugify(values.slugManual);
}

function cvFilename(values: DemoValues): string {
  if (values.cvSource === "saved") return values.savedCv;
  return values.tailoredName.trim();
}

function downloadName(values: DemoValues): string {
  const file = cvFilename(values);
  if (!file) return "";
  if (values.useOriginalName) return file;
  const slug = displaySlug(values);
  return `CV-${slug || "draft"}.pdf`;
}

type VideoState = "empty" | "ok" | "check";

function videoState(url: string): VideoState {
  const value = url.trim();
  if (!value) return "empty";
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (
      host === "youtu.be" ||
      host === "youtube.com" ||
      host.endsWith(".youtube.com")
    ) {
      return "ok";
    }
  } catch {
    return "check";
  }
  return "check";
}

function initials(first: string, last: string): string {
  const letters = `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase();
  return letters || "·";
}

function shownName(values: DemoValues): string {
  return [
    values.showFirst ? values.firstName.trim() : "",
    values.showLast ? values.lastName.trim() : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function roleSummary(values: DemoValues): string {
  const company = values.company.trim();
  const role = values.role.trim();
  if (company && role) return `${company} · ${role}`;
  return company || role || "Add a company and role";
}

function youSummary(values: DemoValues): string {
  const parts: string[] = [];
  if (values.showPicture) parts.push("Picture");
  const name = shownName(values);
  if (name) parts.push(name);
  if (values.showLocation && values.location.trim()) parts.push(values.location.trim());
  if (values.showPortfolio && values.portfolio.trim()) parts.push("Portfolio");
  if (values.showLinkedin && values.linkedin.trim()) parts.push("LinkedIn");
  return parts.length > 0 ? parts.join(", ") : "Nothing shown";
}

function cvSummary(values: DemoValues): string {
  return cvFilename(values) || "Choose a file";
}

function introSummary(values: DemoValues): { text: string; pending: boolean } {
  const state = videoState(values.videoUrl);
  if (state === "ok") return { text: "YouTube link added", pending: false };
  if (state === "check") return { text: "Check the link", pending: true };
  return { text: "Still needed", pending: true };
}

function chapterSummary(id: ChapterId, values: DemoValues): { text: string; pending: boolean } {
  if (id === "role") {
    const text = roleSummary(values);
    return { text, pending: text === "Add a company and role" };
  }
  if (id === "you") return { text: youSummary(values), pending: false };
  if (id === "cv") {
    const text = cvSummary(values);
    return { text, pending: text === "Choose a file" };
  }
  return introSummary(values);
}

function saveStatus(values: DemoValues): { ready: boolean; reason: string } {
  if (!values.company.trim() || !values.role.trim()) {
    return { ready: false, reason: "Add the company and role to save" };
  }
  if (!displaySlug(values)) {
    return { ready: false, reason: "Add a share link to save" };
  }
  if (!cvFilename(values)) {
    return { ready: false, reason: "Choose a résumé to save" };
  }
  const video = videoState(values.videoUrl);
  if (video === "empty") return { ready: false, reason: "Add a pitch to save" };
  if (video === "check") return { ready: false, reason: "Use a YouTube link to save" };
  return { ready: true, reason: "Ready to save" };
}

function nextChapter(id: ChapterId): { id: ChapterId; label: string } | null {
  if (id === "role") return { id: "you", label: "Next, about you" };
  if (id === "you") return { id: "cv", label: "Next, résumé" };
  if (id === "cv") return { id: "intro", label: "Next, pitch" };
  return null;
}

function optionClass(selected: boolean): string {
  return `flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm ring-1 ring-inset ${
    selected
      ? "bg-[var(--paper)] text-[var(--ink)] ring-[var(--ink)]"
      : "bg-[var(--white)] text-[var(--ink)] ring-[var(--ink)]/15 hover:bg-[var(--paper)]/70"
  }`;
}

type UpdateValues = <K extends keyof DemoValues>(key: K, value: DemoValues[K]) => void;

type ChecklistTone = "done" | "pending" | "optional";

function checklistSteps(values: DemoValues): {
  id: ChapterId;
  title: string;
  detail: string;
  tone: ChecklistTone;
}[] {
  const roleReady = Boolean(
    values.company.trim() && values.role.trim() && displaySlug(values),
  );
  const youText = youSummary(values);
  const file = cvFilename(values);
  const pitch = introSummary(values);

  return [
    {
      id: "role",
      title: "Role",
      detail: roleSummary(values),
      tone: roleReady ? "done" : "pending",
    },
    {
      id: "you",
      title: "About you",
      detail: youText === "Nothing shown" ? "Optional" : youText,
      tone: youText === "Nothing shown" ? "optional" : "done",
    },
    {
      id: "cv",
      title: "Résumé",
      detail: file || "Choose a file",
      tone: file ? "done" : "pending",
    },
    {
      id: "intro",
      title: "Pitch",
      detail: pitch.text,
      tone: pitch.pending ? "pending" : "done",
    },
  ];
}

const CHECKLIST_ROW_CLASS =
  "flex min-h-11 w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left outline-none hover:bg-[var(--ink)]/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

function ApplicationChecklist({
  values,
  openId,
  onOpen,
}: {
  values: DemoValues;
  openId: ChapterId;
  onOpen: (id: ChapterId) => void;
}) {
  const steps = checklistSteps(values);
  const completed = steps.filter((step) => step.tone !== "pending").length;
  const total = steps.length;
  const allDone = completed === total;
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const slug = displaySlug(values);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-[var(--white)]"
      aria-labelledby="demo-checklist-heading"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <h2
          id="demo-checklist-heading"
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
        {steps.map((step) => {
          const open = step.id === openId;
          const settled = step.tone !== "pending";
          return (
            <li key={step.id}>
              <button
                type="button"
                aria-current={open ? "step" : undefined}
                onClick={() => onOpen(step.id)}
                className={`${CHECKLIST_ROW_CLASS} ${open ? "bg-[var(--ink)]/[0.04]" : ""}`}
              >
                {step.tone === "done" ? (
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"
                    aria-hidden
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                ) : step.tone === "optional" ? (
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--ink)]/20"
                    aria-hidden
                  />
                ) : (
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[var(--white)]"
                    aria-hidden
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-sm font-medium leading-snug ${
                        settled
                          ? "text-[var(--muted)] line-through"
                          : "text-[var(--ink)]"
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.tone === "optional" ? (
                      <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                        Optional
                      </span>
                    ) : null}
                  </span>
                  {step.tone === "optional" ? null : (
                    <span
                      className={`mt-0.5 block text-sm leading-snug break-words ${
                        step.tone === "pending"
                          ? "text-[var(--pink-text)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {step.detail}
                    </span>
                  )}
                </span>
                {step.tone === "done" ? <span className="sr-only">Completed</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-[var(--ink)]/8 px-5 py-3 text-sm leading-relaxed break-words">
        <span className="text-[var(--muted)]">myhireview.com/view/alex/</span>
        <span>{slug || "…"}</span>
      </p>
    </section>
  );
}

function RoleChapter({
  values,
  update,
  linkOpen,
  onToggleLink,
}: {
  values: DemoValues;
  update: UpdateValues;
  linkOpen: boolean;
  onToggleLink: () => void;
}) {
  const slug = displaySlug(values);
  const suggestion = suggestedSlug(values);
  const slugFieldId = useId();

  return (
    <div className="space-y-5">
      <Input
        id="demo-company"
        label="Company"
        value={values.company}
        autoComplete="off"
        onChange={(event) => update("company", event.target.value)}
      />
      <Input
        id="demo-role"
        label="Role"
        value={values.role}
        autoComplete="off"
        onChange={(event) => update("role", event.target.value)}
      />
      <div className="rounded-xl bg-[var(--pink)] px-4 py-3.5">
        <p className="text-sm font-medium text-[var(--ink)]">Share link</p>
        <p className="mt-1 text-sm leading-relaxed break-words">
          <span className="text-[var(--muted)]">myhireview.com/view/alex/</span>
          <span>{slug || "…"}</span>
        </p>
        {values.slugManual !== null ? (
          <p className="mt-1 text-sm text-[var(--muted)]">You edited this link.</p>
        ) : null}
        <button type="button" className={`mt-2 ${textButtonClass}`} onClick={onToggleLink}>
          {linkOpen ? "Hide link options" : "Edit link"}
        </button>
        {linkOpen ? (
          <div className="mt-4 space-y-4">
            <fieldset>
              <legend className="text-sm font-medium text-[var(--ink)]">Order in the link</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["company-role", "Company, then role"],
                    ["role-company", "Role, then company"],
                  ] as const
                ).map(([order, label]) => (
                  <label key={order} className={optionClass(values.segmentOrder === order)}>
                    <input
                      type="radio"
                      name="demo-segment-order"
                      value={order}
                      checked={values.segmentOrder === order}
                      onChange={() => update("segmentOrder", order)}
                      className="size-4 shrink-0 accent-[var(--ink)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Input
              id={slugFieldId}
              label="Link ending"
              value={values.slugManual ?? suggestion}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                const next = slugifyLive(event.target.value);
                update(
                  "slugManual",
                  next === suggestion || next === "" ? null : next,
                );
              }}
            />
            {values.slugManual !== null ? (
              <button
                type="button"
                className={textButtonClass}
                onClick={() => update("slugManual", null)}
              >
                Use the suggested link
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function YouChapter({ values, update }: { values: DemoValues; update: UpdateValues }) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-medium text-[var(--ink)]">Profile picture</legend>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
          The picture stays on your profile. This only chooses whether the page shows it.
        </p>
        <div className="mt-3 flex items-center gap-3">
          {values.showPicture ? (
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-medium text-[var(--white)]"
              aria-hidden
            >
              {initials(values.firstName, values.lastName)}
            </span>
          ) : null}
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {(
              [
                [true, "Show picture"],
                [false, "Hide picture"],
              ] as const
            ).map(([show, label]) => (
              <label key={label} className={optionClass(values.showPicture === show)}>
                <input
                  type="radio"
                  name="demo-picture"
                  checked={values.showPicture === show}
                  onChange={() => update("showPicture", show)}
                  className="size-4 shrink-0 accent-[var(--ink)]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <CandidateFieldRow
          id="demo-first-name"
          label="First name"
          value={values.firstName}
          included={values.showFirst}
          onValueChange={(value) => update("firstName", value)}
          onIncludedChange={(included) => update("showFirst", included)}
        />
        <CandidateFieldRow
          id="demo-last-name"
          label="Last name"
          value={values.lastName}
          included={values.showLast}
          onValueChange={(value) => update("lastName", value)}
          onIncludedChange={(included) => update("showLast", included)}
        />
      </div>
      <CandidateFieldRow
        id="demo-location"
        label="Location"
        value={values.location}
        included={values.showLocation}
        onValueChange={(value) => update("location", value)}
        onIncludedChange={(included) => update("showLocation", included)}
      />
      <CandidateFieldRow
        id="demo-portfolio"
        label="Portfolio"
        type="url"
        value={values.portfolio}
        included={values.showPortfolio}
        onValueChange={(value) => update("portfolio", value)}
        onIncludedChange={(included) => update("showPortfolio", included)}
      />
      <CandidateFieldRow
        id="demo-linkedin"
        label="LinkedIn"
        type="url"
        value={values.linkedin}
        included={values.showLinkedin}
        onValueChange={(value) => update("linkedin", value)}
        onIncludedChange={(included) => update("showLinkedin", included)}
      />
    </div>
  );
}

function CvChapter({ values, update }: { values: DemoValues; update: UpdateValues }) {
  const file = cvFilename(values);
  const download = downloadName(values);

  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--ink)]">Choose one résumé</legend>
      <p className="mt-3 text-sm text-[var(--muted)]">From your library</p>
      <div className="mt-2 space-y-2">
        {SAVED_CVS.map((name) => {
          const selected = values.cvSource === "saved" && values.savedCv === name;
          return (
            <label key={name} className={optionClass(selected)}>
              <input
                type="radio"
                name="demo-cv"
                value={name}
                checked={selected}
                onChange={() => {
                  update("cvSource", "saved");
                  update("savedCv", name);
                }}
                className="size-4 shrink-0 accent-[var(--ink)]"
              />
              {name}
            </label>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">Only this application</p>
      <label className={`mt-2 ${optionClass(values.cvSource === "tailored")}`}>
        <input
          type="radio"
          name="demo-cv"
          value="tailored"
          checked={values.cvSource === "tailored"}
          onChange={() => update("cvSource", "tailored")}
          className="size-4 shrink-0 accent-[var(--ink)]"
        />
        A PDF just for this role
      </label>
      {values.cvSource === "tailored" ? (
        <div className="mt-3">
          {values.tailoredName ? (
            <p className="text-sm text-[var(--ink)]">
              {values.tailoredName}{" "}
              <button
                type="button"
                className={textButtonClass}
                onClick={() => update("tailoredName", "")}
              >
                Remove
              </button>
            </p>
          ) : (
            <button
              type="button"
              className={textButtonClass}
              onClick={() => update("tailoredName", "Northwind-product-designer.pdf")}
            >
              Use a sample PDF
            </button>
          )}
        </div>
      ) : null}
      {file ? (
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Recruiters download it as <span className="text-[var(--ink)]">{download}</span>.
          </p>
          <button
            type="button"
            className={`mt-2 ${textButtonClass}`}
            onClick={() => update("useOriginalName", !values.useOriginalName)}
          >
            {values.useOriginalName ? "Use a generated name" : "Use the original file name"}
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}

function IntroChapter({ values, update }: { values: DemoValues; update: UpdateValues }) {
  const state = videoState(values.videoUrl);
  return (
    <div>
      <Input
        id="demo-video"
        label="YouTube link"
        type="url"
        inputMode="url"
        value={values.videoUrl}
        autoComplete="off"
        spellCheck={false}
        placeholder="https://youtu.be/…"
        onChange={(event) => update("videoUrl", event.target.value)}
      />
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        {state === "check"
          ? "That does not look like a YouTube link yet."
          : "Paste the link when you have the video. It plays on the page."}
      </p>
      {values.videoUrl.trim() === "" ? (
        <button
          type="button"
          className={`mt-3 ${textButtonClass}`}
          onClick={() => update("videoUrl", "https://youtu.be/demo-pitch")}
        >
          Use a sample link
        </button>
      ) : null}
    </div>
  );
}

export function ApplicationFormDemo() {
  const [values, setValues] = useState<DemoValues>(INITIAL_VALUES);
  const [openId, setOpenId] = useState<ChapterId>("role");
  const [linkOpen, setLinkOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const skipFocus = useRef(true);
  const status = saveStatus(values);

  const update: UpdateValues = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    document.getElementById(`demo-chapter-${openId}`)?.focus();
  }, [openId]);

  const openChapter = CHAPTERS.find((chapter) => chapter.id === openId) ?? CHAPTERS[0];
  const next = nextChapter(openId);

  let chapterFields: ReactNode = null;
  if (openId === "role") {
    chapterFields = (
      <RoleChapter
        values={values}
        update={update}
        linkOpen={linkOpen}
        onToggleLink={() => setLinkOpen((open) => !open)}
      />
    );
  } else if (openId === "you") {
    chapterFields = <YouChapter values={values} update={update} />;
  } else if (openId === "cv") {
    chapterFields = <CvChapter values={values} update={update} />;
  } else {
    chapterFields = <IntroChapter values={values} update={update} />;
  }

  return (
    <div className="min-h-screen bg-[var(--white)] text-[var(--ink)]" data-product-shell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <LogoBlack />
        <form
          className="mt-8"
          onSubmit={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
              event.preventDefault();
            }
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm text-[var(--muted)]">Form demo</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                New application
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
                One part of the form is open. The others stay as a single line, and the checklist
                beside you shows what is ready.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                This demo does not save. The{" "}
                <Link href="/admin/new" className={linkClass}>
                  current form
                </Link>{" "}
                and the{" "}
                <Link href="/admin/wizard/new" className={linkClass}>
                  wizard
                </Link>{" "}
                are still the real ones.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
              <Button
                type="button"
                disabled={!status.ready}
                aria-describedby="demo-save-reason"
                onClick={() =>
                  setNotice("Nothing was saved. This demo stays on this page.")
                }
              >
                Save draft
              </Button>
              <p id="demo-save-reason" className="text-sm text-[var(--muted)]">
                {status.reason}
              </p>
              {notice ? (
                <p role="status" className="max-w-xs text-sm text-[var(--ink)] sm:text-right">
                  {notice}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid items-start gap-8 min-[1100px]:grid-cols-[22rem_minmax(0,1fr)] min-[1100px]:gap-12">
            <aside className="min-[1100px]:sticky min-[1100px]:top-8">
              <ApplicationChecklist
                values={values}
                openId={openId}
                onOpen={setOpenId}
              />
            </aside>

            <div className="overflow-hidden rounded-2xl border border-[var(--ink)]/10">
              {CHAPTERS.map((chapter) => {
                const open = chapter.id === openId;
                const summary = chapterSummary(chapter.id, values);
                const panelId = `demo-chapter-panel-${chapter.id}`;
                const headingId = `demo-chapter-heading-${chapter.id}`;
                return (
                  <div key={chapter.id} className="border-b border-[var(--ink)]/10 last:border-b-0">
                    <h2 id={headingId} className="text-base font-semibold tracking-[-0.01em]">
                      <button
                        id={`demo-chapter-${chapter.id}`}
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenId(chapter.id)}
                        className="flex w-full flex-col items-start gap-0.5 px-5 py-4 text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--ink)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                      >
                        <span>{chapter.title}</span>
                        {open ? null : (
                          <span
                            className={`min-w-0 truncate text-sm font-normal ${
                              summary.pending
                                ? "text-[var(--pink-text)]"
                                : "text-[var(--muted)]"
                            }`}
                          >
                            {summary.text}
                          </span>
                        )}
                      </button>
                    </h2>
                    {open ? (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={headingId}
                        className="px-5 pb-5"
                      >
                        <p className="mb-5 max-w-prose text-sm leading-relaxed text-[var(--muted)]">
                          {openChapter.description}
                        </p>
                        {chapterFields}
                        {next ? (
                          <div className="mt-6">
                            <Button type="button" variant="secondary" onClick={() => setOpenId(next.id)}>
                              {next.label}
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
        </form>
      </main>
    </div>
  );
}
