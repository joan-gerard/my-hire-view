/**
 * Draft pricing tiers for /pricing (E3-014).
 * Source of truth: docs/PRICING_AND_MEMBERSHIP.md §3.
 * Price points and several numeric caps remain TBD — do not invent amounts here.
 */

export type PricingTierId = "free" | "pro" | "premium";

export interface PricingTier {
  id: PricingTierId;
  name: string;
  /** Short positioning line under the plan name. */
  tagline: string;
  /**
   * Displayed price label. Prices are not finalized; keep copy honest (TBA),
   * never a fabricated dollar amount.
   */
  priceLabel: string;
  priceNote: string;
  /** When true, visually emphasize as the recommended paid plan. */
  highlighted: boolean;
  /** Primary CTA for this card (pre-launch → waitlist). */
  cta: { label: string; href: string };
  features: readonly string[];
}

/** Waitlist CTA shared by all tiers until billing (E2) ships. */
export const PRICING_WAITLIST_HREF = "/#early-access" as const;

/**
 * Working plan matrix: Free · Pro · Premium.
 * Exact Pro/Premium application caps and Premium library size are TBD in the doc.
 */
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the product with a hard cap — primary CVs only.",
    priceLabel: "Free",
    priceNote: "No card required",
    highlighted: false,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      "Up to 3 applications",
      "Primary CVs only (no tailored workflow)",
      "Opaque shareable public link",
      "Basic analytics (views & CV downloads)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "The core unlock: CVs tailored to each role.",
    priceLabel: "TBA",
    priceNote: "Launch pricing coming soon",
    highlighted: true,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      "Everything in Free",
      "Primary + tailored CVs per application",
      "Higher application limit than Free",
      "Opaque shareable public link",
      "Basic analytics (views & CV downloads)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Branding, scale, and richer insight for serious applicants.",
    priceLabel: "TBA",
    priceNote: "Launch pricing coming soon",
    highlighted: false,
    cta: { label: "Join waitlist", href: PRICING_WAITLIST_HREF },
    features: [
      "Everything in Pro",
      "Custom vanity public id (e.g. /view/your-name/…)",
      "Higher or unlimited applications",
      "Richer analytics beyond view & download counts",
      "Larger primary CV library (optional raise above today’s max)",
    ],
  },
] as const;

/** Short note under the tier grid — caps/prices still open per the membership doc. */
export const PRICING_DRAFT_NOTE =
  "Plans reflect our working tier decisions. Exact Pro and Premium application caps, Premium library size, and price points are still being finalized before launch.";
