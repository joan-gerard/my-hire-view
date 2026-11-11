"use client";

import ProfilePictureModal from "@/components/forms/ProfilePictureModal";
import type { CandidateFieldKey } from "@/components/forms/CandidateFieldsSection";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { getApplicationUrl } from "@/lib/utils/url";
import { validateYouTubeUrl } from "@/lib/utils/youtube";
import { Inter_Tight } from "next/font/google";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./new-application-studio.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export type StudioSlugStatus =
  | { kind: "idle" | "checking" | "available" }
  | { kind: "invalid" | "unavailable"; message: string };

type SlugSegmentOrder = "company_role" | "role_company";

type OptionalKey = "location" | "portfolio_url" | "linkedin_url";

const OPTIONAL_FIELDS: { key: OptionalKey; label: string; placeholder: string }[] =
  [
    { key: "location", label: "Location", placeholder: "City, Country" },
    {
      key: "linkedin_url",
      label: "LinkedIn",
      placeholder: "https://www.linkedin.com/in/…",
    },
    {
      key: "portfolio_url",
      label: "Portfolio",
      placeholder: "https://…",
    },
  ];

export interface NewApplicationStudioProps {
  company: string;
  role: string;
  slug: string;
  publicId?: string;
  slugSegmentOrder: SlugSegmentOrder;
  slugManuallyEdited: boolean;
  slugStatus: StudioSlugStatus;
  companyError?: string;
  roleError?: string;
  slugError?: string;
  onCompanyChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSlugSegmentOrderChange: (order: SlugSegmentOrder) => void;
  onUseSuggestedSlug: () => void;
  candidateValues: Record<CandidateFieldKey, string>;
  include: Record<CandidateFieldKey, boolean>;
  onCandidateValueChange: (field: CandidateFieldKey, value: string) => void;
  onCandidateIncludeChange: (field: CandidateFieldKey, included: boolean) => void;
  profilePictureUrl?: string | null;
  profilePictureVersion?: string | null;
  showProfilePicture: boolean;
  onShowProfilePictureChange: (show: boolean) => void;
  onProfilePictureSaved?: (result: {
    url: string | null;
    updated_at?: string | null;
  }) => void;
  videoUrl: string;
  videoError?: string;
  onVideoUrlChange: (url: string) => void;
  cvSection: ReactNode;
  snapshotCvName: string | null;
  blockers: { name: string; note?: string }[];
  canSubmit: boolean;
  busy: boolean;
  loadingLabel: string;
  submitLabel: string;
  profileNudge?: ReactNode;
}

const BLOCKER_WORDS: Record<string, string> = {
  Company: "company",
  Role: "role",
  "Share link": "link",
  Résumé: "résumé",
  "YouTube intro": "video",
};

function initials(first: string, last: string): string {
  const letters = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return letters.trim() || "?";
}

function shareHostPath(publicId: string | undefined, slug: string): {
  base: string;
  ending: string;
  copyText: string | null;
} {
  const ending = slug.trim() || "your-link";
  if (!publicId?.trim()) {
    return {
      base: "/view/…/",
      ending,
      copyText: null,
    };
  }
  const absolute = getApplicationUrl(publicId.trim(), ending);
  try {
    const url = new URL(absolute);
    return {
      base: `${url.host}/view/${publicId.trim()}/`,
      ending,
      copyText: slug.trim() ? absolute : null,
    };
  } catch {
    return {
      base: `/view/${publicId.trim()}/`,
      ending,
      copyText: slug.trim() ? absolute : null,
    };
  }
}

