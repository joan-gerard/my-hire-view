"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { getApplicationStatusDisplay } from "@/lib/utils/application-status-display";
import { notchLayout, notchPath } from "./NotchedCard";
import {
  ArchiveIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/admin/icons";

/**
 * Demo-only reimagining of the admin `ApplicationCard`.
 *
 * - grid — landscape 3/2 card with a top-right notch that swaps faces
 *   (Overview / Insights / Manage).
 * - list — admin-like row: identity + inline actions (no face tabs). Insights
 *   opens a popover; more opens a dropdown.
 * Status color follows the admin legend: draft yellow, active-unviewed blue,
 * active-viewed lime, archived gray.
 * Placeholder data only.
 */

type DemoStatus = "active" | "draft" | "archived";

type CardView = "front" | "insights" | "manage";

export type DemoCardLayout = "grid" | "list";

/** `compact` is for dense strips (Recently viewed): smaller chrome and type. */
export type DemoCardDensity = "default" | "compact";

export interface DemoApplication {
  id: string;
  company: string;
  role: string;
  status: DemoStatus;
  /** Only meaningful for active rows; mirrors the "viewed vs unviewed" split. */
  viewed: boolean;
  createdLabel: string;
  viewCount: number;
  downloadCount: number;
  lastViewedLabel: string | null;
  /** Relative recency for Recently viewed, e.g. Viewed 2h ago. */
  viewedAgoLabel?: string | null;
  /** Live-card footer pill, e.g. 12 views · 2h ago. */
  viewsPillLabel?: string | null;
  /** Share-path slug shown after a leading slash. */
  linkEnding?: string | null;
  shareUrl: string;
  cvMissing: boolean;
  profilePictureMissing: boolean;
}

type StatusDisplay = {
  label: string;
  description: string;
  glyph: typeof ClockIcon;
};

/** Matches the admin legend keys so the card surface can use those tokens. */
type StatusTone = "draft" | "unviewed" | "viewed" | "archived";

function getStatusTone(app: DemoApplication): StatusTone {
  if (app.status === "draft") return "draft";
  if (app.status === "archived") return "archived";
  return app.viewed ? "viewed" : "unviewed";
}

function getStatusDisplay(app: DemoApplication): StatusDisplay {
  const display = getApplicationStatusDisplay(app.status, app.viewCount);
  const glyph =
    display.key === "draft"
      ? PencilIcon
      : display.key === "archived"
        ? ArchiveIcon
        : display.key === "active_viewed"
          ? CheckIcon
          : ClockIcon;
  return {
    label: display.label,
    description: display.description,
    glyph,
  };
}

function statusTooltip(status: StatusDisplay): string {
  return `${status.label}: ${status.description}`;
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}

const WARNING_ICON = (
  <svg className="sg-appcard__badge-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.594c.75 1.335-.213 2.982-1.742 2.982H3.48c-1.53 0-2.493-1.647-1.743-2.982L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
      clipRule="evenodd"
    />
  </svg>
);

/** Pixel size of an element, so the notch path can redraw when the card resizes. */
function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      setSize((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export default function DemoApplicationCard({
  application,
  layout = "grid",
  density = "default",
  isActive = false,
  onActivate,
  onPublish,
  onRestore,
}: {
  application: DemoApplication;
  layout?: DemoCardLayout;
  density?: DemoCardDensity;
  /**
   * Admin demo: when another card becomes active, collapse this card back
   * to the overview face. Surface color follows Insights/Manage, not this flag.
   */
  isActive?: boolean;
  /** Fired when the user opens a face tab / list action on this card. */
  onActivate?: () => void;
  onPublish?: (id: string) => void;
  onRestore?: (id: string) => void;
}) {
  if (layout === "list") {
    return (
      <DemoApplicationListRow
        application={application}
        isActive={isActive}
        onActivate={onActivate}
        onPublish={onPublish}
        onRestore={onRestore}
      />
    );
  }
  return (
    <DemoApplicationGridCard
      application={application}
      density={density}
      isActive={isActive}
      onActivate={onActivate}
      onPublish={onPublish}
      onRestore={onRestore}
    />
  );
}

/* ================================================================== */
/* Grid — notched 3/2 card with Overview / Insights / Manage faces     */
/* ================================================================== */

function DemoApplicationGridCard({
  application,
  density = "default",
  isActive = false,
  onActivate,
  onPublish,
  onRestore,
}: {
  application: DemoApplication;
  density?: DemoCardDensity;
  isActive?: boolean;
  onActivate?: () => void;
  onPublish?: (id: string) => void;
  onRestore?: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const { w, h } = useElementSize(ref);
  const compact = density === "compact";
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<CardView>("front");

  const isDraft = application.status === "draft";
  const isArchived = application.status === "archived";
  const canCopyLink = Boolean(application.shareUrl);
  const status = getStatusDisplay(application);
  const tone = getStatusTone(application);
  const StatusGlyph = status.glyph;
  const shape = notchLayout(density);
  const path =
    w > 0 && h > 0 ? notchPath(w, h, shape.notchW, shape.notchH, shape.radii) : "";

  function selectView(next: CardView) {
    onActivate?.();
    setView((current) => (current === next ? "front" : next));
  }

  // Only one expanded face across cards — collapse when another card activates.
  useEffect(() => {
    if (onActivate && !isActive) setView("front");
  }, [isActive, onActivate]);

  async function handleCopyLink() {
    if (!canCopyLink) return;
    const ok = await copyToClipboard(application.shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  /** Green active fill only while Insights or Manage is open. */
  const showActiveSurface = view === "insights" || view === "manage";

  return (
    <article
      ref={ref}
      className={`sg-appcard sg-appcard--grid sg-appcard--${tone}${compact ? " sg-appcard--compact" : ""}${showActiveSurface ? " is-active" : ""}`}
      style={
        {
          "--btn": `${shape.btn}px`,
          "--gap": `${shape.gap}px`,
          "--pad": `${shape.pad}px`,
          "--notch-w": `${shape.notchW}px`,
          "--notch-h": `${shape.notchH}px`,
        } as CSSProperties
      }
    >
      {path ? (
        <svg
          className="sg-appcard__shape"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path className="sg-appcard__shape-path" d={path} />
        </svg>
      ) : null}
      <div className="sg-appcard__tray">
        <button
          type="button"
          className={`sg-appcard__tray-btn${view === "insights" ? " is-active" : ""}`}
          onClick={() => selectView("insights")}
          aria-label="Insights"
          aria-pressed={view === "insights"}
        >
          <ChartIcon className="sg-appcard__tray-icon" />
        </button>
        <button
          type="button"
          className={`sg-appcard__tray-btn${view === "manage" ? " is-active" : ""}`}
          onClick={() => selectView("manage")}
          aria-label="Manage"
          aria-pressed={view === "manage"}
        >
          <EllipsisIcon className="sg-appcard__tray-icon" />
        </button>
      </div>

      <div className="sg-appcard__view" key={view}>
        {view === "front" ? (
          <GridFrontFace
            application={application}
            status={status}
            StatusGlyph={StatusGlyph}
            density={density}
            canCopyLink={canCopyLink}
            copied={copied}
            onCopyLink={handleCopyLink}
            onActivate={onActivate}
            onOpenInsights={() => {
              onActivate?.();
              setView("insights");
            }}
            onPublish={onPublish}
            onRestore={onRestore}
          />
        ) : null}
        {view === "insights" ? (
          <GridInsightsFace
            application={application}
            onBack={() => setView("front")}
          />
        ) : null}
        {view === "manage" ? (
          <GridManageFace
            isDraft={isDraft}
            isArchived={isArchived}
            canCopyLink={canCopyLink}
            copied={copied}
            onCopyLink={handleCopyLink}
            onBack={() => setView("front")}
          />
        ) : null}
      </div>
    </article>
  );
}

function GridFrontFace({
  application,
  status,
  StatusGlyph,
  density = "default",
  canCopyLink,
  copied,
  onCopyLink,
  onActivate,
  onOpenInsights,
  onPublish,
  onRestore,
}: {
  application: DemoApplication;
  status: StatusDisplay;
  StatusGlyph: StatusDisplay["glyph"];
  density?: DemoCardDensity;
  canCopyLink: boolean;
  copied: boolean;
  onCopyLink: () => void;
  onActivate?: () => void;
  onOpenInsights?: () => void;
  onPublish?: (id: string) => void;
  onRestore?: (id: string) => void;
}) {
  const compact = density === "compact";
  const isDraft = application.status === "draft";
  const isArchived = application.status === "archived";
  const canViewPage = Boolean(application.shareUrl);
  const showBadges =
    !compact &&
    (application.cvMissing || application.profilePictureMissing);
  function handleLifecycle() {
    onActivate?.();
    if (isDraft) {
      onPublish?.(application.id);
      return;
    }
    if (isArchived) {
      onRestore?.(application.id);
    }
  }

  function handleCopy() {
    onActivate?.();
    onCopyLink();
  }

  function handleViewPage() {
    onActivate?.();
    if (!canViewPage) return;
    window.open(application.shareUrl, "_blank", "noopener,noreferrer");
  }

  const linkUnavailableLabel = "Link unavailable";
  const copyLabel = isDraft ? "Copy preview link" : "Copy link";
  const openPageLabel = isDraft ? "Preview page" : "Open page";

  return (
    <>
      <header className="sg-appcard__head sg-appcard__head--badge">
        <span
          className="sg-appcard__status-pill"
          role="img"
          aria-label={status.label}
          title={statusTooltip(status)}
        >
          <StatusGlyph className="sg-appcard__status-pill-icon" />
        </span>
      </header>

      <div className="sg-appcard__body">
        <div className="sg-appcard__identity">
          <p className="sg-appcard__company">{application.company}</p>
          <h3 className="sg-appcard__title">{application.role}</h3>
        </div>
        {application.linkEnding ? (
          <p
            className="sg-appcard__link"
            title={application.shareUrl || undefined}
          >
            <span className="sg-appcard__link-mark" aria-hidden>
              /
            </span>
            <span className="sg-appcard__link-slug">{application.linkEnding}</span>
          </p>
        ) : null}
      </div>

      <footer className="sg-appcard__footer">
        {compact && application.viewedAgoLabel ? (
          <p className="sg-appcard__viewed-ago">{application.viewedAgoLabel}</p>
        ) : null}
        {showBadges ? (
          <div className="sg-appcard__badges">
            {application.cvMissing ? (
              <span className="sg-appcard__badge is-warning">
                {WARNING_ICON} CV missing
              </span>
            ) : null}
            {application.profilePictureMissing ? (
              <span className="sg-appcard__badge is-info">
                {WARNING_ICON} No photo
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="sg-appcard__footer-actions">
          {!compact ? (
            isDraft ? (
              <div className="sg-appcard__lifecycle-pair">
                <a
                  href={`/admin/edit/${application.id}`}
                  className="sg-appcard__lifecycle is-secondary"
                  onClick={() => onActivate?.()}
                >
                  <PencilIcon className="sg-appcard__lifecycle-icon" />
                  Edit
                </a>
                <button
                  type="button"
                  className="sg-appcard__lifecycle"
                  onClick={handleLifecycle}
                >
                  <CheckIcon className="sg-appcard__lifecycle-icon" />
                  Publish
                </button>
              </div>
            ) : isArchived ? (
              <button
                type="button"
                className="sg-appcard__lifecycle is-secondary"
                onClick={handleLifecycle}
              >
                <ArchiveIcon className="sg-appcard__lifecycle-icon" />
                Restore
              </button>
            ) : application.viewed ? (
              <button
                type="button"
                className="sg-appcard__lifecycle is-stats"
                onClick={() => onOpenInsights?.()}
                aria-label={`Insights: ${application.viewsPillLabel ?? `${application.viewCount} views`}`}
                title="View insights"
              >
                <ChartIcon className="sg-appcard__lifecycle-icon" />
                {application.viewsPillLabel ??
                  `${application.viewCount} view${application.viewCount === 1 ? "" : "s"}`}
              </button>
            ) : (
              <span
                className="sg-appcard__lifecycle is-plain"
                title={statusTooltip(status)}
              >
                <em className="sg-appcard__lifecycle-muted">
                  {application.viewsPillLabel ?? "not viewed yet"}
                </em>
              </span>
            )
          ) : null}
          <div className="sg-appcard__quick-actions">
            <button
              type="button"
              className="sg-appcard__icon-btn"
              onClick={handleCopy}
              disabled={!canCopyLink}
              aria-label={copied ? "Copied!" : copyLabel}
              title={
                canCopyLink
                  ? copied
                    ? "Copied!"
                    : copyLabel
                  : linkUnavailableLabel
              }
            >
              {copied ? (
                <CheckIcon className="sg-appcard__icon-btn-glyph" />
              ) : (
                <CopyIcon className="sg-appcard__icon-btn-glyph" />
              )}
            </button>
            <button
              type="button"
              className="sg-appcard__icon-btn"
              onClick={handleViewPage}
              disabled={!canViewPage}
              aria-label={openPageLabel}
              title={canViewPage ? openPageLabel : linkUnavailableLabel}
            >
              <ExternalLinkIcon className="sg-appcard__icon-btn-glyph" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

function FaceBackButton({ onBack }: { onBack: () => void }) {
  return (
    <div className="sg-appcard__face-head">
      <button
        type="button"
        className="sg-appcard__back"
        onClick={onBack}
        aria-label="Overview"
      >
        <BackIcon className="sg-appcard__back-icon" />
      </button>
    </div>
  );
}

function GridInsightsFace({
  application,
  onBack,
}: {
  application: DemoApplication;
  onBack: () => void;
}) {
  return (
    <div className="sg-appcard__face">
      <FaceBackButton onBack={onBack} />

      <div className="sg-appcard__face-panel">
        <dl className="sg-appcard__insight-grid" aria-label="Insights">
          <div className="sg-appcard__insight-tile is-metric">
            <dt>Views</dt>
            <dd>{application.viewCount}</dd>
          </div>
          <div className="sg-appcard__insight-tile is-metric">
            <dt>CV downloads</dt>
            <dd>{application.downloadCount}</dd>
          </div>
          <div className="sg-appcard__insight-tile is-meta">
            <dt>Created</dt>
            <dd>{application.createdLabel}</dd>
          </div>
          <div className="sg-appcard__insight-tile is-meta">
            <dt>Last viewed</dt>
            <dd>{application.lastViewedLabel ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function GridManageFace({
  isDraft,
  isArchived,
  canCopyLink,
  copied,
  onCopyLink,
  onBack,
}: {
  isDraft: boolean;
  isArchived: boolean;
  canCopyLink: boolean;
  copied: boolean;
  onCopyLink: () => void;
  onBack: () => void;
}) {
  const lifecycle = isDraft
    ? { label: "Publish", glyph: CheckIcon }
    : isArchived
      ? { label: "Restore", glyph: ArchiveIcon }
      : { label: "Archive", glyph: ArchiveIcon };
  const LifecycleGlyph = lifecycle.glyph;

  return (
    <div className="sg-appcard__face">
      <FaceBackButton onBack={onBack} />

      <div className="sg-appcard__face-panel">
        <div className="sg-appcard__manage-grid" aria-label="Manage">
          <div
            className="sg-appcard__manage-row"
            role="group"
            aria-label="Primary actions"
          >
            <button type="button" className="sg-appcard__manage-chip">
              <PencilIcon className="sg-appcard__manage-icon" />
              Edit
            </button>
            <button type="button" className="sg-appcard__manage-chip">
              <LifecycleGlyph className="sg-appcard__manage-icon" />
              {lifecycle.label}
            </button>
            <button
              type="button"
              className="sg-appcard__manage-chip"
              onClick={onCopyLink}
              disabled={!canCopyLink}
            >
              {copied ? (
                <CheckIcon className="sg-appcard__manage-icon" />
              ) : (
                <CopyIcon className="sg-appcard__manage-icon" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <div
            className="sg-appcard__manage-row is-split"
            role="group"
            aria-label="Share and delete"
          >
            <button type="button" className="sg-appcard__manage-chip">
              <ExternalLinkIcon className="sg-appcard__manage-icon" />
              {isDraft ? "Preview" : "View"}
            </button>
            <button type="button" className="sg-appcard__manage-chip is-danger">
              <TrashIcon className="sg-appcard__manage-icon" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* List — admin-like row (inline actions, no face tabs)                */
/* ================================================================== */

function DemoApplicationListRow({
  application,
  isActive = false,
  onActivate,
  onPublish,
  onRestore,
}: {
  application: DemoApplication;
  isActive?: boolean;
  onActivate?: () => void;
  onPublish?: (id: string) => void;
  onRestore?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function activate() {
    onActivate?.();
  }

  const isDraft = application.status === "draft";
  const isArchived = application.status === "archived";
  const canCopyLink = Boolean(application.shareUrl);
  const status = getStatusDisplay(application);
  const tone = getStatusTone(application);
  const StatusGlyph = status.glyph;
  const companyRole = `${application.company} — ${application.role}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  async function handleCopyLink() {
    if (!canCopyLink) return;
    const ok = await copyToClipboard(application.shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <article
      className={`sg-approw sg-approw--${tone} group${insightsOpen ? " is-active" : ""}`}
    >
      <div className="sg-approw__inner">
        <div className="sg-approw__lead">
          <time className="sg-approw__time">{application.createdLabel}</time>
          <span
            className="sg-approw__status"
            title={statusTooltip(status)}
            aria-label={status.label}
            role="img"
          >
            <StatusGlyph className="sg-approw__status-icon" />
          </span>
        </div>

        <div className="sg-approw__main">
          <p className="sg-approw__title">{companyRole}</p>
          {(application.cvMissing || application.profilePictureMissing) && (
            <div className="sg-approw__badges">
              {application.cvMissing ? (
                <span className="sg-appcard__badge is-warning">
                  {WARNING_ICON} CV missing
                </span>
              ) : null}
              {application.profilePictureMissing ? (
                <span className="sg-appcard__badge is-info">
                  {WARNING_ICON} No photo
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="sg-approw__actions">
          {isDraft ? (
            <button
              type="button"
              className="sg-approw__publish"
              onClick={() => {
                activate();
                onPublish?.(application.id);
              }}
            >
              <CheckIcon className="sg-approw__action-icon" />
              Publish
            </button>
          ) : null}
          {isArchived ? (
            <button
              type="button"
              className="sg-approw__publish"
              onClick={() => {
                activate();
                onRestore?.(application.id);
              }}
            >
              <ArchiveIcon className="sg-approw__action-icon" />
              Restore
            </button>
          ) : null}

          <button
            type="button"
            className="sg-approw__icon-btn"
            onClick={() => {
              activate();
              void handleCopyLink();
            }}
            disabled={!canCopyLink}
            aria-label={
              copied ? "Copied!" : isDraft ? "Copy preview link" : "Copy link"
            }
            title={
              canCopyLink
                ? copied
                  ? "Copied!"
                  : isDraft
                    ? "Copy preview link"
                    : "Copy link"
                : "Link unavailable"
            }
          >
            {copied ? (
              <CheckIcon className="sg-approw__action-icon" />
            ) : (
              <CopyIcon className="sg-approw__action-icon" />
            )}
          </button>

          <div className="sg-approw__insights-wrap">
            <button
              type="button"
              className="sg-approw__icon-btn"
              onClick={() => {
                activate();
                setMenuOpen(false);
                setInsightsOpen((open) => !open);
              }}
              aria-label="View insights"
              aria-haspopup="dialog"
              aria-expanded={insightsOpen}
            >
              <ChartIcon className="sg-approw__action-icon" />
            </button>
            {insightsOpen ? (
              <div
                className="sg-approw__insights"
                role="dialog"
                aria-label="Insights"
              >
                <div className="sg-approw__insights-head">
                  <p>Insights</p>
                  <button
                    type="button"
                    onClick={() => setInsightsOpen(false)}
                    aria-label="Close insights"
                  >
                    ×
                  </button>
                </div>
                <p className="sg-approw__insights-label">{companyRole}</p>
                <dl className="sg-approw__insights-list">
                  <div>
                    <dt>Views</dt>
                    <dd>{application.viewCount}</dd>
                  </div>
                  <div>
                    <dt>CV downloads</dt>
                    <dd>{application.downloadCount}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{application.createdLabel}</dd>
                  </div>
                  <div>
                    <dt>Last viewed</dt>
                    <dd>{application.lastViewedLabel ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="sg-approw__icon-btn"
            onClick={() => {
              activate();
              if (!application.shareUrl) return;
              window.open(application.shareUrl, "_blank", "noopener,noreferrer");
            }}
            disabled={!application.shareUrl}
            aria-label={isDraft ? "Preview page" : "Open page"}
            title={
              application.shareUrl
                ? isDraft
                  ? "Preview page"
                  : "Open page"
                : "Link unavailable"
            }
          >
            <ExternalLinkIcon className="sg-approw__action-icon" />
          </button>

          <div className="sg-approw__menu" ref={menuRef}>
            <button
              type="button"
              className="sg-approw__icon-btn"
              onClick={() => {
                activate();
                setInsightsOpen(false);
                setMenuOpen((open) => !open);
              }}
              aria-label="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <EllipsisIcon className="sg-approw__action-icon" />
            </button>
            {menuOpen ? (
              <div className="sg-approw__menu-list" role="menu">
                <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <PencilIcon className="sg-approw__menu-icon" /> Edit
                </button>
                {isDraft ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onPublish?.(application.id);
                    }}
                  >
                    <CheckIcon className="sg-approw__menu-icon" /> Publish
                  </button>
                ) : isArchived ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onRestore?.(application.id);
                    }}
                  >
                    <ArchiveIcon className="sg-approw__menu-icon" /> Restore
                  </button>
                ) : (
                  <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <ArchiveIcon className="sg-approw__menu-icon" /> Archive
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="is-danger"
                  onClick={() => setMenuOpen(false)}
                >
                  <TrashIcon className="sg-approw__menu-icon" /> Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
