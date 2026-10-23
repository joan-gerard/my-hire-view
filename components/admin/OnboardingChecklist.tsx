"use client";

import { ADMIN_PANEL_CLASS } from "@/components/admin/admin-chrome";
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@/components/admin/icons";
import { requestAccountSettingsTab } from "@/lib/admin/account-settings-tabs";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/profile";
import {
    ONBOARDING_STEP_IDS,
    buildOnboardingSteps,
    liveCompletedStepIds,
    mergeStepIdLists,
    onboardingProgress,
    type OnboardingChecklistInput,
    type OnboardingStepId,
} from "@/lib/utils/onboarding-checklist";
import {
    DEFAULT_ONBOARDING_CHECKLIST_PREFS,
    readOnboardingChecklistPrefs,
    resolveOnboardingAccountKey,
    writeOnboardingChecklistStorage,
    type OnboardingChecklistPrefs,
} from "@/lib/utils/onboarding-checklist-storage";
import { subscribeOnboardingChecklistChanged } from "@/lib/utils/onboarding-checklist-sync";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const FOCUS_RING =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

const GHOST_ACTION_CLASS = `shrink-0 cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--ink)]/[0.06] hover:text-[var(--ink)] ${FOCUS_RING}`;

const TOGGLE_BUTTON_CLASS = `pointer-events-auto inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[var(--ink)]/12 bg-[var(--white)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-[0_8px_24px_-12px_rgba(11,11,12,0.35)] transition-shadow hover:shadow-[0_10px_28px_-12px_rgba(11,11,12,0.4)] ${FOCUS_RING}`;

type OnboardingSnapshot = OnboardingChecklistInput;

export type OnboardingChecklistProps = {
  /** From admin dashboard server load — avoids four /api GETs on first paint. */
  initialAccountKey: string | null;
  initialSnapshot: OnboardingChecklistInput | null;
  /**
   * `rail` — embedded below the dashboard Summary (default).
   * `floating` — legacy bottom-right control (kept for tests / optional reuse).
   */
  variant?: "rail" | "floating";
};

/**
 * Getting started checklist (F19-044).
 * Default: dashboard right rail under the status summary.
 * Stays visible after every step is complete or skipped until the user dismisses it.
 * Prefs are one localStorage blob scoped by account key (public_id or user id).
 * Initial data comes from the admin dashboard page (Supabase); client refetches
 * only when mutations notify — not on every navigation/focus.
 */
