"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/marketing/constants";
import { dailyLogoDotColor } from "@/lib/marketing/utils";
import { scrollToHash } from "@/lib/smooth-scroll";
import { ArrowButton } from "./ArrowButton";

const SCROLL_DELTA = 6;
const TOP_REVEAL = 12;

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/** Resolve in-page hash from `#how` or `/#how` when already on `/`. */
function homeHashFromHref(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("#") && href.length > 1) return href;
  if (href.startsWith("/#") && href.length > 2) return href.slice(1);
  return null;
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dotColor, setDotColor] = useState<string | undefined>(undefined);
  const lastScrollY = useRef(0);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  useEffect(() => {
    setDotColor(dailyLogoDotColor());
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (menuOpenRef.current) {
          setHidden(false);
          lastScrollY.current = window.scrollY;
          return;
        }

        const y = window.scrollY;
        const delta = y - lastScrollY.current;

        if (y <= TOP_REVEAL) {
          setHidden(false);
        } else if (delta > SCROLL_DELTA) {
          setHidden(true);
        } else if (delta < -SCROLL_DELTA) {
          setHidden(false);
        }

        lastScrollY.current = y;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  function scrollHomeTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (typeof history !== "undefined" && history.pushState) {
      history.pushState(null, "", "/");
    }
  }

  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    if (isModifiedClick(event)) return;
    event.preventDefault();
    setMenuOpen(false);
    scrollHomeTop();
  }

  function handleHomeHashClick(event: MouseEvent<HTMLAnchorElement>) {
    const href = event.currentTarget.getAttribute("href");
    const hash = homeHashFromHref(href);
    if (!hash) return;
    // Only smooth-scroll when already on the homepage; otherwise let navigation happen.
    if (pathname !== "/") return;
    if (isModifiedClick(event)) return;

    event.preventDefault();
    const closingDrawer = menuOpen;
    setMenuOpen(false);

    const run = () => {
      scrollToHash(hash);
    };

    if (closingDrawer) {
      requestAnimationFrame(() => {
        requestAnimationFrame(run);
      });
    } else {
      run();
    }
  }

  return (
    <div
      className={`ot-header-shell${hidden ? " is-hidden" : ""}`}
      // Off-screen sticky header must not remain in the tab order.
      {...(hidden ? { inert: true } : {})}
    >
      <header className="ot-header">
        <Link className="ot-logo" href="/" onClick={handleLogoClick}>
          MyHireView
          <span
            className="ot-logo-dot"
            style={dotColor ? { backgroundColor: dotColor } : undefined}
            aria-hidden="true"
          />
        </Link>

        <nav className="ot-nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleHomeHashClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ot-header-end">
          <ArrowButton href="/login" label="Login" tone="dark" />
          <button
            type="button"
            className="ot-menu-btn"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="ot-drawer">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleHomeHashClick}
            >
              {item.label}
            </Link>
          ))}
          <ArrowButton href="/login" label="Login" tone="dark" />
        </div>
      ) : null}
    </div>
  );
}
