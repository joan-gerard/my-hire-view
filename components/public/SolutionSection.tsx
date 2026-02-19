'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, viewport } from '@/lib/landing-animations';

const FEATURES = [
  {
    title: 'Video Pitch',
    description: 'Let recruiters see and hear you. Upload a 60–90 second video pitch to showcase your communication skills and personality.',
    Icon: VideoIcon,
  },
  {
    title: 'Smart Analytics',
    description: 'Know when recruiters view your application. Track engagement and follow up at the perfect time.',
    Icon: ChartIcon,
  },
  {
    title: 'Shareable Links',
    description: 'Create custom applications for each role with unique, professional URLs. No login required for recruiters.',
    Icon: LinkIcon,
  },
];

/**
 * "The Solution" section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Three-column feature grid: Video Pitch, Smart Analytics, Shareable Links.
 */
export default function SolutionSection() {
  return (
    <motion.section
      className="bg-[var(--background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Introducing MyHireView: Your Application, Elevated
          </h2>
        </div>
        <motion.div
          className="mx-auto mt-12 max-w-2xl"
          initial={fadeUp.initial}
          whileInView={fadeUp.whileInView}
          viewport={viewport}
          transition={fadeUp.transition}
        >
          <Image
            src="/images/solution-preview.svg"
            alt=""
            width={560}
            height={240}
            className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--secondary-background)] object-contain"
          />
        </motion.div>
        <motion.div
          className="mx-auto mt-12 grid max-w-4xl gap-10 lg:max-w-none lg:grid-cols-3 lg:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer.variants}
        >
          {FEATURES.map(({ title, description, Icon }) => (
            <motion.div key={title} className="flex flex-col" variants={staggerItem}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-[var(--brand-primary-text)]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
              <p className="mt-2 flex-1 text-[var(--foreground)]/80">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}
