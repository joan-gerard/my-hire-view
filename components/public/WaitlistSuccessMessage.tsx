"use client";

import { motion } from "framer-motion";

/**
 * Shown after a successful waitlist signup. Fills the form column height and
 * centers the message to avoid layout shift.
 */
export function WaitlistSuccessMessage() {
  return (
    <div className="flex flex-col justify-center">
      <motion.div
        className="mx-auto w-full rounded-3xl text-white bg-black p-8 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
          aria-hidden
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-light tracking-wide ">
          You&apos;re on the list!
        </h3>
        <p className="mt-2 text-balance">
          Check your email for exclusive updates and be among the first to try
          MyHireView when we launch.
        </p>
      </motion.div>
    </div>
  );
}
