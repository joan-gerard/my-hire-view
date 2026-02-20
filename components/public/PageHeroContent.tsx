"use client";

import { staggerItem } from "@/lib/landing-animations";
import { motion } from "framer-motion";

export interface PageHeroContentProps {
  /** Main headline shown in the hero. */
  title: string;
  /** Supporting subtitle below the headline. */
  subtitle: string;
}

/**
 * Reusable hero content for marketing subpages (How it Works, Pricing, Blog).
 * Renders a centered title and subtitle with the same visual style and animations
 * as the home hero. Use as children of MarketingHero with variant="compact".
 */
export default function PageHeroContent({ title, subtitle }: PageHeroContentProps) {
  return (
    <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <motion.h1
          className="text-5xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-white text-balance"
          variants={staggerItem}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mx-auto max-w-2xl text-lg font-medium leading-normal text-white/90"
          variants={staggerItem}
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
}
