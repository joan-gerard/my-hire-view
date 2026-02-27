"use client";

import { staggerItem } from "@/lib/landing-animations";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import type { FAQItemData } from "./constants";

export interface FAQItemProps {
  item: FAQItemData;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Single FAQ accordion item: question button and animated answer.
 * Uses semantic dt/dd and ARIA for accessibility.
 */
export function FAQItem({ item, index, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="border-b border-(--foreground)/10 overflow-hidden"
    >
      <dt>
        <motion.button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-6 px-5 text-left text-xl 2xl:text-2xl font-normal text-foreground"
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${index}`}
          id={`faq-question-${index}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <span>{item.q}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-(--foreground)/70"
            aria-hidden
          >
            <FiChevronDown className="h-5 w-5 2xl:h-6 2xl:w-6" />
          </motion.span>
        </motion.button>
      </dt>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.dd
            id={`faq-answer-${index}`}
            aria-labelledby={`faq-question-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 pt-0 text-(--foreground)/90 text-lg 2xl:text-xl font-light">
              {item.a}
            </p>
          </motion.dd>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
