/**
 * Pricing tiers for /pricing (E3-014).
 * Source of truth: docs/PRICING_AND_MEMBERSHIP.md §3.
 * Monthly and annual billing. Display amounts are USD until Stripe adaptive
 * presentment (E2); avoid “USD” in customer-facing sentences.
 */

export type PricingTierId = "free" | "pro" | "premium";

export type BillingInterval = "monthly" | "annual";

export interface PricingFeature {
  /** Short feature line shown on the card. */
  label: string;
  /** Optional explanation shown in a tooltip (replaces parenthetical asides). */
  tooltip?: string;
}

export interface PricingTierPrice {
  amountUsd: number;
  /** Displayed price label (customer-facing). */
  priceLabel: string;
  priceNote: string;
}

export interface PricingTier {
  id: PricingTierId;
  name: string;
  /** Short positioning line under the plan name. */
  tagline: string;
  prices: {
    monthly: PricingTierPrice;
    annual: PricingTierPrice;
  };
  /** ISO currency code for structured price (display is USD on /pricing today). */
  currency: "USD";
  /** When true, visually emphasize as the recommended paid plan. */
  highlighted: boolean;
  /** Primary CTA for this card (pre-launch → waitlist until E2 checkout). */
  cta: { label: string; href: string };
  features: readonly PricingFeature[];
}

/** Waitlist CTA shared by all tiers until billing (E2) ships. */
export const PRICING_WAITLIST_HREF = "/#early-access" as const;

const FREE_PRICE = {
  amountUsd: 0,
  priceLabel: "Free",
  priceNote: "No card required",
} as const satisfies PricingTierPrice;

const MONTHLY_PRICE_NOTE = "Billed monthly · Cancel anytime";

/** Shown on the Annual toggle (and monthly-view nudges) — vs paying monthly for a year. */
export const ANNUAL_SAVINGS_LABEL = "Save ~64%";

/**
 * Persuasive annual compare line for paid tiers when Monthly is selected.
 * Free returns null (no savings story).
 */
export function getAnnualNudge(tier: PricingTier): string | null {
  if (tier.id === "free") return null;
  const annual = tier.prices.annual;
  // Reuse the annual note’s effective monthly (e.g. "~$3.25/mo · Billed annually").
  const effectiveMo = annual.priceNote.split("·")[0]?.trim();
  if (!effectiveMo) return `${ANNUAL_SAVINGS_LABEL} at ${annual.priceLabel}`;
  return `${ANNUAL_SAVINGS_LABEL} — ${effectiveMo} at ${annual.priceLabel}`;
}

/**
 * Locked plan matrix: Free · Pro · Premium (monthly + annual).
 * See docs/PRICING_AND_MEMBERSHIP.md §3.
 */
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Build and share your first application pages, free.",
    prices: {
      monthly: FREE_PRICE,
      annual: FREE_PRICE,
    },
    currency: "USD",
    highlighted: false,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      { label: "Up to 3 applications" },
      {
        label: "Up to 5 primary CVs",
        tooltip:
          "Résumés in your reusable library. Free is primary-only — no per-role tailored uploads.",
      },
      {
        label: "Video pitch",
        tooltip:
          "Add a YouTube URL so recruiters can watch your pitch on the page.",
      },
      {
        label: "Private shareable link",
        tooltip:
          "Your public id is not derived from your name — no personal info in that URL segment.",
      },
      {
        label: "Basic analytics",
        tooltip: "View count, CV downloads, and when the page was last viewed.",
      },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Tailor your CV to every role, with room to grow.",
    prices: {
      monthly: {
        amountUsd: 9,
        priceLabel: "$9/mo",
        priceNote: MONTHLY_PRICE_NOTE,
      },
      annual: {
        amountUsd: 39,
        priceLabel: "$39/yr",
        priceNote: "~$3.25/mo · Billed annually",
      },
    },
    currency: "USD",
    highlighted: true,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      { label: "Everything in Free" },
      {
        label: "Primary + tailored CVs",
        tooltip:
          "Upload a one-off PDF for a single role when you need it. Optional — you can still use a primary CV.",
      },
      { label: "Up to 15 applications" },
      {
        label: "Analytics with per-view history",
        tooltip: "Basic metrics plus a timestamp log of individual views.",
      },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline:
      "Stand out with a branded link, deeper insight, and unlimited applications.",
    prices: {
      monthly: {
        amountUsd: 14,
        priceLabel: "$14/mo",
        priceNote: MONTHLY_PRICE_NOTE,
      },
      annual: {
        amountUsd: 59,
        priceLabel: "$59/yr",
        priceNote: "~$4.92/mo · Billed annually",
      },
    },
    currency: "USD",
    highlighted: false,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      { label: "Everything in Pro" },
      {
        label: "Custom vanity public id",
        tooltip:
          "Branded URL such as /view/your-name/… instead of a random id.",
      },
      { label: "Unlimited applications" },
      {
        label: "Richer analytics",
        tooltip:
          "Duration, location, referrer, video engagement, export, and cross-application comparison.",
      },
      { label: "Up to 15 primary CVs" },
    ],
  },
] as const;

export function getTierPrice(
  tier: PricingTier,
  interval: BillingInterval,
): PricingTierPrice {
  return tier.prices[interval];
}

/** Note under the tier grid — checkout not live yet; plans/prices are set. */
export const PRICING_DRAFT_NOTE =
  "Launch prices above are set. Paid checkout ships with membership — join the waitlist for early access until then.";

/** FAQ for caps, lifecycle, and downgrades on /pricing. */
export const PRICING_FAQ = [
  {
    q: "What counts toward my application limit?",
    a: "Every application you have ever created that still exists — active and archived both count. Permanently deleting an application frees a slot. Archiving does not.",
  },
  {
    q: "What happens when I hit the Free or Pro limit?",
    a: "You cannot create another application until you upgrade, or permanently delete an existing one. We never auto-delete or auto-archive for you.",
  },
  {
    q: "Do I have to use a tailored CV on Pro or Premium?",
    a: "No. Tailored CVs are optional. You can still attach a primary CV from your library on any application.",
  },
  {
    q: "What if I downgrade later?",
    a: "Your existing applications stay accessible. You cannot create new ones while you are over the new plan’s cap. Leaving Premium reverts your public id from vanity back to the private opaque id.",
  },
] as const;
