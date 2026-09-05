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
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  ANNUAL_SAVINGS_LABEL,
  getAnnualNudge,
  getTierPrice,
  PRICING_DRAFT_NOTE,
  PRICING_TIERS,
  type BillingInterval,
  type PricingFeature,
  type PricingTier,
} from "./constants";

const BILLING_OPTIONS = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
] as const;

/**
 * Free · Pro · Premium comparison for /pricing.
 * Visual language matches SolutionSection: warm surface cards, light headlines,
 * teal accent CTAs. Sits directly under PricingIntro so tiers are early in view.
 */
export default function PricingTiersSection() {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("annual");
  const annualRadioRef = useRef<HTMLButtonElement>(null);
  const focusAnnualAfterNudgeRef = useRef(false);

  const selectAnnualAndFocusToggle = useCallback(() => {
    // Nudge buttons unmount when interval flips; restore focus on the Annual radio.
    focusAnnualAfterNudgeRef.current = true;
    setBillingInterval("annual");
  }, []);

  useLayoutEffect(() => {
    if (billingInterval !== "annual" || !focusAnnualAfterNudgeRef.current) {
      return;
    }
    focusAnnualAfterNudgeRef.current = false;
    annualRadioRef.current?.focus();
  }, [billingInterval]);

  return (
    <section
      id="pricing"
      className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-6 pb-6 lg:pt-8 lg:pb-8 max-w-[1700px] mx-auto"
      aria-label="Pricing plans"
    >
      <BillingIntervalToggle
        value={billingInterval}
        onChange={setBillingInterval}
        annualRadioRef={annualRadioRef}
      />

      <motion.div
        className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 lg:items-stretch"
        initial="hidden"
        animate="visible"
        variants={staggerContainer.variants}
      >
        {PRICING_TIERS.map((tier) => (
          <PricingTierCard
            key={tier.id}
            tier={tier}
            billingInterval={billingInterval}
            onSelectAnnual={selectAnnualAndFocusToggle}
          />
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

function BillingIntervalToggle({
  value,
  onChange,
  annualRadioRef,
}: {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  annualRadioRef: RefObject<HTMLButtonElement | null>;
}) {
  const monthlyRadioRef = useRef<HTMLButtonElement>(null);

  const focusOption = (interval: BillingInterval) => {
    const el =
      interval === "annual" ? annualRadioRef.current : monthlyRadioRef.current;
    el?.focus();
  };

  const selectOption = (interval: BillingInterval) => {
    onChange(interval);
    focusOption(interval);
  };

  const handleRadioKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentId: BillingInterval,
  ) => {
    const index = BILLING_OPTIONS.findIndex((o) => o.id === currentId);
    if (index < 0) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % BILLING_OPTIONS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + BILLING_OPTIONS.length) % BILLING_OPTIONS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = BILLING_OPTIONS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = BILLING_OPTIONS[nextIndex];
    if (next) selectOption(next.id);
  };

  return (
    <div className="mb-8 lg:mb-10 flex flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Billing interval"
        className="inline-flex rounded-2xl border border-(--foreground)/10 bg-[#fbfaf9] p-1"
      >
        {BILLING_OPTIONS.map((option) => {
          const selected = value === option.id;
          const isAnnual = option.id === "annual";
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              ref={isAnnual ? annualRadioRef : monthlyRadioRef}
              onClick={() => selectOption(option.id)}
              onKeyDown={(event) => handleRadioKeyDown(event, option.id)}
              className={
                selected
                  ? "relative inline-flex items-center justify-center rounded-xl bg-(--brand-accent-1) px-5 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent-1) focus-visible:ring-offset-2"
                  : "relative inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent-1) focus-visible:ring-offset-2"
              }
            >
              {option.label}
              {isAnnual && (
                <span
                  aria-hidden
                  className={
                    selected
                      ? "absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-(--brand-accent-1) shadow-sm"
                      : "absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/2 rounded-md bg-(--brand-accent-1) px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-white shadow-sm"
                  }
                >
                  {ANNUAL_SAVINGS_LABEL}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {value === "monthly" && (
        <p className="text-sm font-extralight text-(--brand-accent-2)">
          {`Switch to annual and ${ANNUAL_SAVINGS_LABEL.toLowerCase()}`}
        </p>
      )}
    </div>
  );
}

function PricingTierCard({
  tier,
  billingInterval,
  onSelectAnnual,
}: {
  tier: PricingTier;
  billingInterval: BillingInterval;
  onSelectAnnual: () => void;
}) {
  const isHighlighted = tier.highlighted;
  const price = getTierPrice(tier, billingInterval);
  const annualNudge =
    billingInterval === "monthly" ? getAnnualNudge(tier) : null;

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
          {price.priceLabel}
        </p>
        <p className="text-sm font-extralight text-foreground/60">
          {price.priceNote}
        </p>
        {annualNudge && (
          <button
            type="button"
            onClick={onSelectAnnual}
            className="mt-1 self-start text-left text-sm font-medium text-(--brand-accent-1) underline-offset-2 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent-1) focus-visible:ring-offset-2"
          >
            {annualNudge}
          </button>
        )}
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
    <span className="group relative flex w-full min-w-0 items-baseline gap-1.5 text-base font-extralight leading-snug text-foreground/85">
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
        className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 hidden w-max max-w-[min(100%,18rem)] rounded-md bg-(--foreground) px-2.5 py-1.5 text-xs font-normal leading-snug text-(--background) shadow-lg group-hover:block group-focus-within:block"
      >
        {feature.tooltip}
      </span>
    </span>
  );
}
