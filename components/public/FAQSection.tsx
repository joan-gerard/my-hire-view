'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem, viewport } from '@/lib/landing-animations';

const FAQ_ITEMS = [
  {
    q: 'When will MyHireView launch?',
    a: "We're launching in Q2 2026. Early signups will be notified first and receive exclusive launch benefits.",
  },
  {
    q: 'Will MyHireView be free?',
    a: "Yes! We'll have a free tier that lets you create applications with core features. Premium plans with advanced analytics and unlimited applications will also be available.",
  },
  {
    q: 'Do recruiters need to create an account to view my application?',
    a: 'No! Recruiters can view your application with just a link – no login required. This makes it effortless for them to engage with your content.',
  },
  {
    q: 'What if I don\'t want to record a video?',
    a: 'Video is optional but highly recommended. Our data shows applications with video pitches get 3x more engagement.',
  },
] as const;

/**
 * FAQ section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 */
export default function FAQSection() {
  return (
    <motion.section
      className="bg-[var(--background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--brand-text)] sm:text-4xl">
          Common Questions
        </h2>
        <motion.dl
          className="mt-12 space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer.variants}
        >
          {FAQ_ITEMS.map((item, index) => (
            <motion.div key={index} variants={staggerItem}>
              <dt className="text-lg font-semibold text-[var(--brand-text)]">
                {item.q}
              </dt>
              <dd className="mt-2 text-[var(--brand-text)]/90">
                {item.a}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </motion.section>
  );
}
