"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const HEADER_HEIGHT_PX = 72;

export interface ScrollCoverContextValue {
  /**
   * True when the marketing header should use the solid (scrolled) treatment.
   * On home: true once ScrollCoverSection has reached the top of the viewport.
   * On other marketing routes: always true (no fixed hero).
   */
  scrollCoverReachedTop: boolean;
  /** Register the sentinel element at the top of ScrollCoverSection. Called with null on unmount. */
  setScrollCoverSentinelRef: (element: HTMLElement | null) => void;
}

const ScrollCoverContext = createContext<ScrollCoverContextValue | null>(null);

/**
 * Provides scroll-cover state so MarketingHeader can switch from transparent to white
 * when the user has scrolled and the ScrollCoverSection has reached the top of the viewport.
 * Uses Intersection Observer on a 1px sentinel; when the sentinel leaves the viewport top,
 * home scroll state becomes true.
 *
 * On non-home marketing routes (e.g. `/pricing`) there is no fixed hero, so the exposed
 * value is always true — derived synchronously from the pathname so navigating from `/`
 * does not flash a transparent header for one paint before a useEffect runs.
 */
export function ScrollCoverProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  /** Home-only: whether ScrollCoverSection has reached the top. Ignored off-home. */
  const [homeScrollCoverReachedTop, setHomeScrollCoverReachedTop] =
    useState(false);
  const [sentinelRef, setSentinelRef] = useState<HTMLElement | null>(null);

  const setScrollCoverSentinelRef = useCallback(
    (element: HTMLElement | null) => {
      setSentinelRef(element);
      if (!element) {
        // Leaving home (or unmounting sentinel): reset for the next home visit.
        setHomeScrollCoverReachedTop(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isHome || !sentinelRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHomeScrollCoverReachedTop(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinelRef);
    return () => observer.disconnect();
  }, [isHome, sentinelRef]);

  // Non-home routes are always "solid" — must not wait for an effect after navigation.
  const scrollCoverReachedTop = isHome ? homeScrollCoverReachedTop : true;

  const value = useMemo(
    () => ({ scrollCoverReachedTop, setScrollCoverSentinelRef }),
    [scrollCoverReachedTop, setScrollCoverSentinelRef],
  );

  return (
    <ScrollCoverContext.Provider value={value}>
      {children}
    </ScrollCoverContext.Provider>
  );
}

export function useScrollCover(): ScrollCoverContextValue {
  const ctx = useContext(ScrollCoverContext);
  if (!ctx) {
    throw new Error("useScrollCover must be used within ScrollCoverProvider");
  }
  return ctx;
}
