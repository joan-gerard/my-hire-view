"use client";

import { CheckIcon } from "@/components/admin/icons";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PRICING_DRAFT_NOTE,
  PRICING_TIERS,
  type PricingFeature,
  type PricingTier,
} from "./constants";

/**
 * Free · Pro · Premium comparison for /pricing.
 * Visual language matches SolutionSection: warm surface cards, light headlines,
 * teal accent CTAs. Sits directly under PricingIntro so tiers are early in view.
 */
export default function PricingTiersSection() {
  return (
    <section
      id="pricing"
      className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-6 pb-6 lg:pt-8 lg:pb-8 max-w-[1700px] mx-auto"
      aria-label="Pricing plans"
    >
      <motion.div
        className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 lg:items-stretch"
        initial="hidden"
        animate="visible"
        variants={staggerContainer.variants}
      >
        {PRICING_TIERS.map((tier) => (
          <PricingTierCard key={tier.id} tier={tier} />
        ))}
      </motion.div>

      <motion.p
        className="mt-8 lg:mt-10 mx-auto max-w-2xl text-center text-sm sm:text-base font-extralight leading-relaxed text-foreground/60"
        initial={fadeUp.initial}
        whileInView={fadeUp.whileInView}
        viewport={viewport}
        transition={fadeUp.transition}
      >
        {PRICING_DRAFT_NOTE}
      </motion.p>
    </section>
  );
}

function PricingTierCard({ tier }: { tier: PricingTier }) {
  const isHighlighted = tier.highlighted;

  return (
    <motion.article
      className={
        isHighlighted
          ? "relative flex flex-col gap-6 rounded-2xl bg-[#fbfaf9] p-6 md:p-8 2xl:p-10 ring-2 ring-(--brand-accent-1) shadow-[0_0_0_1px_rgba(13,148,136,0.12)]"
          : "relative flex flex-col gap-6 rounded-2xl bg-[#fbfaf9] p-6 md:p-8 2xl:p-10 border border-(--foreground)/10"
      }
      variants={staggerItem}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-6 inline-flex rounded-md bg-(--brand-accent-1) px-3 py-1 text-xs font-semibold tracking-wide text-white">
          Recommended
        </span>
      )}

      <header className="flex flex-col gap-2 pt-1">
        <h3 className="text-2xl xl:text-3xl font-light text-foreground">
          {tier.name}
        </h3>
        <p className="text-base xl:text-lg font-extralight leading-snug text-foreground/70 lg:min-h-[2.75em]">
          {tier.tagline}
        </p>
      </header>

      <div className="flex flex-col gap-1">
        <p className="text-4xl xl:text-5xl font-light tracking-tight text-foreground">
          {tier.priceLabel}
        </p>
        <p className="text-sm font-extralight text-foreground/60">
          {tier.priceNote}
        </p>
      </div>

      <ul className="flex flex-col gap-3 flex-1" role="list">
        {tier.features.map((feature) => (
          <li key={feature.label} className="flex gap-3 items-start">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--brand-accent-1)/15 text-(--brand-accent-1)"
              aria-hidden
            >
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <PricingFeatureText feature={feature} />
          </li>
        ))}
      </ul>

      <Link
        href={tier.cta.href}
        className={
          isHighlighted
            ? "mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-(--brand-accent-1) px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-(--brand-accent-2) focus:outline-none focus:ring-2 focus:ring-(--brand-accent-1) focus:ring-offset-2 focus:ring-offset-[#fbfaf9]"
            : "mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-(--brand-primary) px-6 py-3 text-base font-semibold text-(--brand-primary-text) shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:ring-offset-2 focus:ring-offset-[#fbfaf9]"
        }
      >
        {tier.cta.label}
      </Link>
    </motion.article>
  );
}

function PricingFeatureText({ feature }: { feature: PricingFeature }) {
  if (!feature.tooltip) {
    return (
      <span className="text-base font-extralight leading-snug text-foreground/85">
        {feature.label}
      </span>
    );
  }

  const tipId = `pricing-tip-${feature.label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <span className="group relative inline-flex max-w-full items-baseline gap-1.5 text-base font-extralight leading-snug text-foreground/85">
      <span>{feature.label}</span>
      <button
        type="button"
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-(--foreground)/25 text-[10px] font-semibold leading-none text-(--foreground)/55 transition hover:border-(--brand-accent-1) hover:text-(--brand-accent-1) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent-1) focus-visible:ring-offset-1"
        aria-describedby={tipId}
        aria-label={`More about ${feature.label}`}
      >
        ?
      </button>
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 hidden w-max max-w-[18rem] rounded-md bg-(--foreground) px-2.5 py-1.5 text-xs font-normal leading-snug text-(--background) shadow-lg group-hover:block group-focus-within:block"
      >
        {feature.tooltip}
      </span>
    </span>
  );
}
