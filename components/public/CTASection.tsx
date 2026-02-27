"use client";

import {
  fadeUp,
  staggerContainer,
  staggerItem,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/** Unsplash: career success / ready to start theme (professional, aspirational). */
const CTA_IMAGE = "/solution-1-1.png";

/**
 * Final CTA section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Hero-style block with image, headline, copy, and scroll-to-form CTA.
 * Aligns with SolutionSection and ProblemSection: same container, rounded hero, overlay, typography.
 */
export default function CTASection() {
  return (
    <motion.section
      className="px-0 md:px-6 lg:px-10 2xl:px-12 pt-16 pb-10 lg:pb-16 max-w-5xl mx-auto"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <motion.div
        className="relative min-h-[350px] overflow-hidden md:rounded-2xl md:border md:border-(--foreground)/10"
        initial={fadeUp.initial}
        whileInView={fadeUp.whileInView}
        viewport={viewport}
        transition={fadeUp.transition}
      >
        <Image
          src={CTA_IMAGE}
          alt="Team collaboration and career success"
          fill
          className="object-cover object-top"
          sizes="(max-width: 1023px) 100vw, 1600px"
          priority={false}
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent pointer-events-none"
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 flex flex-col gap-2 justify-end p-8 2xl:p-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer.variants}
        >
          <motion.h2
            className="relative z-10 text-2xl 2xl:text-5xl text-balance font-light tracking-tight text-white sm:text-3xl lg:text-3xl xl:text-4xl max-w-2xl"
            variants={staggerItem}
          >
            Ready to Transform <br /> Your Job Search?
          </motion.h2>
          <motion.p
            className="relative z-10 text-lg leading-normal text-balance text-white/90 max-w-2xl"
            variants={staggerItem}
          >
            Join the waitlist now and be among the first to create applications
            that actually get noticed.
          </motion.p>
          <motion.div
            className="relative z-10 w-full max-w-md mt-2"
            variants={staggerItem}
          >
            <Link
              href="#early-access"
              className="flex items-center justify-center w-fit rounded-2xl bg-(--brand-accent-1)/90 hover:bg-(--brand-accent-1) text-white px-6 py-3 text-base xl:text-xl font-semibold backdrop-blur-md shadow-md transition focus:outline-none focus:ring-2 focus:ring-(--brand-accent-1) focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70"
            >
              Get Early Access
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
