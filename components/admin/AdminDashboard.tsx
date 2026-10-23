'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import ApplicationCard from '@/components/admin/ApplicationCard';
import ApplicationStatusLegend from '@/components/admin/ApplicationStatusLegend';
import ApplicationStatusSummary from '@/components/admin/ApplicationStatusSummary';
import ApplicationsPagination from '@/components/admin/ApplicationsPagination';
import SearchBar from '@/components/admin/SearchBar';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import AdminDashboardError from '@/components/admin/AdminDashboardError';
import AdminDashboardEmpty from '@/components/admin/AdminDashboardEmpty';
import OnboardingChecklist from '@/components/admin/OnboardingChecklist';
import { useApplications } from '@/hooks/useApplications';
import { useApplicationStatusCounts } from '@/hooks/useApplicationStatusCounts';
import AdminTooltip from '@/components/admin/AdminTooltip';
import { PlusIcon, QuestionIcon } from '@/components/admin/icons';
import {
  ADMIN_ICON_ACCENT_PRIMARY_CLASS,
  ADMIN_ICON_SECONDARY_CLASS,
  ADMIN_PANEL_CLASS,
} from '@/components/admin/admin-chrome';
import { useClientMounted } from '@/hooks/useClientMounted';
import { groupApplicationsByDay } from '@/lib/utils/group-applications-by-day';
import { timeOfDayGreeting } from '@/lib/utils/admin-dashboard-greeting';
import type { OnboardingChecklistInput } from '@/lib/utils/onboarding-checklist';

const DESKTOP_RAIL_MQ = '(min-width: 1024px)';
/** Matches the sticky offset gap under the 72px header. */
const RAIL_BOTTOM_GAP_PX = 16;

/**
 * Pixel height of the space from the rail's current top to the viewport bottom.
 * A fixed `100svh - header` is too tall while the rail still sits under the
 * greeting, so the column hangs below the fold and never scrolls on its own.
 */
function useDesktopRailHeight(railEl: HTMLElement | null): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!railEl) return;

    const desktopMq = window.matchMedia(DESKTOP_RAIL_MQ);
    let frame = 0;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      if (!desktopMq.matches) {
        setHeight((prev) => (prev === null ? prev : null));
        return;
      }
      const top = railEl.getBoundingClientRect().top;
      const next = Math.max(
        160,
        Math.floor(window.innerHeight - top - RAIL_BOTTOM_GAP_PX),
      );
      setHeight((prev) =>
        prev != null && Math.abs(prev - next) < 2 ? prev : next,
      );
    };

    const schedule = () => {
      if (cancelled) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    desktopMq.addEventListener('change', schedule);
    const fontsReady = document.fonts?.ready;
    void fontsReady?.then(schedule).catch(() => undefined);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      desktopMq.removeEventListener('change', schedule);
    };
  }, [railEl]);

  return height;
}

/**
 * Stop a wheel gesture that the rail can consume from chaining to the page.
 * Search sits above the scrollport, so a wheel there is applied to the rail.
 * If the rail content fits, the page scrolls as usual.
 */
function useContainRailWheel(
  boundaryEl: HTMLElement | null,
  scrollEl: HTMLElement | null,
) {
  useEffect(() => {
    if (!boundaryEl || !scrollEl) return;

    const desktopMq = window.matchMedia(DESKTOP_RAIL_MQ);

    const onWheel = (event: WheelEvent) => {
      if (!desktopMq.matches || event.deltaY === 0) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const canScroll = scrollHeight > clientHeight + 1;
      if (!canScroll) return;

      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      // At an edge, let the page scroll (including when the target is Search).
      if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
        return;
      }

      const overScrollport = scrollEl.contains(event.target as Node);
      if (!overScrollport) {
        // Wheel is over sticky chrome (e.g. Search) — drive the rail instead
        // of the page while the rail can still move.
        scrollEl.scrollTop += event.deltaY;
        event.preventDefault();
      }
      // Inside the scrollport and not at an edge: leave the event alone so
      // the browser scrolls the rail natively.
    };

    boundaryEl.addEventListener('wheel', onWheel, { passive: false });
    return () => boundaryEl.removeEventListener('wheel', onWheel);
  }, [boundaryEl, scrollEl]);
}

export type AdminDashboardProps = {
  /** Profile / signup first name for the personalized header. */
  firstName: string | null;
  onboardingAccountKey: string | null;
  onboardingSnapshot: OnboardingChecklistInput | null;
};

