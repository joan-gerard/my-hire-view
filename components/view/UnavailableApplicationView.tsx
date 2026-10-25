"use client";

import { LogoWhite } from "@/components/ui/Logo";
import {
  headerEntrance,
  staggerContainer,
  staggerItem,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ApplicationViewFooter from "./ApplicationViewFooter";

const BACKGROUND_IMAGE = "/hero-image.webp";

/**
 * Single recruiter-facing empty state for archived, draft, deleted, or
 * otherwise missing public application links. Intentional dark brand empty
 * state (not a marketing landing clone, not the live paper `/view` wash):
 * wordmark top bar, full-bleed atmosphere, light display type, lime+ink CTA,
 * compact dark footer.
 */
export default function UnavailableApplicationView() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ink)]">
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center px-4 md:px-6 lg:px-10"
        initial={headerEntrance.initial}
        animate={headerEntrance.animate}
        transition={headerEntrance.transition}
      >
        <LogoWhite />
      </motion.header>

      <section
        className="relative flex min-h-[100svh] flex-1 flex-col"
        aria-labelledby="unavailable-heading"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={BACKGROUND_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-[var(--ink)] via-[var(--ink)]/60 to-[var(--ink)]/30"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-[72px] sm:pb-20">
          <motion.div
            className="mx-auto flex w-full max-w-2xl flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer.variants}
          >
            <motion.h1
              id="unavailable-heading"
              className="font-heading text-3xl font-semibold tracking-tight text-[var(--white)] text-balance drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:text-4xl lg:text-5xl"
              variants={staggerItem}
            >
              This link doesn’t have an active application
            </motion.h1>

            <motion.p
              className="mt-4 max-w-xl text-base text-[var(--mist)] text-balance drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:text-lg"
              variants={staggerItem}
            >
              The candidate may have archived or removed this application, or
              there may be a typo in the URL.
            </motion.p>

            <motion.p
              className="mt-8 max-w-md text-sm text-white/65 text-balance sm:text-base"
              variants={staggerItem}
            >
              Candidates use MyHireView to share a CV and video pitch in one
              link.
            </motion.p>

            <motion.div
              className="mt-6 w-full max-w-[300px]"
              variants={staggerItem}
            >
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--lime)] px-6 py-3 text-base font-semibold text-[var(--ink)] shadow-md transition hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lime)] whitespace-nowrap"
              >
                See how candidates stand out
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ApplicationViewFooter variant="dark" />
    </div>
  );
}
