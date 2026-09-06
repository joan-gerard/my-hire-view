"use client";

import {
  fadeUp,
  staggerContainer,
  staggerItem,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { useState } from "react";
import { PRICING_FAQ } from "./constants";

/**
 * Caps, tailored CVs, and downgrade FAQ for /pricing.
 */
export default function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.section
      className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-4 pb-10 lg:pb-14 max-w-[1700px] mx-auto"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
      aria-labelledby="pricing-faq-heading"
    >
      <h2
        id="pricing-faq-heading"
        className="text-2xl sm:text-3xl font-light tracking-tight text-foreground text-balance mb-6 lg:mb-8 max-w-3xl"
      >
        How plans work
      </h2>
      <motion.dl
        className="mx-auto max-w-3xl flex flex-col gap-2"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer.variants}
      >
        {PRICING_FAQ.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `pricing-faq-panel-${index}`;
          const buttonId = `pricing-faq-button-${index}`;

          return (
            <motion.div
              key={item.q}
              className="rounded-2xl border border-(--foreground)/10 bg-[#fbfaf9] overflow-hidden"
              variants={staggerItem}
            >
              <dt>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base sm:text-lg font-medium text-foreground transition hover:bg-(--foreground)/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent-1) focus-visible:ring-inset"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <span
                    className="shrink-0 text-(--foreground)/50 text-xl leading-none"
                    aria-hidden
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </dt>
              <dd
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="px-5 pb-4 text-sm sm:text-base font-extralight leading-relaxed text-foreground/80"
              >
                {isOpen ? item.a : null}
              </dd>
            </motion.div>
          );
        })}
      </motion.dl>
    </motion.section>
  );
}
