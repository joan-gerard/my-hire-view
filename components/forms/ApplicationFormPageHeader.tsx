"use client";

import { useLayoutEffect, useRef } from "react";

type ApplicationFormPageHeaderProps = {
  title: string;
  /** Stays under the admin header while the page scrolls. Split create/edit only. */
  sticky?: boolean;
};

/** Create/edit page title. */
export default function ApplicationFormPageHeader({
  title,
  sticky = false,
}: ApplicationFormPageHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (!sticky) return;
    const heading = headingRef.current;
    if (!heading) return;

    const sync = () => {
      document.documentElement.style.setProperty(
        "--application-page-title-height",
        `${Math.ceil(heading.getBoundingClientRect().height)}px`,
      );
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(heading);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(
        "--application-page-title-height",
      );
    };
  }, [sticky]);

  return (
    <h1
      ref={sticky ? headingRef : undefined}
      className={
        sticky
          ? "sticky top-[var(--admin-header-height,72px)] z-40 bg-[var(--white)]/95 py-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)] backdrop-blur-sm"
          : "font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]"
      }
    >
      {title}
    </h1>
  );
}
