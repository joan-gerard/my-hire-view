"use client";

import { shouldBlockSameOriginNavigation } from "@/lib/utils/leave-confirm";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PendingLeave = { kind: "href"; href: string } | { kind: "back" };

const GUARD_STATE = { __mhvLeaveGuard: true } as const;

function isGuardHistoryState(state: unknown): boolean {
  return (
    !!state &&
    typeof state === "object" &&
    (state as { __mhvLeaveGuard?: boolean }).__mhvLeaveGuard === true
  );
}

/**
 * When `enabled`, intercept same-origin link clicks and browser Back, show a
 * confirm dialog, and only leave after `onDiscard` + confirm.
 * Refresh / tab close are intentionally not blocked (draft restore still helps).
 *
 * Uses a single history sentinel: push once while armed, remove on disarm /
 * unmount, never stack duplicates when progress flickers.
 */
export function useLeaveConfirm(
  enabled: boolean,
  onDiscard: () => void,
): {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
} {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const enabledRef = useRef(enabled);
  const bypassRef = useRef(false);
  const pendingRef = useRef<PendingLeave | null>(null);
  const onDiscardRef = useRef(onDiscard);
  /** True while we believe our sentinel entry is on top of history. */
  const guardActiveRef = useRef(false);
  enabledRef.current = enabled;
  onDiscardRef.current = onDiscard;

  const removeSentinel = useCallback(() => {
    if (!guardActiveRef.current) return;
    guardActiveRef.current = false;
    // Only step back when the current entry is ours — avoids leaving the page
    // on Strict Mode remount or if history got out of sync.
    if (isGuardHistoryState(window.history.state)) {
      bypassRef.current = true;
      window.history.back();
      // Cleanup may have already removed the popstate listener that clears
      // bypassRef — drop it on the next microtask so a later re-arm works.
      queueMicrotask(() => {
        if (bypassRef.current && !guardActiveRef.current) {
          bypassRef.current = false;
        }
      });
    }
  }, []);

  const ensureSentinel = useCallback(() => {
    bypassRef.current = false;
    if (guardActiveRef.current && isGuardHistoryState(window.history.state)) {
      return;
    }
    window.history.pushState(GUARD_STATE, "", window.location.href);
    guardActiveRef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      pendingRef.current = null;
      removeSentinel();
      return;
    }

    // Re-arming after a disable must not inherit a stuck bypass from sentinel removal.
    bypassRef.current = false;

    const onPopState = () => {
      if (bypassRef.current) {
        bypassRef.current = false;
        return;
      }
      if (!enabledRef.current) return;

      // Browser already consumed the previous sentinel.
      guardActiveRef.current = false;
      ensureSentinel();
      pendingRef.current = { kind: "back" };
      setOpen(true);
    };

    ensureSentinel();
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      removeSentinel();
    };
  }, [enabled, ensureSentinel, removeSentinel]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      if (bypassRef.current || !enabledRef.current) return;
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

  const onConfirm = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setOpen(false);
    onDiscardRef.current();
    bypassRef.current = true;
    guardActiveRef.current = false;

    if (!pending) return;
    if (pending.kind === "href") {
      router.push(pending.href);
      return;
    }

    // After popstate + re-push we are on the sentinel. go(-2) leaves the page
    // when a prior entry exists; if create was the first history entry, fall
    // back to the admin dashboard so Back can still exit.
    const createPath = window.location.pathname;
    window.history.go(-2);
    window.setTimeout(() => {
      if (window.location.pathname === createPath) {
        router.replace("/admin");
      }
    }, 50);
  }, [router]);

  return { open, onConfirm, onCancel };
}
