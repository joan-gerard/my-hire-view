'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, viewport } from '@/lib/landing-animations';

const STEPS = [
  { number: 1, title: 'Create Your Application', description: 'Upload your CV, record a video pitch, and add your portfolio link.' },
  { number: 2, title: 'Share Your Link', description: 'Send your custom URL to recruiters via email, LinkedIn, or job applications.' },
  { number: 3, title: 'Track & Follow Up', description: 'See when recruiters view your application and follow up strategically.' },
];

/**
 * "How It Works" section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Three-step process: Create → Share → Track.
 */
export default function HowItWorksSection() {
  return (
    <motion.section
      className="bg-[var(--secondary-background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Stand Out in Three Simple Steps
        </h2>
        <motion.div
          className="mx-auto mt-10 max-w-md"
          initial={fadeUp.initial}
          whileInView={fadeUp.whileInView}
          viewport={viewport}
          transition={fadeUp.transition}
        >
          <Image
            src="/images/how-it-works.svg"
            alt=""
            width={480}
            height={120}
            className="w-full object-contain opacity-90"
          />
        </motion.div>
        <motion.div
          className="mt-12 grid gap-10 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer.variants}
        >
          {STEPS.map((step) => (
            <motion.div key={step.number} className="relative flex flex-col" variants={staggerItem}>
              <div className="flex flex-1 flex-col rounded-xl bg-[var(--background)] p-6 shadow-sm border border-[var(--foreground)]/10">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-lg font-bold text-[var(--brand-primary-text)]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-[var(--foreground)]/80">
                  {step.description}
                </p>
              </div>
              {step.number < STEPS.length && (
                <div className="absolute left-1/2 top-1/2 hidden h-0.5 w-full -translate-y-1/2 sm:block" aria-hidden>
                  <div className="mx-auto h-full w-1/2 bg-[var(--brand-primary)]/30" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
