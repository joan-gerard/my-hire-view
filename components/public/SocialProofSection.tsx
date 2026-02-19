'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp, viewport } from '@/lib/landing-animations';

const WAITLIST_COUNT = process.env.NEXT_PUBLIC_WAITLIST_COUNT ?? '500';

/**
 * Social proof placeholder for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Headline with waitlist count; optional beta testimonials.
 */
export default function SocialProofSection() {
  return (
    <motion.section
      className="bg-[var(--background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Join {WAITLIST_COUNT}+ Job Seekers on the Waitlist
        </h2>
        <p className="mt-4 text-lg text-[var(--foreground)]/80">
          Be part of a community that&apos;s rethinking how job applications work.
        </p>
        <motion.div
          className="mx-auto mt-8 flex justify-center"
          initial={fadeUp.initial}
          whileInView={fadeUp.whileInView}
          viewport={viewport}
          transition={fadeUp.transition}
        >
          <Image
            src="/images/waitlist-avatars.svg"
            alt=""
            width={200}
            height={48}
            className="h-12 w-auto object-contain opacity-90"
          />
        </motion.div>
        {/* Optional: add beta testimonials here when available */}
      </div>
    </motion.section>
  );
}