export default function OnboardingChecklist({
  initialAccountKey,
  initialSnapshot,
  variant = "rail",
}: OnboardingChecklistProps) {
  const panelId = useId();
  const toggleId = useId();
  const isRail = variant === "rail";
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(
    initialSnapshot,
  );
  const [accountKey, setAccountKey] = useState<string | null>(
    initialAccountKey,
  );
  const [loadError, setLoadError] = useState(false);
  const [prefs, setPrefs] = useState<OnboardingChecklistPrefs>(
    DEFAULT_ONBOARDING_CHECKLIST_PREFS,
  );
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const loadGenerationRef = useRef(0);
  const dismissedRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

  const persistPrefs = useCallback(
    (next: OnboardingChecklistPrefs) => {
      dismissedRef.current = next.dismissed;
      setPrefs(next);
      if (!accountKey) return;
      writeOnboardingChecklistStorage({ accountKey, ...next });
    },
    [accountKey],
  );

  const setExpandedAndPersist = useCallback(
    (expanded: boolean) => {
      persistPrefs({ ...prefs, expanded });
    },
    [persistPrefs, prefs],
  );

  const persistSkipped = useCallback(
    (skipped: OnboardingStepId[]) => {
      const ordered = ONBOARDING_STEP_IDS.filter((id) => skipped.includes(id));
      persistPrefs({ ...prefs, skipped: ordered });
    },
    [persistPrefs, prefs],
  );

  const skipStep = useCallback(
    (id: OnboardingStepId) => {
      if (prefs.skipped.includes(id)) return;
      persistSkipped([...prefs.skipped, id]);
    },
    [persistSkipped, prefs.skipped],
  );

  const skipAll = useCallback(() => {
    persistSkipped([...ONBOARDING_STEP_IDS]);
  }, [persistSkipped]);

  const dismiss = useCallback(() => {
    // Invalidate any in-flight load so a late reject cannot clear account state
    // and re-enable mutation refetches for a dismissed checklist.
    loadGenerationRef.current += 1;
    persistPrefs({ ...prefs, dismissed: true });
  }, [persistPrefs, prefs]);

  const load = useCallback(async () => {
    if (dismissedRef.current) return;

    const generation = ++loadGenerationRef.current;
    const isStale = () =>
      generation !== loadGenerationRef.current || dismissedRef.current;

    try {
      setLoadError(false);
      const [profileRes, cvsRes, appsRes, activeRes] = await Promise.all([
        fetch("/api/profile", { credentials: "include" }),
        fetch("/api/profile/primary-cvs", { credentials: "include" }),
        fetch("/api/applications?limit=1", { credentials: "include" }),
        fetch("/api/applications?limit=1&status=active", {
          credentials: "include",
        }),
      ]);

      if (isStale()) return;

      const profileMissing = profileRes.status === 404;
      if (
        (!profileRes.ok && !profileMissing) ||
        !cvsRes.ok ||
        !appsRes.ok ||
        !activeRes.ok
      ) {
        if (isStale()) return;
        setLoadError(true);
        setSnapshot(null);
        setAccountKey(null);
        return;
      }

      const profileJson = profileMissing
        ? { data: null }
        : ((await profileRes.json().catch(() => ({}))) as {
            data?: Profile | null;
          });
      const cvsJson = (await cvsRes.json().catch(() => ({}))) as {
        data?: unknown[];
      };
      const appsJson = (await appsRes.json().catch(() => ({}))) as {
        meta?: { total?: number };
      };
      const activeJson = (await activeRes.json().catch(() => ({}))) as {
        meta?: { total?: number };
      };

      if (isStale()) return;

      const profile = profileJson.data ?? null;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isStale()) return;

      const nextAccountKey = resolveOnboardingAccountKey({
        profilePublicId: profile?.public_id ?? null,
        metadataPublicId: user ? publicIdFromUserMetadata(user) : null,
        authUserId: user?.id ?? null,
      });

      if (!nextAccountKey) {
        if (isStale()) return;
        setLoadError(true);
        setSnapshot(null);
        setAccountKey(null);
        return;
      }

      setAccountKey(nextAccountKey);
      setSnapshot({
        firstName: profile?.first_name ?? null,
        lastName: profile?.last_name ?? null,
        location: profile?.location ?? null,
        portfolioUrl: profile?.portfolio_url ?? null,
        linkedinUrl: profile?.linkedin_url ?? null,
        profilePictureUrl: profile?.profile_picture_url ?? null,
        primaryCvCount: Array.isArray(cvsJson.data) ? cvsJson.data.length : 0,
        applicationTotal:
          typeof appsJson.meta?.total === "number" ? appsJson.meta.total : 0,
        activeApplicationCount:
          typeof activeJson.meta?.total === "number"
            ? activeJson.meta.total
            : 0,
      });
    } catch {
      if (isStale()) return;
      setLoadError(true);
      setSnapshot(null);
      setAccountKey(null);
    }
  }, []);

  // Sync layout bootstrap into state when it arrives or updates (e.g. after
  // router.refresh). Only fall back to a client fetch when bootstrap is missing.
  useEffect(() => {
    if (initialSnapshot && initialAccountKey) {
      setSnapshot(initialSnapshot);
      setAccountKey(initialAccountKey);
      setLoadError(false);
      return;
    }
    if (dismissedRef.current) return;
    void load();
  }, [load, initialSnapshot, initialAccountKey]);

  useEffect(() => {
    const unsubscribe = subscribeOnboardingChecklistChanged(() => {
      if (dismissedRef.current) return;
      void load();
    });
    return unsubscribe;
  }, [load]);

  // Hydrate prefs for this account; merge any new live completions into storage.
  useEffect(() => {
    if (!accountKey) {
      dismissedRef.current = false;
      setPrefs(DEFAULT_ONBOARDING_CHECKLIST_PREFS);
      setPrefsHydrated(false);
      return;
    }
    const current = readOnboardingChecklistPrefs(accountKey);
    const withLive =
      snapshot == null
        ? current
        : (() => {
            const mergedCompleted = mergeStepIdLists(
              current.completed,
              liveCompletedStepIds(snapshot),
            );
            if (mergedCompleted.join(",") === current.completed.join(",")) {
              return current;
            }
            return { ...current, completed: mergedCompleted };
          })();

    dismissedRef.current = withLive.dismissed;
    setPrefs(withLive);
    setPrefsHydrated(true);
    if (withLive !== current) {
      writeOnboardingChecklistStorage({ accountKey, ...withLive });
    }
  }, [accountKey, snapshot]);

  if (
    !prefsHydrated ||
    loadError ||
    !snapshot ||
    !accountKey ||
    prefs.dismissed
  ) {
    return null;
  }

  const steps = buildOnboardingSteps(snapshot, prefs.skipped, prefs.completed);
  const { completed, total, allDone } = onboardingProgress(steps);
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const panelExpanded = prefs.expanded;
  const bodyId = `${panelId}-body`;

  const stepList = (
          <ol
            className={
              isRail
                ? "space-y-0 px-3 py-2"
                : "min-h-0 flex-1 space-y-0 overflow-y-auto px-3 py-2"
            }
          >
            {steps.map((step) => (
              <li key={step.id}>
                {step.done ? (
                  <div className="flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-[var(--muted)]">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"
                      aria-hidden
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <p className="min-w-0 flex-1 text-sm font-medium leading-snug line-through">
                      {step.label}
                    </p>
                    <span className="sr-only">Completed</span>
                  </div>
                ) : step.skipped ? (
                  <div className="flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-[var(--muted)]">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--ink)]/20"
                      aria-hidden
                    />
                    <p className="min-w-0 flex-1 text-sm font-medium leading-snug line-through">
                      {step.label}
                    </p>
                    <span className="shrink-0 text-xs font-medium">
                      Skipped
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-xl hover:bg-[var(--ink)]/[0.03]">
                    <Link
                      href={step.href}
                      onClick={(event) => {
                        // Modifier / non-primary clicks open a new tab — do not
                        // hand off Account settings tab state for this window.
                        if (
                          step.id === "primary_cv" &&
                          event.button === 0 &&
                          !event.metaKey &&
                          !event.ctrlKey &&
                          !event.shiftKey &&
                          !event.altKey
                        ) {
                          requestAccountSettingsTab("cvs");
                        }
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-1.5 text-[var(--ink)] ${FOCUS_RING}`}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[var(--white)]"
                        aria-hidden
                      />
                      <p className="min-w-0 text-sm font-medium leading-snug text-[var(--ink)]">
                        {step.label}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => skipStep(step.id)}
                      className={`${GHOST_ACTION_CLASS} mr-1`}
                    >
                      Skip
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
  );

  const footer = (
          <footer className="flex shrink-0 justify-end border-t border-[var(--ink)]/8 px-4 py-3">
            {allDone ? (
              <button
                type="button"
                onClick={dismiss}
                className={GHOST_ACTION_CLASS}
              >
                Dismiss
              </button>
            ) : (
              <button
                type="button"
                onClick={skipAll}
                className={GHOST_ACTION_CLASS}
              >
                Skip all
              </button>
            )}
          </footer>
  );

  if (isRail) {
    return (
      <section
        id={panelId}
        className={`flex flex-col overflow-hidden ${ADMIN_PANEL_CLASS}`}
        aria-labelledby="onboarding-checklist-heading"
      >
        <h2 id="onboarding-checklist-heading" className="m-0">
          <button
            type="button"
            className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 ${FOCUS_RING} focus-visible:outline-offset-[-2px]`}
            aria-expanded={panelExpanded}
            aria-controls={bodyId}
            aria-label={
              allDone
                ? "Getting started, all steps done"
                : `Getting started, ${completed} of ${total} complete`
            }
            onClick={() => setExpandedAndPersist(!prefs.expanded)}
          >
            <span className="min-w-0 font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]">
              Getting started
            </span>
            <span className="inline-flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-[var(--lime)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--ink)]">
                {allDone ? "Done" : `${completed}/${total}`}
              </span>
              {panelExpanded ? (
                <ChevronUpIcon className="h-4 w-4 text-[var(--muted)]" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-[var(--muted)]" />
              )}
            </span>
          </button>
        </h2>

        {panelExpanded ? (
          <div id={bodyId}>
            <div className="border-t border-[var(--ink)]/8 px-4 pb-3 pt-3 sm:px-5">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/[0.08]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={completed}
                aria-label={`${completed} of ${total} steps complete`}
              >
                <div
                  className={`h-full rounded-full bg-[var(--lime)]${
                    reduceMotion
                      ? ""
                      : " transition-[width] duration-300 ease-out"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            {stepList}
            {footer}
          </div>
        ) : (
          <div id={bodyId} hidden />
        )}
      </section>
    );
  }

  const panel = (
        <section
          id={panelId}
          className={`flex max-h-[min(70vh,36rem)] flex-col overflow-hidden ${ADMIN_PANEL_CLASS} pointer-events-auto shadow-[0_12px_40px_-16px_rgba(11,11,12,0.28)]`}
          aria-labelledby="onboarding-checklist-heading"
        >
          {/* Outer px-3 + inner px-2.5 matches list row inset so title/bar line up with icons. */}
          <header className="shrink-0 space-y-3 border-b border-[var(--ink)]/8 px-3 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3 px-2.5">
              <div className="min-w-0">
                <h2
                  id="onboarding-checklist-heading"
                  className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]"
                >
                  Getting started
                </h2>
              </div>
              <span
                className="shrink-0 rounded-full bg-[var(--lime)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--ink)]"
                aria-hidden
              >
                {allDone ? "Done" : `${completed}/${total}`}
              </span>
            </div>
            <div className="px-2.5">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/[0.08]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={completed}
                aria-label={`${completed} of ${total} steps complete`}
              >
                <div
                  className={`h-full rounded-full bg-[var(--lime)]${
                    reduceMotion
                      ? ""
                      : " transition-[width] duration-300 ease-out"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </header>

          {stepList}
          {footer}
        </section>
  );

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[min(100vw-2rem,22rem)] flex-col items-stretch sm:bottom-6 sm:right-6">
      {/* Stay mounted so aria-controls always resolves; animate height instead of unmounting. */}
      <motion.div
        initial={false}
        animate={
          panelExpanded
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        transition={motionTransition}
        className={`overflow-hidden ${panelExpanded ? "mb-3" : ""}`}
        inert={panelExpanded ? undefined : true}
        aria-hidden={!panelExpanded}
      >
        {panel}
      </motion.div>

      {/* Stable disclosure control — panel stays mounted so aria-controls remains valid. */}
      <div className="flex justify-end">
        <motion.button
          id={toggleId}
          type="button"
          layout
          transition={{ layout: motionTransition }}
          onClick={() => setExpandedAndPersist(!prefs.expanded)}
          className={TOGGLE_BUTTON_CLASS}
          aria-expanded={prefs.expanded}
          aria-controls={panelId}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {prefs.expanded ? (
              <motion.span
                key="minimize"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionTransition}
              >
                Minimize
                <ChevronDownIcon className="h-4 w-4 text-[var(--muted)]" />
              </motion.span>
            ) : (
              <motion.span
                key="getting-started"
                className="inline-flex items-center gap-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionTransition}
              >
                Getting started
                <span className="rounded-full bg-[var(--lime)] px-2 py-0.5 text-xs font-semibold tabular-nums text-[var(--ink)]">
                  {allDone ? "Done" : `${completed}/${total}`}
                </span>
                <ChevronUpIcon className="h-4 w-4 text-[var(--muted)]" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
