"use client";

import {
  ANNUAL_SAVINGS_LABEL,
  getAnnualNudge,
  getTierPrice,
  PRICING_DRAFT_NOTE,
  PRICING_TIERS,
  type BillingInterval,
  type PricingFeature,
  type PricingTier,
} from "@/components/public/pricing/constants";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { BILLING_OPTIONS } from "@/lib/marketing/constants";
import { withoutEmDash } from "@/lib/marketing/utils";
import { ArrowButton } from "./ArrowButton";

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
    <div className="ot-billing">
      <div
        role="radiogroup"
        aria-label="Billing interval"
        className="ot-billing-toggle"
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
              aria-label={
                isAnnual ? `Annual, ${ANNUAL_SAVINGS_LABEL}` : undefined
              }
              tabIndex={selected ? 0 : -1}
              ref={isAnnual ? annualRadioRef : monthlyRadioRef}
              onClick={() => selectOption(option.id)}
              onKeyDown={(event) => handleRadioKeyDown(event, option.id)}
              className={
                selected
                  ? "ot-billing-option is-selected"
                  : "ot-billing-option"
              }
            >
              {option.label}
              {isAnnual && (
                <span aria-hidden className="ot-billing-save">
                  {ANNUAL_SAVINGS_LABEL}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {value === "monthly" && (
        <p className="ot-billing-hint">
          {`Switch to annual and ${ANNUAL_SAVINGS_LABEL.toLowerCase()}`}
        </p>
      )}
    </div>
  );
}

function PricingFeatureText({ feature }: { feature: PricingFeature }) {
  if (!feature.tooltip) {
    return <span>{feature.label}</span>;
  }

  const tipId = `ot-pricing-tip-${feature.label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <span className="ot-price-feature-text">
      <span>{feature.label}</span>
      <button
        type="button"
        className="ot-price-tip-btn"
        aria-describedby={tipId}
        aria-label={`More about ${feature.label}`}
      >
        ?
      </button>
      <span id={tipId} role="tooltip" className="ot-price-tip">
        {feature.tooltip}
      </span>
    </span>
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
    <article
      className={
        isHighlighted ? "ot-price-card is-featured" : "ot-price-card"
      }
    >
      {isHighlighted && <span className="ot-price-badge">Recommended</span>}

      <header className="ot-price-header">
        <h3>{tier.name}</h3>
        <p>{tier.tagline}</p>
      </header>

      <div className="ot-price-amount">
        <p className="ot-price-value">{price.priceLabel}</p>
        <p className="ot-price-note">{price.priceNote}</p>
        {annualNudge && (
          <button
            type="button"
            className="ot-price-nudge"
            onClick={onSelectAnnual}
          >
            {withoutEmDash(annualNudge)}
          </button>
        )}
      </div>

      <ul className="ot-price-features" role="list">
        {tier.features.map((feature) => (
          <li key={feature.label}>
            <span className="ot-price-check" aria-hidden="true" />
            <PricingFeatureText feature={feature} />
          </li>
        ))}
      </ul>

      <ArrowButton
        href={tier.cta.href}
        label={tier.cta.label}
        tone={isHighlighted ? "lime" : "dark"}
        className="ot-price-cta"
      />
    </article>
  );
}

export function Pricing() {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("annual");
  const annualRadioRef = useRef<HTMLButtonElement>(null);
  const focusAnnualAfterNudgeRef = useRef(false);

  const selectAnnualAndFocusToggle = useCallback(() => {
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
      className="ot-pricing"
      id="pricing"
      aria-labelledby="pricing-title"
    >
      <div className="ot-wrap">
        <div className="ot-pricing-intro">
          <p className="ot-eyebrow">
            <i />
            Pricing
            <i />
          </p>
          <h2 id="pricing-title">Plans that grow with you</h2>
          <p>
            Start free. Unlock tailored CVs on Pro. Go Premium for branded links
            and richer insight.
          </p>
        </div>

        <BillingIntervalToggle
          value={billingInterval}
          onChange={setBillingInterval}
          annualRadioRef={annualRadioRef}
        />

        <div className="ot-pricing-grid">
          {PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.id}
              tier={tier}
              billingInterval={billingInterval}
              onSelectAnnual={selectAnnualAndFocusToggle}
            />
          ))}
        </div>

        <p className="ot-pricing-draft">{withoutEmDash(PRICING_DRAFT_NOTE)}</p>
      </div>
    </section>
  );
}