function dockStatus(
  blockers: { name: string; note?: string }[],
  canSubmit: boolean,
  busy: boolean,
  loadingLabel: string,
): string {
  if (busy) return loadingLabel;
  if (canSubmit) return "Ready to save";
  const checking = blockers.some((item) =>
    item.note?.includes("still being checked"),
  );
  const linkNote = blockers.find(
    (item) =>
      item.name === "Share link" &&
      item.note &&
      !item.note.includes("still being checked"),
  );
  const words = blockers
    .filter(
      (item) =>
        !(item.name === "Share link" && item.note?.includes("still being checked")),
    )
    .map((item) => BLOCKER_WORDS[item.name] ?? item.name.toLowerCase());
  if (checking && words.length === 0) return "Checking the link…";
  if (linkNote?.note && words.length === 1 && words[0] === "link") {
    return linkNote.note;
  }
  const needed = words.filter((word) => !(checking && word === "link"));
  const prefix = checking ? "Checking the link… " : "";
  if (needed.length === 0) return prefix.trim() || "Still needed";
  return `${prefix}Still needed: ${needed.join(", ")}`;
}

function Avatar({
  src,
  first,
  last,
  size,
}: {
  src: string | null;
  first: string;
  last: string;
  size: "sm" | "lg" | "preview";
}) {
  const sizeClass =
    size === "lg" ? " is-lg" : size === "preview" ? " is-preview" : "";
  return (
    <span className={`nas-avatar${sizeClass}`} aria-hidden>
      {src ? <img src={src} alt="" /> : initials(first, last)}
    </span>
  );
}

