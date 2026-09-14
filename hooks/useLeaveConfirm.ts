"use client";

import { shouldBlockSameOriginNavigation } from "@/lib/utils/leave-confirm";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PendingLeave = { kind: "href"; href: string } | { kind: "back" };

/**
 * When `enabled`, intercept same-origin link clicks and browser Back, show a
 * confirm dialog, and only leave after `onDiscard` + confirm.
 * Refresh / tab close are intentionally not blocked (draft restore still helps).
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
  enabledRef.current = enabled;
  onDiscardRef.current = onDiscard;

  useEffect(() => {
    if (!enabled) return;

    const onPopState = () => {
      if (bypassRef.current || !enabledRef.current) return;
      window.history.pushState(
        { __mhvLeaveGuard: true },
        "",
        window.location.href,
      );
      pendingRef.current = { kind: "back" };
      setOpen(true);
    };

    window.history.pushState(
      { __mhvLeaveGuard: true },
      "",
      window.location.href,
    );
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled]);

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

    if (!pending) return;
    if (pending.kind === "href") {
      router.push(pending.href);
      return;
    }
    // Sentinel was re-pushed on popstate; go back past this page.
    window.history.go(-2);
  }, [router]);

  return { open, onConfirm, onCancel };
}
