"use client";

import {
  isLeaveGuardHistoryState,
  shouldBlockSameOriginNavigation,
  waitUntilLeaveGuardCleared,
} from "@/lib/utils/leave-confirm";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PendingLeave = { kind: "href"; href: string } | { kind: "back" };

const GUARD_STATE = { __mhvLeaveGuard: true } as const;

/**
 * When `enabled`, intercept same-origin link clicks and browser Back, show a
 * confirm dialog, and only leave after `onDiscard` + confirm.
 * Refresh / tab close are intentionally not blocked (draft restore still helps).
 *
 * Uses a single history sentinel: push once while armed, remove on disarm /
 * unmount, never stack duplicates when progress flickers.
 *
 * A long-lived `popstate` listener stays mounted for the hook lifetime so
 * asynchronous sentinel-removal events are always consumed, even when draft
 * progress has toggled `enabled` off.
 */
export function useLeaveConfirm(
  enabled: boolean,
  onDiscard: () => void,
): {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * Drop the history sentinel immediately and wait until it is gone.
   * Call before programmatic navigation (successful create) so sentinel
   * `history.back()` cannot race `router.push`.
   */
  disarmForNavigation: () => Promise<void>;
} {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const enabledRef = useRef(enabled);
  const bypassRef = useRef(false);
  /** True until the intentional sentinel-removal `popstate` is consumed. */
  const pendingRemovalRef = useRef(false);
  /** After dropping the sentinel, replace the create entry with this href. */
  const pendingHrefAfterBackRef = useRef<string | null>(null);
  /** Confirmed browser-Back leave: wait until off the create path, else fallback. */
  const pendingExitCreatePathRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingLeave | null>(null);
  const onDiscardRef = useRef(onDiscard);
  /** True while we believe our sentinel entry is on top of history. */
  const guardActiveRef = useRef(false);
  enabledRef.current = enabled;
  onDiscardRef.current = onDiscard;

  const pushSentinel = useCallback(() => {
    if (guardActiveRef.current && isLeaveGuardHistoryState(window.history.state)) {
      return;
    }
    window.history.pushState(GUARD_STATE, "", window.location.href);
    guardActiveRef.current = true;
  }, []);

  const ensureSentinel = useCallback(() => {
    if (pendingRemovalRef.current) return;
    bypassRef.current = false;
    pushSentinel();
  }, [pushSentinel]);

  /**
   * Finish a confirmed same-origin link leave only once we are no longer on the
   * sentinel entry (so we never replace the sentinel before `history.back` lands).
   */
  const tryCompleteHrefAfterRemoval = useCallback((): boolean => {
    const href = pendingHrefAfterBackRef.current;
    if (!href) return false;
    if (isLeaveGuardHistoryState(window.history.state)) return false;
    pendingHrefAfterBackRef.current = null;
    pendingRemovalRef.current = false;
    bypassRef.current = false;
    guardActiveRef.current = false;
    router.replace(href);
    return true;
  }, [router]);

  const tryCompleteExitCreate = useCallback((): boolean => {
    const createPath = pendingExitCreatePathRef.current;
    if (!createPath) return false;
    if (window.location.pathname === createPath) return false;
    pendingExitCreatePathRef.current = null;
    bypassRef.current = false;
    guardActiveRef.current = false;
    return true;
  }, []);

  const removeSentinel = useCallback(() => {
    if (!guardActiveRef.current) return;
    guardActiveRef.current = false;
    if (isLeaveGuardHistoryState(window.history.state)) {
      pendingRemovalRef.current = true;
      bypassRef.current = true;
      window.history.back();
    }
  }, []);

  // Long-lived listener: must outlive `enabled` toggles so removal popstates
  // are never dropped while the guard is temporarily disarmed.
  useEffect(() => {
    const onPopState = () => {
      if (pendingRemovalRef.current) {
        pendingRemovalRef.current = false;
        bypassRef.current = false;

        if (tryCompleteHrefAfterRemoval()) {
          return;
        }

        // Plain sentinel drop (progress cleared). Re-arm if progress returned.
        if (enabledRef.current) {
          pushSentinel();
        }
        return;
      }

      if (bypassRef.current) {
        bypassRef.current = false;
        if (tryCompleteExitCreate()) return;
        return;
      }

      if (tryCompleteExitCreate()) return;

      if (!enabledRef.current) return;

      // User Back while armed: re-assert sentinel and confirm.
      guardActiveRef.current = false;
      pushSentinel();
      pendingRef.current = { kind: "back" };
      setOpen(true);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [pushSentinel, tryCompleteExitCreate, tryCompleteHrefAfterRemoval]);

  // Arm / disarm the sentinel from draft progress.
  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      pendingRef.current = null;
      removeSentinel();
      return;
    }

    // Removal already finished while we were disabled (listener consumed it, or
    // history moved off the guard without us). Clear a stale flag and arm.
    if (pendingRemovalRef.current && !isLeaveGuardHistoryState(window.history.state)) {
      pendingRemovalRef.current = false;
      bypassRef.current = false;
    }

    if (!pendingRemovalRef.current) {
      ensureSentinel();
    }
    // If removal is still in flight, the long-lived listener will push once
    // that popstate arrives (and enabledRef is true).

    return () => {
      removeSentinel();
    };
  }, [enabled, ensureSentinel, removeSentinel]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      if (
        bypassRef.current ||
        pendingRemovalRef.current ||
        !enabledRef.current
      ) {
        return;
      }
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "" && anchor.target !== "_self") {
        return;
      }

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr) return;

      const blocked = shouldBlockSameOriginNavigation(
        hrefAttr,
        window.location.href,
      );
      if (!blocked) return;

      event.preventDefault();
      event.stopPropagation();
      pendingRef.current = { kind: "href", href: blocked };
      setOpen(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled]);

  const onCancel = useCallback(() => {
    pendingRef.current = null;
    setOpen(false);
  }, []);

  const disarmForNavigation = useCallback(async () => {
    enabledRef.current = false;
    setOpen(false);
    pendingRef.current = null;
    removeSentinel();
    await waitUntilLeaveGuardCleared(2000);
  }, [removeSentinel]);

  const onConfirm = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setOpen(false);
    onDiscardRef.current();
    bypassRef.current = true;
    guardActiveRef.current = false;

    if (!pending) return;

    if (pending.kind === "href") {
      // Drop the sentinel, then replace the create entry once traversal lands.
      pendingHrefAfterBackRef.current = pending.href;
      if (isLeaveGuardHistoryState(window.history.state)) {
        pendingRemovalRef.current = true;
        window.history.back();
        // Poll until off the sentinel (popstate may have already run). Never
        // replace while still on the guard entry — that races history.back().
        const href = pending.href;
        const started = Date.now();
        const tick = () => {
          if (pendingHrefAfterBackRef.current !== href) return;
          if (tryCompleteHrefAfterRemoval()) return;
          if (Date.now() - started > 2000) {
            pendingHrefAfterBackRef.current = null;
            pendingRemovalRef.current = false;
            bypassRef.current = false;
            router.replace(href);
            return;
          }
          window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      } else {
        pendingHrefAfterBackRef.current = null;
        pendingRemovalRef.current = false;
        router.replace(pending.href);
      }
      return;
    }

    // Confirmed browser Back: leave create (sentinel + page). Fallback to
    // dashboard only after traversal has settled and we are still on create.
    const createPath = window.location.pathname;
    pendingExitCreatePathRef.current = createPath;
    window.history.go(-2);
    const started = Date.now();
    const tick = () => {
      if (pendingExitCreatePathRef.current !== createPath) return;
      if (tryCompleteExitCreate()) return;
      if (Date.now() - started > 2000) {
        pendingExitCreatePathRef.current = null;
        if (window.location.pathname === createPath) {
          router.replace("/admin");
        }
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }, [router, tryCompleteExitCreate, tryCompleteHrefAfterRemoval]);

  return { open, onConfirm, onCancel, disarmForNavigation };
}
