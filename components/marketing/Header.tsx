"use client";

import { useState } from "react";
import { NAV } from "@/lib/marketing/constants";
import { dailyLogoDotColor } from "@/lib/marketing/utils";
import { ArrowButton } from "./ArrowButton";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="ot-header">
        <a className="ot-logo" href="#top">
          MyHireView
          <span
            className="ot-logo-dot"
            style={{ backgroundColor: dailyLogoDotColor() }}
            aria-hidden="true"
          />
        </a>

        <nav className="ot-nav" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.label} href={item.href}>
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
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <ArrowButton href="/login" label="Login" tone="dark" />
        </div>
      ) : null}
    </>
  );
}
