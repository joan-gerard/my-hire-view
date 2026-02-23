"use client";

import { useHeroEntrance } from "@/contexts/HeroEntranceContext";
import { staggerContainer, staggerItem } from "@/lib/landing-animations";
import { animate, motion, MotionValue, useMotionValue, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface FixedBackgroundHeroProps {
  /** Main headline above the media. */
  title: string;
  /** Supporting text below the headline. */
  subtitle: string;
  /** Hero image URL (path or full URL). Used when videoSrc is not provided. */
  imageSrc?: string;
  /** Hero video URL (path or full URL). When provided, video is shown instead of image. */
  videoSrc?: string;
  /** Accessibility label for the image or video. */
  imageAlt?: string;
  /** Primary CTA: { label, href }. */
  primaryCta?: { label: string; href: string };
  /** Secondary CTA: { label, href }. */
  secondaryCta?: { label: string; href: string };
  /** Optional extra content below subtitle (e.g. custom CTA group). */
  children?: ReactNode;
}

export default function FixedBackgroundHero({
  title,
  subtitle,
  imageSrc,
  videoSrc,
  imageAlt = "Hero",
  primaryCta,
  secondaryCta,
  children,
}: FixedBackgroundHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const marginX = useTransform(scrollYProgress, [0, 1], [20, 56]);

  const { heroReady, setHeroReady } = useHeroEntrance();

  /** 0 on load → 1 after entrance animation; drives video "full viewport → default size" transition. */
  const loadProgress = useMotionValue(0);
  useEffect(() => {
    animate(loadProgress, 1, {
      duration: 1.2,
      ease: "easeOut",
      onComplete: () => setHeroReady(true),
    });
  }, [loadProgress, setHeroReady]);

  const mediaTop = useTransform(loadProgress, [0, 1], [0, 72]);
  const mediaBottom = useTransform(loadProgress, [0, 1], [0, 20]);
  const mediaMarginLeft = useTransform(
    [loadProgress, marginX],
    (values: number[]) => (values[0] < 1 ? 20 * values[0] : values[1]),
  );
  const mediaMarginRight = useTransform(
    [loadProgress, marginX],
    (values: number[]) => (values[0] < 1 ? 20 * values[0] : values[1]),
  );
  const mediaBorderRadius = useTransform(loadProgress, [0, 1], [0, 16]);

  const useVideo = Boolean(videoSrc);
  const mediaSrc = videoSrc ?? imageSrc;

  if (!mediaSrc) {
    throw new Error(
      "FixedBackgroundHero requires either videoSrc or imageSrc to be provided.",
    );
  }

  return (
    <section ref={sectionRef} className="relative">
      {/* Spacer: full viewport height so FixedBackgroundHero is not visible on load */}
      <div className="h-screen w-full" aria-hidden />

      {/* Fixed hero: fills viewport below header; video or image + content overlaid */}
      <div className="fixed left-0 right-0 top-0 z-0 h-screen">
        {/* Video or image: full area with horizontal padding (rounded), behind the content */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-0 right-0 overflow-hidden"
            style={{
              top: mediaTop,
              bottom: mediaBottom,
              marginLeft: mediaMarginLeft,
              marginRight: mediaMarginRight,
              borderRadius: mediaBorderRadius,
            }}
          >
            {useVideo ? (
              <video
                src={mediaSrc}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
                style={{ borderRadius: "inherit" }}
                aria-label={imageAlt}
              />
            ) : (
              <Image
                src={mediaSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                style={{ borderRadius: "inherit" }}
                sizes="100vw"
                priority
              />
            )}
            {/* Dark overlay on bottom half of video/image for content contrast */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"
              style={{ borderRadius: mediaBorderRadius }}
              aria-hidden
            />
          </motion.div>
        </div>

        {/* Content in front of the image: title, subtitle, CTAs; appears after video entrance, moves down slightly as user scrolls */}
        <FixedBackgroundHeroContent
          title={title}
          subtitle={subtitle}
          primaryCta={primaryCta}
          secondaryCta={secondaryCta}
          children={children}
          contentY={contentY}
          heroReady={heroReady}
        />
      </div>
    </section>
  );
}

interface FixedBackgroundHeroContentProps {
  title: string;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children?: ReactNode;
  contentY: MotionValue<number>;
  /** When true, hero video has finished its entrance; content can animate in. */
  heroReady: boolean;
}

function FixedBackgroundHeroContent({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  children,
  contentY,
  heroReady,
}: FixedBackgroundHeroContentProps) {
  return (
    <div className="relative z-1 flex h-full flex-col items-center justify-center px-0">
      <motion.div
        className="mx-auto max-w-3xl text-center flex flex-col items-center gap-4"
        initial="hidden"
        animate={heroReady ? "visible" : "hidden"}
        variants={staggerContainer.variants}
        style={{ y: contentY }}
      >
        <motion.h1
          className="font-heading text-white text-4xl sm:text-5xl lg:text-8xl font-bold tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] text-balance"
          variants={staggerItem}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-white text-lg sm:text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
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
                className="inline-flex items-center justify-center rounded-lg bg-black text-white px-6 py-3 text-base font-semibold text-(--brand-primary-text) shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:ring-offset-2 focus:ring-offset-white"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/90 px-6 py-3 text-base font-semibold backdrop-blur-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-(--foreground)/20 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                {secondaryCta.label}
              </Link>
            )}
            {children}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
