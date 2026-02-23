"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface HeroEntranceContextValue {
  /** True once the hero video has finished its entrance (or immediately on non-home routes). */
  heroReady: boolean;
  /** Called by FixedBackgroundHero when its entrance animation completes. */
  setHeroReady: (ready: true) => void;
}

const HeroEntranceContext = createContext<HeroEntranceContextValue | null>(null);

/**
 * Provides hero entrance state so MarketingHeader and hero content can delay
 * their appearance until the hero video has reached its default dimensions.
 * - On "/": heroReady resets to false so the header (and hero content) wait for
 *   FixedBackgroundHero's entrance to complete; when navigating back to home
 *   from any route, the header animates in again.
 * - On other routes: heroReady is set to true immediately (no hero on those pages).
 */
export function HeroEntranceProvider({ children }: { children: React.ReactNode }) {
  const [heroReady, setHeroReadyState] = useState(false);
  const pathname = usePathname();

  const setHeroReady = useCallback((ready: true) => {
    setHeroReadyState(ready);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      setHeroReadyState(false);
    } else {
      setHeroReadyState(true);
    }
  }, [pathname]);

  const value = useMemo(
    () => ({ heroReady, setHeroReady }),
    [heroReady, setHeroReady],
  );

  return (
    <HeroEntranceContext.Provider value={value}>
      {children}
    </HeroEntranceContext.Provider>
  );
}

export function useHeroEntrance(): HeroEntranceContextValue {
  const ctx = useContext(HeroEntranceContext);
  if (!ctx) {
    throw new Error("useHeroEntrance must be used within HeroEntranceProvider");
  }
  return ctx;
}
