"use client";

import { staggerContainer, staggerItem } from "@/lib/landing-animations";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { ReactNode } from "react";

/** Optional credit for the hero image (e.g. photographer). */
export interface HowItWorksHeroImageCredit {
  label: string;
  href: string;
  name: string;
}

export interface HowItWorksHeroProps {
  /** Main headline above the image. */
  title: string;
  /** Supporting text below the headline. */
  subtitle: string;
  /** Hero image URL (path or full URL). */
  imageSrc: string;
  /** Accessibility label for the image. */
  imageAlt?: string;
  /** Optional image credit; when provided, a small attribution is shown. */
  imageCredit?: HowItWorksHeroImageCredit | null;
  /** Primary CTA: { label, href }. */
  primaryCta?: { label: string; href: string };
  /** Secondary CTA: { label, href }. */
  secondaryCta?: { label: string; href: string };
  /** Optional extra content below subtitle (e.g. custom CTA group). */
  children?: ReactNode;
}

/**
 * Hero for the How it Works page: content (heading, text, CTAs) above a
 * full-width image. On scroll, the image stays fixed and the next section
 * scrolls over it. Use a sibling section with HowItWorksScrollSection (or
 * bg + z-10) so content covers the fixed image.
 */
export default function HowItWorksHero({
  title,
  subtitle,
  imageSrc,
  imageAlt = "Hero",
  imageCredit = null,
  primaryCta,
  secondaryCta,
  children,
}: HowItWorksHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 72]);

  return (
    <section ref={sectionRef} className="relative">
      {/* Spacer: full viewport height so HowItWorksScrollSection is not visible on load */}
      <div className="h-screen w-full" aria-hidden />

      {/* Fixed hero: fills viewport below header; image + content overlaid */}
      <div className="fixed left-0 right-0 top-20 z-0 h-[calc(100vh-5rem)] px-4 sm:px-6 lg:px-8">
        {/* Image: full area with horizontal padding (rounded), behind the content */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
          {imageCredit && (
            <div className="pointer-events-auto absolute bottom-3 right-4 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white/90 backdrop-blur-sm">
              {imageCredit.label}{" "}
              <a
                href={imageCredit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                {imageCredit.name}
              </a>
            </div>
          )}
        </div>

        {/* Content in front of the image: title, subtitle, CTAs; moves down slightly as user scrolls */}
        <div className="relative z-1 flex h-full flex-col items-center justify-center px-0">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer.variants}
            style={{ y: contentY }}
          >
            <motion.h1
              className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              variants={staggerItem}
            >
              {title}
            </motion.h1>
            <motion.p
              className="mx-auto mt-4 max-w-2xl text-lg text-foreground/90 sm:text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              variants={staggerItem}
            >
              {subtitle}
            </motion.p>
            {(primaryCta ?? secondaryCta ?? children) && (
              <motion.div
                className="mt-8 flex flex-wrap items-center justify-center gap-4"
                variants={staggerItem}
              >
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center justify-center rounded-lg bg-(--brand-primary) px-6 py-3 text-base font-semibold text-(--brand-primary-text) shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:ring-offset-2 focus:ring-offset-white"
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/90 px-6 py-3 text-base font-semibold text-foreground backdrop-blur-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-(--foreground)/20 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
                {children}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