export default function AdminDashboard({
  firstName,
  onboardingAccountKey,
  onboardingSnapshot,
}: AdminDashboardProps) {
  const [legendOpen, setLegendOpen] = useState(false);
  const {
    applications,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    loading,
    isFetching,
    error,
    limit,
    offset,
    total,
    page,
    totalPages,
    hasPrevPage,
    hasNextPage,
    goToPrevPage,
    goToNextPage,
    handleDelete,
    handleArchive,
    handleRestore,
    handlePublish,
  } = useApplications();

  const {
    counts,
    loading: countsLoading,
    error: countsError,
    refetch: refetchCounts,
  } = useApplicationStatusCounts();

  // Day labels, row times, and the greeting use the browser clock — wait until
  // mount so SSR (server TZ) cannot disagree with hydration.
  const localClockReady = useClientMounted();
  const dayGroups = localClockReady
    ? groupApplicationsByDay(applications)
    : [];
  const trimmedName = firstName?.trim() || null;
  const [railBoxEl, setRailBoxEl] = useState<HTMLElement | null>(null);
  const [railScrollEl, setRailScrollEl] = useState<HTMLDivElement | null>(null);
  const railHeight = useDesktopRailHeight(railBoxEl);
  useContainRailWheel(railBoxEl, railScrollEl);

  const onDelete = useCallback(
    async (id: string) => {
      await handleDelete(id);
      await refetchCounts();
    },
    [handleDelete, refetchCounts],
  );

  const onArchive = useCallback(
    async (id: string) => {
      await handleArchive(id);
      await refetchCounts();
    },
    [handleArchive, refetchCounts],
  );

  const onRestore = useCallback(
    async (id: string) => {
      await handleRestore(id);
      await refetchCounts();
    },
    [handleRestore, refetchCounts],
  );

  const onPublish = useCallback(
    async (id: string) => {
      await handlePublish(id);
      await refetchCounts();
    },
    [handlePublish, refetchCounts],
  );

  if (loading || !localClockReady) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return <AdminDashboardError message={error} />;
  }

  // Keep chrome while the input or committed query is non-empty, and through the
  // in-flight refetch after clearing a no-match search (stale applications=[]).
  const hasSearchFilter =
    searchQuery.trim() !== '' || debouncedQuery.trim() !== '';
  const showListChrome =
    applications.length > 0 || hasSearchFilter || isFetching;

  // Desktop: the rail is only as tall as the visible gap under its current top,
  // including while the page is still at the top and the column sits below the
  // greeting. Cards use overflow:hidden, which lets a flex item shrink to 0 and
  // clip instead of scrolling — shrink-0 keeps their real height so this
  // scrollport can move. Mobile: natural document flow.
  const sidebar = (
    <aside
      ref={setRailBoxEl}
      className="flex w-full flex-col gap-4 lg:sticky lg:top-[calc(72px+1rem)] lg:self-start"
      style={railHeight != null ? { height: railHeight } : undefined}
    >
      {/* Stable mount so focus survives empty ↔ non-empty result flips. */}
      {showListChrome ? (
        <div className="shrink-0">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      ) : null}
      <div
        ref={setRailScrollEl}
        className={
          railHeight != null
            ? 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'flex flex-col gap-4'
        }
      >
        <div className="shrink-0">
          <ApplicationStatusSummary
            counts={counts}
            loading={countsLoading}
            error={countsError}
          />
        </div>
        <div className="shrink-0">
          <OnboardingChecklist
            variant="rail"
            initialAccountKey={onboardingAccountKey}
            initialSnapshot={onboardingSnapshot}
          />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <div className="min-w-0 space-y-3">
            {trimmedName ? (
              <p className="text-sm text-[var(--muted)]">
                {timeOfDayGreeting()}, {trimmedName}
              </p>
            ) : null}
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
              Applications
            </h1>
          </div>
          {showListChrome ? (
            <button
              type="button"
              onClick={() => setLegendOpen(true)}
              className={`${ADMIN_ICON_SECONDARY_CLASS} self-end`}
              aria-haspopup="dialog"
              aria-label="What do these icons mean?"
              title="What do these icons mean?"
            >
              <QuestionIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <AdminTooltip label="Create new application">
          <Link
            href="/admin/new"
            className={ADMIN_ICON_ACCENT_PRIMARY_CLASS}
            aria-label="Create new application"
          >
            <PlusIcon className="h-7 w-7" />
          </Link>
        </AdminTooltip>
      </div>

      <ApplicationStatusLegend
        open={showListChrome && legendOpen}
        onClose={() => setLegendOpen(false)}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-6">
          {applications.length === 0 && !showListChrome ? (
            <AdminDashboardEmpty
              hasSearchQuery={false}
              onClearSearch={() => setSearchQuery('')}
            />
          ) : (
            <div className="space-y-6">
              {applications.length === 0 &&
              (hasSearchFilter || !isFetching) ? (
                <AdminDashboardEmpty
                  hasSearchQuery={hasSearchFilter}
                  onClearSearch={() => setSearchQuery('')}
                  embedded
                />
              ) : applications.length > 0 ? (
                <>
                  <div
                    className={`space-y-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
                  >
                    {dayGroups.map((group) => (
                      <section key={group.dayKey} className="space-y-2">
                        <h2 className="sticky top-[var(--admin-header-height,72px)] z-20 bg-[var(--white)] py-2 text-sm font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
                          {group.label}
                        </h2>
                        <div
                          className={`${ADMIN_PANEL_CLASS} divide-y divide-[var(--ink)]/8`}
                        >
                          {group.applications.map((application) => (
                            <ApplicationCard
                              key={application.id}
                              application={application}
                              onDelete={onDelete}
                              onArchive={onArchive}
                              onRestore={onRestore}
                              onPublish={onPublish}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                  <div className="border-t border-[var(--ink)]/8 pt-4">
                    <ApplicationsPagination
                      page={page}
                      totalPages={totalPages}
                      total={total}
                      offset={offset}
                      limit={limit}
                      hasPrevPage={hasPrevPage}
                      hasNextPage={hasNextPage}
                      isFetching={isFetching}
                      onPrev={goToPrevPage}
                      onNext={goToNextPage}
                    />
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {sidebar}
      </div>
    </div>
  );
}
