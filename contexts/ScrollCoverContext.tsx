"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const HEADER_HEIGHT_PX = 72;

export interface ScrollCoverContextValue {
  /** True when the top of ScrollCoverSection has scrolled past the top of the viewport (below the header). */
  scrollCoverReachedTop: boolean;
  /** Register the sentinel element at the top of ScrollCoverSection. Called with null on unmount. */
  setScrollCoverSentinelRef: (element: HTMLElement | null) => void;
}

const ScrollCoverContext = createContext<ScrollCoverContextValue | null>(null);

/**
 * Provides scroll-cover state so MarketingHeader can switch from transparent to white
 * when the user has scrolled and the ScrollCoverSection has reached the top of the viewport.
 * Uses Intersection Observer on a 1px sentinel; when the sentinel leaves the viewport top,
 * scrollCoverReachedTop becomes true.
 */
export function ScrollCoverProvider({ children }: { children: React.ReactNode }) {
  const [scrollCoverReachedTop, setScrollCoverReachedTop] = useState(false);
  const [sentinelRef, setSentinelRef] = useState<HTMLElement | null>(null);

  const setScrollCoverSentinelRef = useCallback((element: HTMLElement | null) => {
    setSentinelRef(element);
    if (!element) setScrollCoverReachedTop(false);
  }, []);

  useEffect(() => {
    if (!sentinelRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrollCoverReachedTop(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(sentinelRef);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const value = useMemo(
    () => ({ scrollCoverReachedTop, setScrollCoverSentinelRef }),
    [scrollCoverReachedTop, setScrollCoverSentinelRef]
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
