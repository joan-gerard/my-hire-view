"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useApplicationStatusCounts } from "@/hooks/useApplicationStatusCounts";
import {
  fetchApplications,
  publishApplication,
  restoreApplication,
} from "@/lib/api/applications";
import {
  APPLICATION_LIST_DEFAULT_LIMIT,
  APPLICATION_LIST_MAX_LIMIT,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/lib/types/application";
import DemoApplicationCard, {
  type DemoCardLayout,
} from "@/app/demo/care-log/DemoApplicationCard";
import {
  DemoApplicationsSkeleton,
  DemoRecentViewsSkeleton,
} from "@/app/demo/admin/demo-admin-skeletons";
import { mapApplicationToDemo } from "@/app/demo/map-application-to-demo";
import { SprigShell } from "@/app/demo/sprig-shared";

type AppsStatusFilter = "all" | ApplicationStatus;

const APP_STATUS_FILTERS: readonly {
  id: AppsStatusFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Live" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

const SEARCH_DEBOUNCE_MS = 300;

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
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

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** Horizontal strip with edge handles when cards overflow. */
function LatestViewsStrip({
  children,
  itemCount,
}: {
  children: ReactNode;
  itemCount: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [itemCount]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".sg-appcard--grid");
    const step = card
      ? card.getBoundingClientRect().width + 10
      : Math.max(el.clientWidth * 0.7, 220);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div
      className={[
        "sg-dash-views-shell",
        canScrollLeft ? "has-left" : "",
        canScrollRight ? "has-right" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="sg-dash-views__handle is-prev"
        aria-label="Scroll recently viewed left"
        disabled={!canScrollLeft}
        onClick={() => scrollByCard(-1)}
      >
        <ChevronLeftIcon className="sg-dash-views__handle-icon" />
      </button>
      <div ref={scrollerRef} className="sg-dash-views">
        {children}
      </div>
      <button
        type="button"
        className="sg-dash-views__handle is-next"
        aria-label="Scroll recently viewed right"
        disabled={!canScrollRight}
        onClick={() => scrollByCard(1)}
      >
        <ChevronRightIcon className="sg-dash-views__handle-icon" />
      </button>
    </div>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="4" width="18" height="4" rx="1.5" />
      <rect x="3" y="10" width="18" height="4" rx="1.5" />
      <rect x="3" y="16" width="18" height="4" rx="1.5" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Last 10 recently viewed applications, newest view first.
 * Archived rows are excluded — this strip is about live recruiter activity.
 */
function getLatestViews(applications: ApplicationListItem[]): ApplicationListItem[] {
  return [...applications]
    .filter(
      (app) =>
        Boolean(app.last_viewed_at) && app.status !== "archived",
    )
    .sort(
      (a, b) =>
        Date.parse(b.last_viewed_at ?? "") - Date.parse(a.last_viewed_at ?? ""),
    )
    .slice(0, 10);
}

/**
 * Demo-only admin surface shaped like the workspace reference:
 * Dashboard header, Recently viewed strip, then Your Applications.
 */
export function DemoAdminPage() {
  const [cardLayout, setCardLayout] = useState<DemoCardLayout>("grid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [appsFilter, setAppsFilter] = useState<AppsStatusFilter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [appsOffset, setAppsOffset] = useState(0);
  const [appsTotal, setAppsTotal] = useState(0);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [appsRefreshKey, setAppsRefreshKey] = useState(0);
  const [latestSource, setLatestSource] = useState<ApplicationListItem[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const appsLimit = APPLICATION_LIST_DEFAULT_LIMIT;
  const {
    counts,
    loading: countsLoading,
    refetch: refetchCounts,
  } = useApplicationStatusCounts();

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    setAppsOffset(0);
    setApplications([]);
    setAppsLoading(true);
  }, [appsFilter, debouncedQuery]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadApps() {
      try {
        setAppsLoading(true);
        setAppsError(null);
        const { data, meta } = await fetchApplications({
          limit: appsLimit,
          offset: appsOffset,
          status: appsFilter === "all" ? undefined : appsFilter,
          q: debouncedQuery || undefined,
        });
        if (!cancelled) {
          setApplications(data);
          setAppsTotal(meta.total);
        }
      } catch (err) {
        if (!cancelled) {
          setAppsError(
            err instanceof Error
              ? err.message
              : "Failed to load applications",
          );
        }
      } finally {
        if (!cancelled) setAppsLoading(false);
      }
    }

    void loadApps();
    return () => {
      cancelled = true;
    };
  }, [appsFilter, appsOffset, appsLimit, appsRefreshKey, debouncedQuery]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  const handlePublish = useCallback(
    async (id: string) => {
      try {
        setAppsError(null);
        await publishApplication(id);
        setAppsRefreshKey((key) => key + 1);
        void refetchCounts();
      } catch (err) {
        setAppsError(
          err instanceof Error ? err.message : "Failed to publish application",
        );
      }
    },
    [refetchCounts],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      try {
        setAppsError(null);
        await restoreApplication(id);
        setAppsRefreshKey((key) => key + 1);
        void refetchCounts();
      } catch (err) {
        setAppsError(
          err instanceof Error ? err.message : "Failed to restore application",
        );
      }
    },
    [refetchCounts],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      try {
        setLatestLoading(true);
        setLatestError(null);
        const { data } = await fetchApplications({
          limit: APPLICATION_LIST_MAX_LIMIT,
        });
        if (!cancelled) setLatestSource(data);
      } catch (err) {
        if (!cancelled) {
          setLatestError(
            err instanceof Error
              ? err.message
              : "Failed to load recently viewed",
          );
        }
      } finally {
        if (!cancelled) setLatestLoading(false);
      }
    }

    void loadLatest();
    return () => {
      cancelled = true;
    };
  }, []);

  const demoApplications = useMemo(
    () => applications.map(mapApplicationToDemo),
    [applications],
  );

  const appsTotalPages = Math.max(1, Math.ceil(appsTotal / appsLimit) || 1);
  const appsPage = Math.floor(appsOffset / appsLimit) + 1;
  const hasPrevAppsPage = appsOffset > 0;
  const hasNextAppsPage = appsOffset + appsLimit < appsTotal;

  const latestViews = useMemo(
    () => getLatestViews(latestSource).map(mapApplicationToDemo),
    [latestSource],
  );

  return (
    <SprigShell current="admin" wide className="sg-landing--admin">
      <div className="sg-dash">
        <div className="sg-wrap sg-dash__inner">
          <header className="sg-dash__top">
            <div className="sg-dash__brand">
              <h1 id="demo-admin-title">Dashboard</h1>
              <Link href="/admin/new" className="sg-dash__new">
                <PlusIcon className="sg-dash__new-icon" />
                New application
              </Link>
            </div>
          </header>

          {latestLoading || latestViews.length > 0 || latestError ? (
            <section
              className="sg-dash__section"
              aria-labelledby="recently-viewed-title"
            >
              <div className="sg-dash__section-head">
                <h2 id="recently-viewed-title">Recently viewed</h2>
                {!latestLoading && latestViews.length === 10 ? (
                  <p className="sg-dash__count">
                    <span className="sg-dash__count-label">Last</span>{" "}
                    <span className="sg-dash__count-num">10</span>
                  </p>
                ) : null}
              </div>

              {latestError ? (
                <p className="sg-appcards-state" role="alert">
                  {latestError}
                </p>
              ) : null}

              {latestLoading && latestViews.length === 0 && !latestError ? (
                <DemoRecentViewsSkeleton />
              ) : null}

              {!latestError && latestViews.length > 0 ? (
                <LatestViewsStrip itemCount={latestViews.length}>
                  {latestViews.map((application) => (
                    <DemoApplicationCard
                      key={`latest-${application.id}`}
                      application={application}
                      layout="grid"
                      density="compact"
                      isActive={activeId === application.id}
                      onActivate={() => setActiveId(application.id)}
                    />
                  ))}
                </LatestViewsStrip>
              ) : null}
            </section>
          ) : null}

          <section
            className="sg-dash__section"
            aria-labelledby="your-applications-title"
          >
            <div className="sg-dash__section-head sg-dash__section-head--apps">
              <div className="sg-dash__section-titles">
                <h2 id="your-applications-title">Your Applications</h2>
                <p className="sg-dash__count">
                  {appsLoading ? (
                    "…"
                  ) : (
                    <>
                      <span className="sg-dash__count-num">{appsTotal}</span>{" "}
                      <span className="sg-dash__count-label">
                        Application{appsTotal === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
                </p>
              </div>
              {countsLoading || counts.all > 0 ? (
                <div className="sg-dash__section-tools">
                  <div
                    className={`sg-dash__search${searchOpen ? " is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className={`sg-dash__search-toggle${searchOpen || searchQuery ? " is-active" : ""}`}
                      aria-label={
                        searchOpen ? "Close search" : "Search applications"
                      }
                      aria-expanded={searchOpen}
                      aria-controls="demo-apps-search"
                      onClick={() => {
                        if (searchOpen) {
                          closeSearch();
                          return;
                        }
                        setSearchOpen(true);
                      }}
                    >
                      <span className="sg-dash__search-icons" aria-hidden>
                        <SearchIcon className="sg-dash__search-icon is-search" />
                        <CloseIcon className="sg-dash__search-icon is-close" />
                      </span>
                    </button>
                    <div className="sg-dash__search-field">
                      <div className="sg-dash__search-field-inner">
                        <input
                          ref={searchInputRef}
                          id="demo-apps-search"
                          type="search"
                          className="sg-dash__search-input"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Escape") closeSearch();
                          }}
                          placeholder="Company, role, or slug"
                          aria-label="Search applications"
                          tabIndex={searchOpen ? 0 : -1}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="sg-dash__filters"
                    role="group"
                    aria-label="Filter applications by status"
                  >
                    {APP_STATUS_FILTERS.map((filter) => {
                      const filterCount = counts[filter.id];
                      return (
                        <button
                          key={filter.id}
                          type="button"
                          className={`sg-dash__filter${appsFilter === filter.id ? " is-active" : ""}`}
                          aria-pressed={appsFilter === filter.id}
                          aria-label={`${filter.label}, ${filterCount}`}
                          onClick={() => setAppsFilter(filter.id)}
                        >
                          <span className="sg-dash__filter-label">
                            {filter.label}
                          </span>
                          <span className="sg-dash__filter-badge" aria-hidden>
                            {countsLoading ? "…" : filterCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className="sg-appcards-layout"
                    role="group"
                    aria-label="Card layout"
                  >
                    <button
                      type="button"
                      className={
                        cardLayout === "grid" ? "is-active" : undefined
                      }
                      aria-pressed={cardLayout === "grid"}
                      onClick={() => setCardLayout("grid")}
                    >
                      <GridIcon className="sg-appcards-layout-icon" />
                      Grid
                    </button>
                    <button
                      type="button"
                      className={
                        cardLayout === "list" ? "is-active" : undefined
                      }
                      aria-pressed={cardLayout === "list"}
                      onClick={() => setCardLayout("list")}
                    >
                      <ListIcon className="sg-appcards-layout-icon" />
                      List
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {appsError ? (
              <p className="sg-appcards-state" role="alert">
                {appsError}
              </p>
            ) : null}

            {!appsError && !appsLoading && demoApplications.length === 0 ? (
              <div className="sg-dash-empty" role="status">
                {debouncedQuery ? (
                  <>
                    <h3 className="sg-dash-empty__title">
                      No applications match that search
                    </h3>
                    <p className="sg-dash-empty__copy">
                      Try another company, role, or slug — or clear the search
                      to see everything again.
                    </p>
                    <button
                      type="button"
                      className="sg-dash-empty__action is-secondary"
                      onClick={closeSearch}
                    >
                      Clear search
                    </button>
                  </>
                ) : appsFilter !== "all" ? (
                  <>
                    <h3 className="sg-dash-empty__title">
                      No {appsFilter === "active" ? "live" : appsFilter}{" "}
                      applications
                    </h3>
                    <p className="sg-dash-empty__copy">
                      Nothing in this filter right now. Switch to All, or create
                      a new application.
                    </p>
                    <div className="sg-dash-empty__actions">
                      <button
                        type="button"
                        className="sg-dash-empty__action is-secondary"
                        onClick={() => setAppsFilter("all")}
                      >
                        Show all
                      </button>
                      <Link href="/admin/new" className="sg-dash-empty__action">
                        New application
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="sg-dash-empty__title">
                      Create your first application
                    </h3>
                    <p className="sg-dash-empty__copy">
                      Put your CV and video pitch on one page, publish it, and
                      share a single link with recruiters. Your applications
                      will show up here.
                    </p>
                    <Link href="/admin/new" className="sg-dash-empty__action">
                      New application
                    </Link>
                  </>
                )}
              </div>
            ) : null}

            {!appsError && appsLoading && demoApplications.length === 0 ? (
              <DemoApplicationsSkeleton layout={cardLayout} />
            ) : null}

            {!appsError && demoApplications.length > 0 ? (
              <>
                <div
                  key={`${appsFilter}-${debouncedQuery}-${cardLayout}-${appsPage}`}
                  className={
                    cardLayout === "list"
                      ? "sg-appcards-list sg-appcards-list--enter"
                      : "sg-appcards-grid sg-appcards-grid--enter"
                  }
                  aria-busy={appsLoading || undefined}
                >
                  {demoApplications.map((application) => (
                    <DemoApplicationCard
                      key={application.id}
                      application={application}
                      layout={cardLayout}
                      isActive={activeId === application.id}
                      onActivate={() => setActiveId(application.id)}
                      onPublish={handlePublish}
                      onRestore={handleRestore}
                    />
                  ))}
                </div>
                {appsTotalPages > 1 ? (
                  <div className="sg-appcards-pager">
                    <p>
                      Page {appsPage} of {appsTotalPages}
                      {appsLimit < appsTotal
                        ? ` · showing ${demoApplications.length} of ${appsTotal}`
                        : null}
                    </p>
                    <div className="sg-appcards-pager-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setAppsOffset((prev) =>
                            Math.max(0, prev - appsLimit),
                          )
                        }
                        disabled={!hasPrevAppsPage || appsLoading}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAppsOffset((prev) => prev + appsLimit)
                        }
                        disabled={!hasNextAppsPage || appsLoading}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </SprigShell>
  );
}
