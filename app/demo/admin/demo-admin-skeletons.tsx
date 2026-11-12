import type { DemoCardLayout } from "@/app/demo/care-log/DemoApplicationCard";

const APPS_SKELETON_COUNT = 8;
const RECENT_SKELETON_COUNT = 4;

function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

/** Grid card placeholder matching the 3/2 notched card footprint. */
export function DemoGridCardSkeleton({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={`sg-skel-card${compact ? " is-compact" : ""}`}
      aria-hidden
    >
      <div className="sg-skel-card__badge" />
      <div className="sg-skel-card__body">
        <div className="sg-skel-card__line is-lg" />
        <div className="sg-skel-card__line is-md" />
        <div className="sg-skel-card__line is-sm" />
      </div>
      {!compact ? (
        <div className="sg-skel-card__footer">
          <div className="sg-skel-card__pill" />
          <div className="sg-skel-card__icons">
            <span />
            <span />
          </div>
        </div>
      ) : (
        <div className="sg-skel-card__line is-xs" />
      )}
    </div>
  );
}

/** List-row placeholder matching the admin-like application row. */
export function DemoListRowSkeleton() {
  return (
    <div className="sg-skel-row" aria-hidden>
      <div className="sg-skel-row__lead">
        <div className="sg-skel-row__time" />
        <div className="sg-skel-row__badge" />
      </div>
      <div className="sg-skel-row__title" />
      <div className="sg-skel-row__actions">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/** Horizontal strip of compact cards for Recently viewed. */
export function DemoRecentViewsSkeleton({
  count = RECENT_SKELETON_COUNT,
}: {
  count?: number;
}) {
  return (
    <div
      className="sg-dash-views-shell"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sg-skel-sr">Loading recently viewed</span>
      <div className="sg-dash-views">
        {range(count).map((index) => (
          <DemoGridCardSkeleton key={index} compact />
        ))}
      </div>
    </div>
  );
}

/** Your Applications grid or list loading shell. */
export function DemoApplicationsSkeleton({
  layout,
  count = APPS_SKELETON_COUNT,
}: {
  layout: DemoCardLayout;
  count?: number;
}) {
  const isList = layout === "list";
  return (
    <div
      className={isList ? "sg-appcards-list" : "sg-appcards-grid"}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sg-skel-sr">Loading applications</span>
      {range(count).map((index) =>
        isList ? (
          <DemoListRowSkeleton key={index} />
        ) : (
          <DemoGridCardSkeleton key={index} />
        ),
      )}
    </div>
  );
}
