"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
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

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

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

  function handleHashClick(event: MouseEvent<HTMLAnchorElement>) {
    const href = event.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    // Keep browser defaults for new-tab / modified clicks.
    if (isModifiedClick(event)) return;

    event.preventDefault();
    const closingDrawer = menuOpen;
    setMenuOpen(false);

    const run = () => {
      scrollToHash(href);
    };

    if (closingDrawer) {
      // Wait until the drawer unmounts so its height is not in getBoundingClientRect math.
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
        <a className="ot-logo" href="#top" onClick={handleHashClick}>
          MyHireView
          <span
            className="ot-logo-dot"
            style={{ backgroundColor: dailyLogoDotColor() }}
            aria-hidden="true"
          />
        </a>

        <nav className="ot-nav" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} onClick={handleHashClick}>
              {item.label}
            </a>
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
            <a key={item.label} href={item.href} onClick={handleHashClick}>
              {item.label}
            </a>
          ))}
          <ArrowButton href="/login" label="Login" tone="dark" />
        </div>
      ) : null}
    </div>
  );
}
