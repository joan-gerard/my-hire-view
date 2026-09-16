'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@/components/admin/icons';
import type { Profile } from '@/lib/types/profile';
import {
  ONBOARDING_STEP_IDS,
  buildOnboardingSteps,
  liveCompletedStepIds,
  mergeStepIdLists,
  onboardingProgress,
  type OnboardingChecklistInput,
  type OnboardingStepId,
} from '@/lib/utils/onboarding-checklist';
import {
  DEFAULT_ONBOARDING_CHECKLIST_PREFS,
  readOnboardingChecklistPrefs,
  writeOnboardingChecklistStorage,
  type OnboardingChecklistPrefs,
} from '@/lib/utils/onboarding-checklist-storage';
import { subscribeOnboardingChecklistChanged } from '@/lib/utils/onboarding-checklist-sync';

type OnboardingSnapshot = OnboardingChecklistInput;

/**
 * Floating Getting started checklist for all `/admin` routes (F19-044).
 * Stays visible after every step is complete or skipped until the user dismisses it.
 * Prefs (skips, sticky completions, dismiss, expand) are one localStorage blob
 * scoped by profile `publicId`.
 */
export default function OnboardingChecklist() {
  const pathname = usePathname();
  const panelId = useId();
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [prefs, setPrefs] = useState<OnboardingChecklistPrefs>(
    DEFAULT_ONBOARDING_CHECKLIST_PREFS,
  );
  const loadGenerationRef = useRef(0);

  const persistPrefs = useCallback(
    (next: OnboardingChecklistPrefs) => {
      setPrefs(next);
      if (!publicId) return;
      writeOnboardingChecklistStorage({ publicId, ...next });
    },
    [publicId],
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
    persistPrefs({ ...prefs, dismissed: true });
  }, [persistPrefs, prefs]);

  const load = useCallback(async () => {
    const generation = ++loadGenerationRef.current;
    try {
      setLoadError(false);
      const [profileRes, cvsRes, appsRes, activeRes] = await Promise.all([
        fetch('/api/profile', { credentials: 'include' }),
        fetch('/api/profile/primary-cvs', { credentials: 'include' }),
        fetch('/api/applications?limit=1', { credentials: 'include' }),
        fetch('/api/applications?limit=1&status=active', {
          credentials: 'include',
        }),
      ]);

      if (generation !== loadGenerationRef.current) return;

      if (!profileRes.ok || !cvsRes.ok || !appsRes.ok || !activeRes.ok) {
        setLoadError(true);
        setSnapshot(null);
        setPublicId(null);
        return;
      }

      const profileJson = (await profileRes.json().catch(() => ({}))) as {
        data?: Profile | null;
      };
      const cvsJson = (await cvsRes.json().catch(() => ({}))) as {
        data?: unknown[];
      };
      const appsJson = (await appsRes.json().catch(() => ({}))) as {
        meta?: { total?: number };
      };
      const activeJson = (await activeRes.json().catch(() => ({}))) as {
        meta?: { total?: number };
      };

      if (generation !== loadGenerationRef.current) return;

      const profile = profileJson.data ?? null;
      const nextPublicId =
        typeof profile?.public_id === 'string' && profile.public_id.trim()
          ? profile.public_id.trim()
          : null;
      setPublicId(nextPublicId);
      setSnapshot({
        firstName: profile?.first_name ?? null,
        lastName: profile?.last_name ?? null,
        location: profile?.location ?? null,
        portfolioUrl: profile?.portfolio_url ?? null,
        linkedinUrl: profile?.linkedin_url ?? null,
        profilePictureUrl: profile?.profile_picture_url ?? null,
        primaryCvCount: Array.isArray(cvsJson.data) ? cvsJson.data.length : 0,
        applicationTotal:
          typeof appsJson.meta?.total === 'number' ? appsJson.meta.total : 0,
        activeApplicationCount:
          typeof activeJson.meta?.total === 'number'
            ? activeJson.meta.total
            : 0,
      });
    } catch {
      if (generation !== loadGenerationRef.current) return;
      setLoadError(true);
      setSnapshot(null);
      setPublicId(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    const onFocus = () => {
      void load();
    };
    window.addEventListener('focus', onFocus);
    const unsubscribe = subscribeOnboardingChecklistChanged(() => {
      void load();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, [load]);

  // Hydrate prefs for this publicId; merge any new live completions into storage.
  useEffect(() => {
    if (!publicId) {
      setPrefs(DEFAULT_ONBOARDING_CHECKLIST_PREFS);
      return;
    }
    const current = readOnboardingChecklistPrefs(publicId);
    if (!snapshot) {
      setPrefs(current);
      return;
    }
    const mergedCompleted = mergeStepIdLists(
      current.completed,
      liveCompletedStepIds(snapshot),
    );
    if (mergedCompleted.join(',') === current.completed.join(',')) {
      setPrefs(current);
      return;
    }
    const next = { ...current, completed: mergedCompleted };
    setPrefs(next);
    writeOnboardingChecklistStorage({ publicId, ...next });
  }, [publicId, snapshot]);

  if (loadError || !snapshot || prefs.dismissed) {
    return null;
  }

  const steps = buildOnboardingSteps(
    snapshot,
    prefs.skipped,
    prefs.completed,
  );
  const { completed, total, allDone } = onboardingProgress(steps);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex max-w-[min(100vw-2rem,22rem)] flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {prefs.expanded ? (
        <section
          id={panelId}
          className="pointer-events-auto max-h-[min(70vh,32rem)] w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-lg border border-[var(--foreground)]/15 bg-[var(--secondary-background)] p-4 shadow-lg"
          aria-labelledby="onboarding-checklist-heading"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2
                id="onboarding-checklist-heading"
                className="text-base font-semibold text-[var(--foreground)]"
              >
                Getting started
              </h2>
              <p className="mt-0.5 text-sm text-[var(--foreground)]/60">
                {allDone ? 'All set' : `${completed} of ${total} complete`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandedAndPersist(false)}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              aria-expanded={true}
              aria-controls={panelId}
            >
              Minimize
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <ol className="mt-3 space-y-0.5">
            {steps.map((step) => (
              <li key={step.id}>
                {step.done ? (
                  <div className="flex items-center gap-3 rounded-md px-2 py-1.5 text-[var(--foreground)]/55">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                      aria-hidden
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <p className="min-w-0 flex-1 text-sm font-medium line-through">
                      {step.label}
                    </p>
                    <span className="sr-only">Completed</span>
                  </div>
                ) : step.skipped ? (
                  <div className="flex items-center gap-3 rounded-md px-2 py-1.5 text-[var(--foreground)]/45">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--foreground)]/25"
                      aria-hidden
                    />
                    <p className="min-w-0 flex-1 text-sm font-medium line-through">
                      {step.label}
                    </p>
                    <span className="shrink-0 text-xs">Skipped</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
                    <Link
                      href={step.href}
                      className="flex min-w-0 flex-1 items-center gap-3 text-[var(--foreground)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--foreground)]/25"
                        aria-hidden
                      />
                      <p className="min-w-0 text-sm font-medium text-[var(--brand-primary)]">
                        {step.label}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => skipStep(step.id)}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-[var(--foreground)]/55 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-3 flex justify-end border-t border-[var(--foreground)]/10 pt-3">
            {allDone ? (
              <button
                type="button"
                onClick={dismiss}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--foreground)]/55 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              >
                Dismiss
              </button>
            ) : (
              <button
                type="button"
                onClick={skipAll}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--foreground)]/55 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              >
                Skip all
              </button>
            )}
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setExpandedAndPersist(true)}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[var(--foreground)]/15 bg-[var(--secondary-background)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-lg hover:bg-[var(--foreground)]/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
          aria-expanded={false}
          aria-controls={panelId}
        >
          Getting started
          <span className="rounded-full bg-[var(--brand-primary)]/15 px-2 py-0.5 text-xs font-medium text-[var(--brand-primary)]">
            {allDone ? 'Done' : `${completed}/${total}`}
          </span>
          <ChevronUpIcon className="h-4 w-4 text-[var(--foreground)]/60" />
        </button>
      )}
    </div>
  );
}
