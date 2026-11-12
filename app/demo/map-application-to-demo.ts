import type { ApplicationListItem } from "@/lib/types/application";
import { getApplicationUrl } from "@/lib/utils/url";
import type { DemoApplication } from "@/app/demo/care-log/DemoApplicationCard";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Matches the care-log placeholder dates: 28.03.2023 */
export function formatDemoCreatedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Matches the care-log placeholder last-viewed labels: 2 Apr, 14:20 */
export function formatDemoLastViewedLabel(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const month = date.toLocaleString("en-GB", { month: "short" });
  return `${date.getDate()} ${month}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Share-path slug shown on cards after a leading slash. */
export function formatDemoLinkEnding(slug: string | null | undefined): string | null {
  const trimmed = slug?.trim();
  if (!trimmed) return null;
  return trimmed;
}

/**
 * Relative time fragment — always relative (2h ago, 21d ago), never a date.
 * @param now - injectable for tests
 */
export function formatDemoRelativeAgo(
  iso: string | null,
  now: Date = new Date(),
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(diffMs / 86_400_000);
  return `${Math.max(1, days)}d ago`;
}

/**
 * Recency copy for Recently viewed — always relative (2h ago, 21d ago), never a date.
 * @param now - injectable for tests
 */
export function formatDemoViewedAgoLabel(
  iso: string | null,
  now: Date = new Date(),
): string | null {
  const relative = formatDemoRelativeAgo(iso, now);
  return relative ? `Viewed ${relative}` : null;
}

/**
 * Live-card footer pill: "12 views · 2h ago", or "not viewed yet" when still at zero.
 */
export function formatDemoViewsPillLabel(
  viewCount: number,
  lastViewedAt: string | null,
  now: Date = new Date(),
): string {
  const safeCount = Number.isFinite(viewCount) ? Math.max(0, Math.floor(viewCount)) : 0;
  if (safeCount === 0) return "not viewed yet";
  const viewsLabel = safeCount === 1 ? "1 view" : `${safeCount} views`;
  const relative = formatDemoRelativeAgo(lastViewedAt, now);
  return relative ? `${viewsLabel} · ${relative}` : viewsLabel;
}

/** Maps a live list row into the demo card's display shape. */
export function mapApplicationToDemo(
  application: ApplicationListItem,
): DemoApplication {
  return {
    id: application.id,
    company: application.company,
    role: application.role,
    status: application.status,
    viewed: application.view_count > 0,
    createdLabel: formatDemoCreatedLabel(application.created_at),
    viewCount: application.view_count,
    downloadCount: application.download_count,
    lastViewedLabel: formatDemoLastViewedLabel(application.last_viewed_at),
    viewedAgoLabel: formatDemoViewedAgoLabel(application.last_viewed_at),
    viewsPillLabel: formatDemoViewsPillLabel(
      application.view_count,
      application.last_viewed_at,
    ),
    linkEnding: formatDemoLinkEnding(application.slug),
    shareUrl: application.public_id
      ? getApplicationUrl(application.public_id, application.slug)
      : "",
    cvMissing: application.cv_exists === false,
    profilePictureMissing: application.profile_picture_missing === true,
  };
}
