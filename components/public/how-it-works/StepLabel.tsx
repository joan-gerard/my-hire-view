"use client";

import { motion } from "framer-motion";
import type { HowItWorksStep } from "./constants";

export interface StepLabelProps {
  step: HowItWorksStep;
  isActive: boolean;
  /** When true (section in view), label text is white; otherwise black. */
  isDarkMode?: boolean;
}

/**
 * Single step label for the sticky left column (e.g. "Create Your Application").
 * Highlights and animates when the corresponding card is in view.
 * Text is white in dark mode and black in regular mode.
 */
export function StepLabel({
  step,
  isActive,
  isDarkMode = false,
}: StepLabelProps) {
  const textClassName = isActive
    ? "text-black"
    : isDarkMode
      ? "text-black"
      : "text-black/90";

  console.log({ isActive });
  return (
    <motion.div
      className="flex items-center gap-3"
      animate={{
        scale: isActive ? 1.05 : 1,
        x: isActive ? 4 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span
        className={`text-lg font-light transition-colors duration-300 sm:text-2xl ${textClassName}`}
      >
        {step.title}
      </span>
      {isActive && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 24 }}
          className="inline-block h-0.5 flex-shrink-0 bg-black"
          aria-hidden
        />
      )}
    </motion.div>
  );
}
