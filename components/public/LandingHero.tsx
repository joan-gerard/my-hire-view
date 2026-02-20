"use client";

import { staggerContainer, staggerItem } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { LogoWhite } from "../ui/Logo";

/**
 * Hero section for the pre-launch landing page.
 * Headline, value proposition, and hero image (traditional vs MyHireView) per LANDING_PAGE_BRIEF.
 */
export default function LandingHero() {
  return (
    <motion.section
      className="relative overflow-hidden h-screen"
      initial="hidden"
      animate="visible"
      variants={staggerContainer.variants}
    >
      <div className="px-4 py-12 sm:px-6 lg:px-8 lg:pb-8 lg:pt-24 h-full w-full">
        <div
          className="relative h-full w-full bg-cover bg-center bg-no-repeat rounded-3xl"
          style={{
            backgroundImage: "url('/images/pawel-czerwinski-2400-1600.jpg')",
          }}
          role="img"
          aria-label="Hero background"
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
            <HeroContent />
          </div>
          <ImageCreditTooltip />
        </div>
      </div>
    </motion.section>
  );
}

function HeroContent() {
  return (
    <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-9">
      <LogoWhite />
      <div className="flex flex-col items-center gap-2">
        <motion.h1
          className="text-5xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-white text-balance"
          variants={staggerItem}
        >
          Stand out. Get Seen.
        </motion.h1>
        <motion.p
          className="mx-auto max-w-2xl text-lg font-medium leading-normal text-white/90"
          variants={staggerItem}
        >
          Your Job Application Deserves More Than a PDF!
        </motion.p>
      </div>
      <motion.a
        href="#early-access"
        className="mt-8 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
        variants={staggerItem}
      >
        Get Early Access
      </motion.a>
    </div>
  );
}

function ImageCreditTooltip() {
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
        Photo by{" "}
        <a
          href="https://unsplash.com/@pawel_czerwinski"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto underline hover:text-white/90"
        >
          Pawel Czerwinski
        </a>
      </div>
    </div>
  );
}
