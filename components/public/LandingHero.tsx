"use client";

import { staggerContainer, staggerItem } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Hero section for the pre-launch landing page.
 * Headline, value proposition, and hero image (traditional vs MyHireView) per LANDING_PAGE_BRIEF.
 */
export default function LandingHero() {
  return (
    <motion.section
      className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer.variants}
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          className="text-5xl font-medium tracking-tight leading-tight text-(--brand-text) sm:text-5xl lg:text-6xl text-balance"
          variants={staggerItem}
        >
          Your Job Application Deserves More Than a PDF
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-base leading-normal text-(--brand-text)/80"
          variants={staggerItem}
        >
          MyHireView transforms your resume into a dynamic, trackable experience
          with video pitches, analytics, and shareable links that make
          recruiters take notice. Launching soon.
        </motion.p>
        <motion.a
          href="#early-access"
          className="mt-8 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-(--brand-primary) text-white hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand-primary) border border-blue-400/50"
          variants={staggerItem}
        >
          Get Early Access
        </motion.a>
        <motion.div
          className="mx-auto mt-12 max-w-3xl"
          aria-hidden
          variants={staggerItem}
        >
          <Image
            src="/images/hero-comparison.svg"
            alt=""
            width={640}
            height={320}
            className="w-full rounded-xl border border-white/10 bg-(--brand-surface)/50 object-contain"
            priority
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
