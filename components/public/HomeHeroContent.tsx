"use client";

import { staggerItem } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { LogoWhite } from "../ui/Logo";

/**
 * Default hero content for the home (landing) page: logo, headline, subtitle, CTA.
 * Use inside LandingHero on the home route.
 */
export default function HomeHeroContent() {
  return (
    <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-9">
      <LogoWhite />
      <div className="flex flex-col items-center gap-2">
        <motion.h1
          className="text-5xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-white text-balance"
          variants={staggerItem}
        >
          Stand out. Get Seen.
        </motion.h1>
        <motion.p
          className="mx-auto max-w-2xl text-lg font-medium leading-normal text-white/90"
          variants={staggerItem}
        >
          Your Job Application Deserves More Than a PDF!
        </motion.p>
      </div>
      <motion.a
        href="#early-access"
        className="mt-8 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
        variants={staggerItem}
      >
        Get Early Access
      </motion.a>
    </div>
  );
}
