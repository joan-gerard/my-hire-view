"use client";

import { viewport } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import type { HowItWorksStep } from "./constants";

export interface StepCardProps {
  step: HowItWorksStep;
  index: number;
  cardRef: (el: HTMLDivElement | null) => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  /** When true, card is at full width/scale; when false, slightly narrowed. */
  inView: boolean;
}

/**
 * Single step card: video + description (title shown in sticky labels).
 * Animates width/scale based on viewport and triggers video ref for autoplay.
 */
export function StepCard({
  step,
  index,
  cardRef,
  videoRef,
  inView,
}: StepCardProps) {
  return (
    <motion.div
      ref={cardRef}
      className="mx-auto flex w-full max-w-full flex-col rounded-xl bg-gray-100 overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      animate={{
        maxWidth: inView ? "100%" : "95%",
        scale: inView ? 1 : 0.95,
      }}
      transition={{
        y: { duration: 0.4, delay: index * 0.05 },
        maxWidth: { duration: 0.9, ease: "easeInOut" },
        scale: { duration: 0.9, ease: "easeInOut" },
      }}
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        transformOrigin: "center center",
      }}
    >
      <div className="relative aspect-video w-full bg-blue-50 px-5 py-14 lg:px-12 lg:py-12">
        <video
          ref={videoRef}
          src={step.video}
          className="h-full w-full object-cover rounded-2xl"
          muted
          loop
          playsInline
          aria-label={step.title}
        />
      </div>
      <div className="p-5 lg:p-8">
        <p className="text-black text-lg font-light lg:text-xl">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}
