'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, viewport } from '@/lib/landing-animations';

/**
 * "The Problem" section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Explains why traditional resumes fall short.
 */
export default function ProblemSection() {
  const icons = [
    { Icon: InboxIcon, label: 'Inbox overflow' },
    { Icon: StopwatchIcon, label: '6 seconds' },
    { Icon: QuestionIcon, label: 'No visibility' },
    { Icon: DocumentIcon, label: 'Flat document' },
  ];

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
          Still Sending the Same Old Resume?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground)]/90">
          Your resume gets lost in a sea of PDFs. Recruiters spend 6 seconds scanning it. You have no idea if anyone even opened it. And there&apos;s no way to show your personality, passion, or communication skills that matter most for the job.
        </p>
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12"
          aria-hidden
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer.variants}
        >
          {icons.map(({ Icon, label }) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-2 text-[var(--foreground)]/70"
              variants={staggerItem}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)]">
                <Icon className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.75V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.5m-19.5 0V6a2.25 2.25 0 012.25-2.25h15A2.25 2.25 0 0121.75 6v4.5" />
    </svg>
  );
}

function StopwatchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