export default function NewApplicationStudio({
  company,
  role,
  slug,
  publicId,
  slugSegmentOrder,
  slugManuallyEdited,
  slugStatus,
  companyError,
  roleError,
  slugError,
  onCompanyChange,
  onRoleChange,
  onSlugChange,
  onSlugSegmentOrderChange,
  onUseSuggestedSlug,
  candidateValues,
  include,
  onCandidateValueChange,
  onCandidateIncludeChange,
  profilePictureUrl,
  profilePictureVersion,
  showProfilePicture,
  onShowProfilePictureChange,
  onProfilePictureSaved,
  videoUrl,
  videoError,
  onVideoUrlChange,
  cvSection,
  snapshotCvName,
  blockers,
  canSubmit,
  busy,
  loadingLabel,
  submitLabel,
  profileNudge,
}: NewApplicationStudioProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [customChosen, setCustomChosen] = useState(slugManuallyEdited);
  const [endingOpen, setEndingOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pitchMode, setPitchMode] = useState<"rec" | "yt">(() =>
    videoUrl.trim() ? "yt" : "rec",
  );
  const [youtubeError, setYoutubeError] = useState<string | undefined>();
  const [recordOpen, setRecordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileFocus, setProfileFocus] = useState<OptionalKey | null>(null);
  const [pictureOpen, setPictureOpen] = useState(false);
  const pictureTriggerRef = useRef<HTMLButtonElement>(null);

  const companyName = company.trim();
  const roleName = role.trim();
  const headlineCompany = companyName || "them";
  const share = shareHostPath(publicId, slug);
  const endingMode: "both" | "rc" | "custom" =
    slugManuallyEdited || customChosen
      ? "custom"
      : slugSegmentOrder === "role_company"
        ? "rc"
        : "both";

  const pictureSrc = cacheBustProfilePictureUrl(
    profilePictureUrl,
    profilePictureVersion,
  );
  const hasPicture = Boolean(profilePictureUrl?.trim() && pictureSrc);
  const first = candidateValues.first_name ?? "";
  const last = candidateValues.last_name ?? "";
  const fullName = `${first} ${last}`.trim() || "Your name";
  const location = candidateValues.location ?? "";
  const youtubeReady = validateYouTubeUrl(videoUrl.trim());
  const shownVideoError = videoError || youtubeError;

  useEffect(() => {
    if (slugError) setEndingOpen(true);
  }, [slugError]);

  const chooseOrder = (order: SlugSegmentOrder) => {
    setCustomChosen(false);
    onSlugSegmentOrderChange(order);
  };

  const copyLink = async () => {
    if (!share.copyText) return;
    try {
      await navigator.clipboard.writeText(share.copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const openProfile = (focus: OptionalKey | null) => {
    setProfileFocus(focus);
    setProfileOpen(true);
  };

  const saveProfileFields = (draft: {
    values: Record<CandidateFieldKey, string>;
    shown: Record<OptionalKey, boolean>;
  }) => {
    onCandidateValueChange("first_name", draft.values.first_name);
    onCandidateValueChange("last_name", draft.values.last_name);
    for (const key of ["first_name", "last_name"] as const) {
      const next = draft.values[key];
      const hadValue = Boolean((candidateValues[key] ?? "").trim());
      if (!next.trim()) {
        onCandidateIncludeChange(key, false);
      } else if (!hadValue) {
        onCandidateIncludeChange(key, true);
      }
    }
    for (const field of OPTIONAL_FIELDS) {
      const key = field.key;
      if (!draft.shown[key]) {
        onCandidateValueChange(key, "");
        onCandidateIncludeChange(key, false);
        continue;
      }
      const next = draft.values[key];
      const hadValue = Boolean((candidateValues[key] ?? "").trim());
      onCandidateValueChange(key, next);
      if (!next.trim()) {
        onCandidateIncludeChange(key, false);
      } else if (!hadValue) {
        onCandidateIncludeChange(key, true);
      }
    }
    setProfileOpen(false);
  };

  const linkMessage =
    slugError ||
    (slugStatus.kind === "invalid" || slugStatus.kind === "unavailable"
      ? slugStatus.message
      : null);

  const previewLinks = (
    [
      ["portfolio_url", "Portfolio"],
      ["linkedin_url", "LinkedIn"],
    ] as const
  ).filter(
    ([key]) => include[key] && Boolean((candidateValues[key] ?? "").trim()),
  );

  const showPreviewAvatar = showProfilePicture && (hasPicture || Boolean(first || last));
  const showPreviewLocation = include.location && Boolean(location.trim());
  const previewFirst = include.first_name ? first : "";
  const previewLast = include.last_name ? last : "";
  const previewName = `${previewFirst} ${previewLast}`.trim() || "Your name";

  return (
    <div
      className={`${interTight.className} nas`}
      data-theme={theme === "dark" ? "dark" : undefined}
    >
      <div className="nas-wrap">
        <div className="nas-hd">
          <h1>
            Make <span className="nas-hl">{headlineCompany}</span> notice you.
          </h1>
          <button
            type="button"
            className="nas-theme"
            aria-label="Toggle light or dark theme"
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        <div>
          <section className="nas-step" aria-labelledby="new-app-link-heading">
            <h2 id="new-app-link-heading">Link</h2>
            <div className="nas-two">
              <div>
                <label className="nas-label" htmlFor="application-company">
                  Company
                </label>
                <input
                  id="application-company"
                  type="text"
                  value={company}
                  placeholder="Acme"
                  autoComplete="organization"
                  disabled={busy}
                  aria-invalid={companyError ? true : undefined}
                  onChange={(event) => onCompanyChange(event.target.value)}
                />
                {companyError ? (
                  <p className="nas-err" role="alert">
                    {companyError}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="nas-label" htmlFor="application-role">
                  Role
                </label>
                <input
                  id="application-role"
                  type="text"
                  value={role}
                  placeholder="Product Designer"
                  autoComplete="organization-title"
                  disabled={busy}
                  aria-invalid={roleError ? true : undefined}
                  onChange={(event) => onRoleChange(event.target.value)}
                />
                {roleError ? (
                  <p className="nas-err" role="alert">
                    {roleError}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="nas-link">
              <p>
                <span className="nas-link-base">{share.base}</span>
                <span className="nas-link-slug">{share.ending}</span>
              </p>
              <button
                type="button"
                className="nas-copy"
                onClick={() => void copyLink()}
                disabled={!share.copyText}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {slugStatus.kind === "checking" ? (
              <p className="nas-status is-progress" role="status">
                Checking…
              </p>
            ) : null}
            {linkMessage ? (
              <p className="nas-err" role="alert">
                {linkMessage}
              </p>
            ) : null}
            <details
              className="nas-adv"
              open={endingOpen}
              onToggle={(event) =>
                setEndingOpen((event.currentTarget as HTMLDetailsElement).open)
              }
            >
              <summary>Customize ending</summary>
              <div className="nas-seg" role="group" aria-label="Link ending">
                <button
                  type="button"
                  className={endingMode === "both" ? "is-on" : undefined}
                  onClick={() => chooseOrder("company_role")}
                >
                  Company + Role
                </button>
                <button
                  type="button"
                  className={endingMode === "rc" ? "is-on" : undefined}
                  onClick={() => chooseOrder("role_company")}
                >
                  Role + Company
                </button>
                <button
                  type="button"
                  className={endingMode === "custom" ? "is-on" : undefined}
                  onClick={() => setCustomChosen(true)}
                >
                  Custom
                </button>
              </div>
              {endingMode === "custom" ? (
                <div>
                  <label className="nas-label" htmlFor="application-slug">
                    Link ending
                  </label>
                  <input
                    id="application-slug"
                    type="text"
                    value={slug}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={busy}
                    aria-invalid={linkMessage ? true : undefined}
                    onChange={(event) => onSlugChange(event.target.value)}
                  />
                  {slugManuallyEdited ? (
                    <button
                      type="button"
                      className="nas-textbtn"
                      onClick={() => {
                        setCustomChosen(false);
                        onUseSuggestedSlug();
                      }}
                    >
                      Use the suggested link
                    </button>
                  ) : null}
                </div>
              ) : null}
            </details>
          </section>

          <section className="nas-step" aria-labelledby="new-app-about-heading">
            <h2 id="new-app-about-heading">
              About you <span className="nas-hint">optional</span>
            </h2>
            <div className="nas-me">
              <Avatar src={hasPicture ? pictureSrc : null} first={first} last={last} size="sm" />
              <div>
                <p className="nas-name">{fullName}</p>
                <p className="nas-loc">{location.trim() || "No location added"}</p>
              </div>
              <button type="button" className="nas-edit" onClick={() => openProfile(null)}>
                Edit profile
              </button>
            </div>
            <div className="nas-crow">
              <span className="nas-lbl">Show on page</span>
              <div className="nas-chips">
                {(
                  [
                    ["first_name", "First name"],
                    ["last_name", "Last name"],
                  ] as const
                ).map(([key, label]) => {
                  const value = (candidateValues[key] ?? "").trim();
                  if (!value) return null;
                  const on = include[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      className={on ? "nas-chip" : "nas-chip is-off"}
                      onClick={() => onCandidateIncludeChange(key, !on)}
                    >
                      {label}
                    </button>
                  );
                })}
                {hasPicture ? (
                  <button
                    type="button"
                    className={showProfilePicture ? "nas-chip" : "nas-chip is-off"}
                    onClick={() => onShowProfilePictureChange(!showProfilePicture)}
                  >
                    Photo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="nas-chip is-add"
                    ref={pictureTriggerRef}
                    onClick={() => setPictureOpen(true)}
                  >
                    + Add Photo
                  </button>
                )}
                {OPTIONAL_FIELDS.map((field) => {
                  const value = (candidateValues[field.key] ?? "").trim();
                  if (!value) {
                    return (
                      <button
                        key={field.key}
                        type="button"
                        className="nas-chip is-add"
                        onClick={() => openProfile(field.key)}
                      >
                        + Add {field.label}
                      </button>
                    );
                  }
                  const on = include[field.key];
                  return (
                    <button
                      key={field.key}
                      type="button"
                      className={on ? "nas-chip" : "nas-chip is-off"}
                      onClick={() => onCandidateIncludeChange(field.key, !on)}
                    >
                      {field.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {profileNudge ? <div className="nas-note">{profileNudge}</div> : null}
          </section>

          <section className="nas-step" aria-labelledby="new-app-cv-heading">
            <h2 id="new-app-cv-heading">CV</h2>
            {cvSection}
          </section>

          <section className="nas-step" aria-labelledby="new-app-pitch-heading">
            <div className="nas-phd">
              <h2 id="new-app-pitch-heading">
                Video pitch <span className="nas-hint">60–90 seconds</span>
              </h2>
              <div className="nas-seg" role="group" aria-label="Pitch source">
                <button
                  type="button"
                  className={pitchMode === "rec" ? "is-on" : undefined}
                  onClick={() => setPitchMode("rec")}
                >
                  Record in app
                </button>
                <button
                  type="button"
                  className={pitchMode === "yt" ? "is-on" : undefined}
                  onClick={() => setPitchMode("yt")}
                >
                  Use YouTube
                </button>
              </div>
            </div>
            <div className="nas-pbody">
              {pitchMode === "rec" ? (
                <div>
                  <button
                    type="button"
                    className="nas-record"
                    onClick={() => setRecordOpen(true)}
                  >
                    <i className="nas-dot" aria-hidden />
                    Record your pitch
                  </button>
                </div>
              ) : (
                <div>
                  <label className="nas-label" htmlFor="application-youtube">
                    YouTube link
                  </label>
                  <input
                    id="application-youtube"
                    type="url"
                    value={videoUrl}
                    placeholder="https://www.youtube.com/watch?v=…"
                    disabled={busy}
                    aria-invalid={shownVideoError ? true : undefined}
                    onChange={(event) => {
                      const next = event.target.value;
                      onVideoUrlChange(next);
                      if (next.trim() && !validateYouTubeUrl(next.trim())) {
                        setYoutubeError("Please enter a valid YouTube URL");
                      } else {
                        setYoutubeError(undefined);
                      }
                    }}
                  />
                  {shownVideoError ? (
                    <p className="nas-err" role="alert">
                      {shownVideoError}
                    </p>
                  ) : null}
                </div>
              )}
              {youtubeReady ? (
                <div className="nas-pitch-chip">
                  <span className="nas-play" aria-hidden />
                  <span>Your pitch · ready</span>
                </div>
              ) : null}
            </div>
            {pitchMode === "rec" && shownVideoError ? (
              <p className="nas-err" role="alert">
                {shownVideoError}
              </p>
            ) : null}
          </section>
        </div>

        <aside className="nas-aside" aria-label="Snapshot">
          <p className="nas-aside-label">Snapshot</p>
          <div className="nas-frame">
            <div className="nas-bar" aria-hidden>
              <i />
              <i />
              <i />
              <em>
                {share.base}
                {share.ending}
              </em>
            </div>
            <div className="nas-preview">
              <div className="nas-ph">
                {showPreviewAvatar ? (
                  <Avatar
                    src={hasPicture && showProfilePicture ? pictureSrc : null}
                    first={previewFirst}
                    last={previewLast}
                    size="preview"
                  />
                ) : null}
                <div>
                  <h3>{previewName}</h3>
                  {showPreviewLocation ? <p>{location.trim()}</p> : null}
                </div>
              </div>
              <div className="nas-pl">
                {previewLinks.map(([, label]) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <p className="nas-pr">
                Applying for {roleName || "your role"} at{" "}
                <span className="nas-mark">{companyName || "…"}</span>
              </p>
              <div className={youtubeReady ? "nas-vid" : "nas-vid is-empty"}>
                {youtubeReady ? (
                  <span className="nas-play" aria-hidden />
                ) : (
                  "No pitch yet. Record one or paste a YouTube link."
                )}
              </div>
              {snapshotCvName ? (
                <div className="nas-dl">
                  <span>{snapshotCvName}</span>
                  <b aria-hidden>↓</b>
                </div>
              ) : (
                <div className="nas-dl is-empty">Résumé not added yet</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="nas-dock">
        <div className="nas-dk">
          <span className="nas-cnt" role="status">
            {dockStatus(blockers, canSubmit, busy, loadingLabel)}
          </span>
          <Link href="/admin" className="nas-cancel">
            Cancel
          </Link>
          <button
            type="submit"
            className="nas-save"
            disabled={!canSubmit || busy}
          >
            {busy ? loadingLabel : submitLabel}
          </button>
        </div>
      </div>

      <RecordPitchDialog
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        company={companyName}
        role={roleName}
        firstName={first.trim()}
        initialsText={initials(first, last)}
      />
      <EditProfileDialog
        open={profileOpen}
        focusField={profileFocus}
        values={candidateValues}
        pictureSrc={hasPicture ? pictureSrc : null}
        first={first}
        last={last}
        canEditPhoto={typeof onProfilePictureSaved === "function"}
        onChangePhoto={() => setPictureOpen(true)}
        onClose={() => setProfileOpen(false)}
        onSave={saveProfileFields}
      />
      {onProfilePictureSaved ? (
        <ProfilePictureModal
          open={pictureOpen}
          currentUrl={profilePictureUrl ?? null}
          currentUrlVersion={profilePictureVersion}
          firstName={first}
          lastName={last}
          usage="application"
          onClose={() => {
            setPictureOpen(false);
            requestAnimationFrame(() => pictureTriggerRef.current?.focus());
          }}
          onSaved={(result) => {
            const hadPicture = hasPicture;
            onProfilePictureSaved(result);
            if (!result.url) {
              onShowProfilePictureChange(false);
              return;
            }
            if (!hadPicture) onShowProfilePictureChange(true);
          }}
        />
      ) : null}
    </div>
  );
}

function RecordPitchDialog({
  open,
  onClose,
  company,
  role,
  firstName,
  initialsText,
}: {
  open: boolean;
  onClose: () => void;
  company: string;
  role: string;
  firstName: string;
  initialsText: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [script, setScript] = useState("");
  const [dirty, setDirty] = useState(false);
  const [orient, setOrient] = useState<"l" | "p">("l");
  const [size, setSize] = useState(22);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || dirty) return;
    setScript(
      `Hi ${company || "there"}, I’m ${firstName || "a candidate"}.\n\nI build things people actually use, and I’d love to do that as your ${role || "next hire"}.\n\nHere’s why this role:\nFirst, a reason that is specific to the company.\nSecond, a result you are proud of.\n\nHere’s what I’d bring in my first 90 days:\nOne clear goal.\nOne quick win.\n\nMy CV and portfolio are linked below this video.\n\nThanks for watching. I’d love to talk.`,
    );
  }, [open, dirty, company, role, firstName]);

  return (
    <dialog
      ref={ref}
      className="nas-dialog-record"
      aria-label="Record your pitch"
      onClose={onClose}
    >
      <div className="nas-dh">
        <h2>Record your pitch</h2>
        <button type="button" className="nas-x" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="nas-db">
        <div className="nas-stagewrap">
          <div className={orient === "p" ? "nas-stage is-portrait" : "nas-stage"}>
            <div className="nas-ghost">
              <span>{initialsText}</span>
            </div>
            <div className="nas-tp">
              <div className="nas-tpi" style={{ fontSize: size }}>
                {script}
              </div>
            </div>
            <div className="nas-band" />
          </div>
        </div>
        <div className="nas-side">
          <div>
            <label className="nas-label" htmlFor="pitch-script">
              Teleprompter script
            </label>
            <textarea
              id="pitch-script"
              rows={9}
              value={script}
              onChange={(event) => {
                setDirty(true);
                setScript(event.target.value);
              }}
            />
          </div>
          <div className="nas-two">
            <div>
              <label className="nas-label" htmlFor="pitch-speed">
                Scroll speed
              </label>
              <input id="pitch-speed" type="range" min={1} max={6} defaultValue={2} />
            </div>
            <div>
              <label className="nas-label" htmlFor="pitch-size">
                Text size
              </label>
              <input
                id="pitch-size"
                type="range"
                min={16}
                max={34}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
            </div>
          </div>
          <div>
            <span className="nas-label">Save as</span>
            <div className="nas-seg" role="group" aria-label="Video shape">
              <button
                type="button"
                className={orient === "l" ? "is-on" : undefined}
                onClick={() => setOrient("l")}
              >
                Landscape 16:9
              </button>
              <button
                type="button"
                className={orient === "p" ? "is-on" : undefined}
                onClick={() => setOrient("p")}
              >
                Portrait 9:16
              </button>
            </div>
          </div>
          <div>
            <div className="nas-meter" aria-hidden>
              <u />
            </div>
            <p className="nas-status">Sweet spot: 60–90 seconds</p>
          </div>
        </div>
      </div>
      <div className="nas-df">
        <p className="nas-unavailable">
          Recording in the app is not available yet. Use a YouTube link for this
          application.
        </p>
        <button type="button" className="nas-record-start" disabled>
          <i className="nas-dot" aria-hidden />
          Start recording
        </button>
      </div>
    </dialog>
  );
}

function EditProfileDialog({
  open,
  focusField,
  values,
  pictureSrc,
  first,
  last,
  canEditPhoto,
  onChangePhoto,
  onClose,
  onSave,
}: {
  open: boolean;
  focusField: OptionalKey | null;
  values: Record<CandidateFieldKey, string>;
  pictureSrc: string | null;
  first: string;
  last: string;
  canEditPhoto: boolean;
  onChangePhoto: () => void;
  onClose: () => void;
  onSave: (draft: {
    values: Record<CandidateFieldKey, string>;
    shown: Record<OptionalKey, boolean>;
  }) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [draft, setDraft] = useState(values);
  const [shown, setShown] = useState<Record<OptionalKey, boolean>>({
    location: false,
    portfolio_url: false,
    linkedin_url: false,
  });

  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const current = valuesRef.current;
      setDraft(current);
      setShown({
        location:
          Boolean(current.location?.trim()) || focusField === "location",
        portfolio_url:
          Boolean(current.portfolio_url?.trim()) ||
          focusField === "portfolio_url",
        linkedin_url:
          Boolean(current.linkedin_url?.trim()) || focusField === "linkedin_url",
      });
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, focusField]);

  useEffect(() => {
    if (!open || !focusField) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`profile-${focusField}`)?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, focusField]);

  return (
    <dialog
      ref={ref}
      className="nas-dialog-profile"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <div className="nas-dh">
        <h2 id={titleId}>Edit profile</h2>
        <button type="button" className="nas-x" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="nas-pdb">
        <div className="nas-pic">
          <Avatar src={pictureSrc} first={first} last={last} size="lg" />
          {canEditPhoto ? (
            <div className="nas-pa">
              <button type="button" className="nas-photo-btn" onClick={onChangePhoto}>
                Change photo
              </button>
              <button type="button" className="nas-rm" onClick={onChangePhoto}>
                Remove
              </button>
            </div>
          ) : null}
        </div>
        <div className="nas-two">
          <div>
            <label className="nas-label" htmlFor="profile-first">
              First name
            </label>
            <input
              id="profile-first"
              type="text"
              value={draft.first_name ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, first_name: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="nas-label" htmlFor="profile-last">
              Last name
            </label>
            <input
              id="profile-last"
              type="text"
              value={draft.last_name ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, last_name: event.target.value }))
              }
            />
          </div>
        </div>
        {OPTIONAL_FIELDS.map((field) =>
          shown[field.key] ? (
            <div key={field.key}>
              <label className="nas-label" htmlFor={`profile-${field.key}`}>
                {field.label}
              </label>
              <div className="nas-fi">
                <input
                  id={`profile-${field.key}`}
                  type="text"
                  placeholder={field.placeholder}
                  value={draft[field.key] ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="nas-rm"
                  onClick={() =>
                    setShown((prev) => ({ ...prev, [field.key]: false }))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null,
        )}
        <div>
          {OPTIONAL_FIELDS.map((field) =>
            shown[field.key] ? null : (
              <button
                key={field.key}
                type="button"
                className="nas-add"
                onClick={() =>
                  setShown((prev) => ({ ...prev, [field.key]: true }))
                }
              >
                + Add {field.label.toLowerCase()}
              </button>
            ),
          )}
        </div>
        <p className="nas-note">
          A photo is saved to your profile. Name, location, and links here are
          only for this application. You choose what shows on this page.
        </p>
      </div>
      <div className="nas-df">
        <button type="button" className="nas-cancel2" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="nas-save2"
          onClick={() => onSave({ values: draft, shown })}
        >
          Save profile
        </button>
      </div>
    </dialog>
  );
}
