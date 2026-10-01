"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

export function RollLabel({ text }: { text: string }) {
  return (
    <span className="sg-roll">
      <span>{text}</span>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11 11"
      width="11"
      height="11"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M.72 9.78a.75.75 0 0 0 1.06 0l8.5-8.5A.75.75 0 1 0 9.22.22l-8.5 8.5a.75.75 0 0 0 0 1.06"
      />
      <path
        fill="currentColor"
        d="M9.75 10.5a.75.75 0 0 0 .75-.75v-9A.75.75 0 0 0 9.75 0h-9a.75.75 0 0 0 0 1.5H9v8.25c0 .414.336.75.75.75"
      />
    </svg>
  );
}

export function ArrowButton({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "dark" | "lime" | "ghost";
}) {
  const className = `sg-arrow-btn sg-arrow-btn-${tone}`;
  const inner = (
    <>
      <RollLabel text={label} />
      <span className="sg-arrow-btn-icon" aria-hidden="true">
        <ArrowIcon />
      </span>
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link className={className} href={href}>
        {inner}
      </Link>
    );
  }

  return (
    <a className={className} href={href}>
      {inner}
    </a>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="sg-eyebrow">
      <i />
      {children}
      <i />
    </p>
  );
}

function useHideHeaderOnScroll() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;

    const onScroll = () => {
      if (media.matches) {
        el.classList.remove("is-hidden");
        return;
      }
      const y = window.scrollY;
      if (y > lastY && y > 80) {
        el.classList.add("is-hidden");
      } else {
        el.classList.remove("is-hidden");
      }
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return ref;
}

const NAV = [
  { href: "/demo#story", label: "Who we are" },
  { href: "/demo#how", label: "How it works" },
  { href: "/demo#team", label: "Team" },
  { href: "/demo#pricing", label: "Pricing" },
  { href: "/demo/care-log", label: "Care log" },
] as const;

export function SprigHeader({ current }: { current?: "home" | "care-log" }) {
  const headerRef = useHideHeaderOnScroll();

  return (
    <header className="sg-header-shell" ref={headerRef}>
      <div className="sg-wrap sg-header">
        <Link className="sg-logo" href="/demo">
          Sprig
          <span className="sg-logo-dot" aria-hidden="true" />
        </Link>
        <nav className="sg-nav" aria-label="Primary">
          {NAV.map((item) => {
            const isCurrent =
              item.href === "/demo/care-log" && current === "care-log";
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sg-header-end">
          <Link className="sg-guide-link" href="/">
            MyHireView
          </Link>
          <ArrowButton
            href={current === "care-log" ? "/demo#join" : "#join"}
            label="Join"
            tone="dark"
          />
        </div>
      </div>
    </header>
  );
}

export function SprigFooter() {
  return (
    <footer className="sg-footer">
      <div className="sg-wrap sg-footer-grid">
        <div>
          <Link className="sg-logo" href="/demo">
            Sprig
            <span className="sg-logo-dot" aria-hidden="true" />
          </Link>
          <p className="sg-footer-blurb">
            Fictional plant-care co-op for demonstrating MyHireView’s marketing
            style guide. Not a real service.
          </p>
        </div>
        <div className="sg-footer-cols">
          <div>
            <p className="sg-footer-label">Pages</p>
            <Link href="/demo">Home</Link>
            <Link href="/demo/care-log">Care log</Link>
            <Link href="/demo#pricing">Pricing</Link>
          </div>
          <div>
            <p className="sg-footer-label">Style guide</p>
            <p>docs/STYLE_GUIDE_MARKETING.md</p>
            <Link href="/">Back to MyHireView</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SprigShell({
  current,
  children,
}: {
  current?: "home" | "care-log";
  children: ReactNode;
}) {
  return (
    <div className="sg-landing" id="top">
      <SprigHeader current={current} />
      <main>{children}</main>
      <SprigFooter />
    </div>
  );
}
