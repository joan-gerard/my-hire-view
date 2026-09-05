/**
 * Pricing tiers for /pricing (E3-014).
 * Source of truth: docs/PRICING_AND_MEMBERSHIP.md §3.
 * Monthly billing only — no annual plans. Display amounts are USD until Stripe
 * adaptive presentment (E2); avoid “USD” in customer-facing sentences.
 */

export type PricingTierId = "free" | "pro" | "premium";

export interface PricingFeature {
  /** Short feature line shown on the card. */
  label: string;
  /** Optional explanation shown in a tooltip (replaces parenthetical asides). */
  tooltip?: string;
}

export interface PricingTier {
  id: PricingTierId;
  name: string;
  /** Short positioning line under the plan name. */
  tagline: string;
  /** Displayed price label (customer-facing). */
  priceLabel: string;
  priceNote: string;
  /** Numeric USD amount for future Stripe / adaptive presentment. */
  amountUsd: number;
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

const MONTHLY_PRICE_NOTE = "Billed monthly · Cancel anytime";

/**
 * Locked plan matrix: Free · Pro · Premium (monthly).
 * See docs/PRICING_AND_MEMBERSHIP.md §3.
 */
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the product with a hard cap — primary CVs only.",
    priceLabel: "Free",
    priceNote: "No card required",
    amountUsd: 0,
    currency: "USD",
    highlighted: false,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      { label: "Up to 3 applications" },
      {
        label: "Primary CVs only",
        tooltip:
          "Résumés in your library that you can reuse across applications. No per-role tailored uploads on Free.",
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
    tagline: "The core unlock: CVs tailored to each role.",
    priceLabel: "$9/mo",
    priceNote: MONTHLY_PRICE_NOTE,
    amountUsd: 9,
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
    tagline: "Branding, scale, and richer insight for serious applicants.",
    priceLabel: "$19/mo",
    priceNote: MONTHLY_PRICE_NOTE,
    amountUsd: 19,
    currency: "USD",
    highlighted: false,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      { label: "Everything in Pro" },
      {
        label: "Custom vanity public id",
        tooltip: "Branded URL such as /view/your-name/… instead of a random id.",
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
