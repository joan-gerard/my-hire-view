"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dailyLogoDotColor } from "@/lib/marketing/utils";

/**
 * Product / auth / view wordmark (Switzer via `#logo` in globals.css) + accent dot.
 * Live marketing `/` uses its own `.ot-logo` in components/marketing/Header.tsx — do not change that.
 */
function LogoMark({
  className,
  textClassName,
}: {
  className?: string;
  textClassName: string;
}) {
  const [dotColor, setDotColor] = useState("#9efc65");

  useEffect(() => {
    setDotColor(dailyLogoDotColor());
  }, []);

  return (
    <Link
      href="/"
      id="logo"
      className={`inline-flex items-end gap-[3px] rounded-sm text-xl font-medium leading-none tracking-[-0.02em] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${textClassName} ${className ?? ""}`}
      aria-label="MyHireView home"
    >
      <span>MyHireView</span>
      <span
        className="mb-[3px] h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden
      />
    </Link>
  );
}

export function LogoWhite() {
  return (
    <LogoMark
      textClassName="text-white"
      className="focus-visible:outline-white/80"
    />
  );
}

export function LogoBlack() {
  return (
    <LogoMark
      textClassName="text-[var(--ink)]"
      className="focus-visible:outline-[var(--ink)]"
    />
  );
}
