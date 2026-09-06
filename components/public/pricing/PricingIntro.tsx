"use client";

import {
  fadeUp,
  staggerContainer,
  staggerItem,
  transition,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";

/** Same brand still as home — compact band, not a full-viewport fixed hero. */
const INTRO_IMAGE = "/hero-image.jpg";

/**
 * Short brand intro for /pricing. Keeps homepage visual language (photo,
 * overlay, light type, teal accent) without delaying the tier comparison.
 * Uses mount animation (not whileInView) so above-the-fold content appears
 * immediately.
 */
export default function PricingIntro() {
  return (
    <motion.section
      className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-8 pb-4 lg:pt-10 lg:pb-6 max-w-[1700px] mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      aria-labelledby="pricing-page-heading"
    >
      <div className="relative min-h-[220px] sm:min-h-[260px] overflow-hidden rounded-2xl border border-(--foreground)/10">
        <Image
          src={INTRO_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 1023px) 100vw, 1600px"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/10 pointer-events-none"
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 flex flex-col justify-end gap-2 p-6 sm:p-8 2xl:p-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer.variants}
        >
          <motion.p
            className="relative z-10 text-sm font-semibold tracking-wide text-(--brand-accent-1)"
            variants={staggerItem}
          >
            Pricing
          </motion.p>
          <motion.h1
            id="pricing-page-heading"
            className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white text-balance max-w-2xl"
            variants={staggerItem}
          >
            Plans that grow with you
          </motion.h1>
          <motion.p
            className="relative z-10 text-base sm:text-lg leading-snug text-white/90 text-balance max-w-2xl"
            variants={staggerItem}
          >
            Start free. Unlock tailored CVs on Pro. Go Premium for branded
            links and richer insight.
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}
