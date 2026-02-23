"use client";

import { staggerContainer } from "@/lib/landing-animations";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Optional credit shown as a tooltip on the hero image (e.g. photographer). */
export interface HeroImageCredit {
  label: string;
  href: string;
  name: string;
}

/** "full" = full-height hero (e.g. home); "compact" = shorter hero (e.g. How it Works, Pricing, Blog). */
export type HeroVariant = "full" | "compact";

export interface LandingHeroProps {
  /** Background image URL (path or full URL). */
  backgroundImage: string;
  /** Accessibility label for the background image. */
  backgroundImageLabel?: string;
  /** Optional photographer/artist credit; when provided, a tooltip is shown. */
  imageCredit?: HeroImageCredit | null;
  /** Hero content (headline, subtitle, CTA, etc.) rendered centered over the image. */
  children: ReactNode;
  /** "full" = h-full (default, for /). "compact" = h-[35%] for subpages. */
  variant?: HeroVariant;
}

/**
 * Reusable full-height hero section with background image and centered content.
 * Use on the home page or on other marketing routes (How it Works, Pricing, Blog)
 * with different backgroundImage and children per route.
 */
export default function MarketingHero({
  backgroundImage,
  backgroundImageLabel = "Hero background",
  imageCredit = null,
  children,
  variant = "full",
}: LandingHeroProps) {
  return (
    <motion.section
      className={clsx(
        "relative overflow-hidden",
        variant === "full" ? "h-screen" : "h-auto",
      )}
      initial="hidden"
      animate="visible"
      variants={staggerContainer.variants}
    >
      <div
        className={clsx(
          "px-4 py-12 sm:px-6 lg:px-8 lg:pb-8 lg:pt-24 w-full",
          variant === "full" ? "h-full" : "h-auto",
        )}
      >
        <div
          className={clsx(
            "relative w-full bg-cover bg-center bg-no-repeat rounded-3xl",
            variant === "compact" ? "h-[35vh]" : "h-full",
          )}
          style={{ backgroundImage: `url(${backgroundImage})` }}
          role="img"
          aria-label={backgroundImageLabel}
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
            {children}
          </div>
          {imageCredit && (
            <HeroImageCreditTooltip
              label={imageCredit.label}
              href={imageCredit.href}
              name={imageCredit.name}
            />
          )}
        </div>
      </div>
    </motion.section>
  );
}

function HeroImageCreditTooltip({ label, href, name }: HeroImageCredit) {
  return (
    <div className="absolute bottom-3 right-4 group z-20">
      <button
        type="button"
        className="rounded-full px-2 py-0.5 text-xs text-white/90 hover:text-white bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
        aria-describedby="hero-photo-credit-tooltip"
      >
        !
      </button>
      <div
        id="hero-photo-credit-tooltip"
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 mb-1 hidden whitespace-nowrap rounded bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {label}{" "}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto underline hover:text-white/90"
        >
          {name}
        </a>
      </div>
    </div>
  );
}
