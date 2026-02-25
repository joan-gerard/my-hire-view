"use client";

import {
  staggerContainer,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { useState } from "react";
import { FAQContactCard } from "./FAQContactCard";
import { FAQItem } from "./FAQItem";
import { FAQ_ITEMS } from "./constants";

export interface FAQSectionProps {
  /** When true, section uses dark background and light text (e.g. when ProblemSection is in view). */
  isDarkMode?: boolean;
}

/**
 * FAQ section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Uses dark mode when isDarkMode is true (driven by ProblemSection visibility in landing layout).
 */
export function FAQSection({
  isDarkMode = false,
}: FAQSectionProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="mx-auto transition-colors duration-500 py-16"
      style={
        isDarkMode
          ? {
              backgroundColor: "#000",
              color: "#fff",
              ["--foreground" as string]: "#fff",
              ["--background" as string]: "#171717",
              ["--secondary-background" as string]: "#000",
            }
          : undefined
      }
    >
      <div className="mx-auto px-10 2xl:px-12 py-16 h-full max-w-[1700px] flex flex-col gap-10 2xl:gap-16">
        <h2 className="w-fit text-5xl 2xl:text-7xl font-extralight">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <FAQContactCard />
          <div className="flex flex-col gap-6 lg:col-span-2">
            <motion.dl
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={staggerContainer.variants}
            >
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem
                  key={index}
                  item={item}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                />
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  );
}
