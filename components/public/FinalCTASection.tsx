'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, viewport } from '@/lib/landing-animations';

/**
 * Final CTA section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Headline, copy, and scroll-to-form CTA.
 */
export default function FinalCTASection() {
  return (
    <motion.section
      className="bg-[var(--background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer.variants}
      >
        <motion.h2
          className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
          variants={staggerItem}
        >
          Ready to Transform Your Job Search?
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-[var(--foreground)]/80"
          variants={staggerItem}
        >
          Join the waitlist now and be among the first to create applications that actually get noticed.
        </motion.p>
        <motion.a
          href="#early-access"
          className="mt-8 inline-block rounded-lg bg-[var(--brand-primary)] px-8 py-4 text-lg font-semibold text-[var(--brand-primary-text)] shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          variants={staggerItem}
        >
          Get Early Access
        </motion.a>
      </motion.div>
    </motion.section>
  );
}
