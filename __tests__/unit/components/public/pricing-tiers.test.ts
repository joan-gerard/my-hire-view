import { describe, expect, it } from "vitest";
import {
  PRICING_DRAFT_NOTE,
  PRICING_FAQ,
  PRICING_TIERS,
  PRICING_WAITLIST_HREF,
} from "@/components/public/pricing/constants";

describe("pricing tier data (E3-014)", () => {
  it("exposes Free, Pro, and Premium in order", () => {
    expect(PRICING_TIERS.map((t) => t.id)).toEqual([
      "free",
      "pro",
      "premium",
    ]);
    expect(PRICING_TIERS.map((t) => t.name)).toEqual([
      "Free",
      "Pro",
      "Premium",
    ]);
  });

  it("highlights Pro as the recommended paid unlock", () => {
    const highlighted = PRICING_TIERS.filter((t) => t.highlighted);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]?.id).toBe("pro");
  });

  it("locks monthly prices for paid tiers", () => {
    const free = PRICING_TIERS.find((t) => t.id === "free");
    const pro = PRICING_TIERS.find((t) => t.id === "pro");
    const premium = PRICING_TIERS.find((t) => t.id === "premium");

    expect(free?.priceLabel).toBe("Free");
    expect(free?.amountUsd).toBe(0);
    expect(pro?.priceLabel).toBe("$9/mo");
    expect(pro?.amountUsd).toBe(9);
    expect(premium?.priceLabel).toBe("$19/mo");
    expect(premium?.amountUsd).toBe(19);
    expect(pro?.currency).toBe("USD");
    expect(premium?.currency).toBe("USD");
  });

  it("routes all tier CTAs to the waitlist until billing ships", () => {
    expect(PRICING_WAITLIST_HREF).toBe("/#early-access");
    for (const tier of PRICING_TIERS) {
      expect(tier.cta.href).toBe(PRICING_WAITLIST_HREF);
    }
  });

  it("covers locked matrix capabilities on each tier", () => {
    const free = PRICING_TIERS.find((t) => t.id === "free");
    const pro = PRICING_TIERS.find((t) => t.id === "pro");
    const premium = PRICING_TIERS.find((t) => t.id === "premium");

    const labels = (tier: typeof free) =>
      tier?.features.map((f) => f.label) ?? [];

    expect(labels(free).some((f) => /3 applications/i.test(f))).toBe(true);
    expect(labels(free).some((f) => /primary cvs only/i.test(f))).toBe(true);
    expect(labels(free).some((f) => /video pitch/i.test(f))).toBe(true);
    expect(labels(free).some((f) => /private shareable link/i.test(f))).toBe(
      true,
    );

    expect(labels(pro).some((f) => /everything in free/i.test(f))).toBe(true);
    expect(labels(pro).some((f) => /tailored/i.test(f))).toBe(true);
    expect(labels(pro).some((f) => /15 applications/i.test(f))).toBe(true);
    expect(labels(pro).some((f) => /per-view/i.test(f))).toBe(true);
    expect(labels(pro).some((f) => /private shareable link/i.test(f))).toBe(
      false,
    );

    expect(labels(premium).some((f) => /vanity/i.test(f))).toBe(true);
    expect(
      labels(premium).some((f) => /unlimited applications/i.test(f)),
    ).toBe(true);
    expect(labels(premium).some((f) => /15 primary/i.test(f))).toBe(true);
    expect(labels(premium).some((f) => /richer analytics/i.test(f))).toBe(true);
  });

  it("puts explanations in tooltips instead of parentheticals on labels", () => {
    for (const tier of PRICING_TIERS) {
      for (const feature of tier.features) {
        expect(feature.label).not.toMatch(/\(/);
        if (feature.tooltip) {
          expect(feature.tooltip.length).toBeGreaterThan(10);
        }
      }
    }
    const free = PRICING_TIERS.find((t) => t.id === "free");
    expect(
      free?.features.find((f) => /video pitch/i.test(f.label))?.tooltip,
    ).toMatch(/youtube/i);
  });

  it("includes video pitch on every tier", () => {
    for (const tier of PRICING_TIERS) {
      const hasVideo =
        tier.id === "free"
          ? tier.features.some((f) => /video pitch/i.test(f.label))
          : tier.features.some((f) =>
              /everything in (free|pro)/i.test(f.label),
            );
      expect(hasVideo).toBe(true);
    }
  });

  it("notes that checkout ships with membership", () => {
    expect(PRICING_DRAFT_NOTE.toLowerCase()).toMatch(/checkout|membership/);
    expect(PRICING_DRAFT_NOTE.toLowerCase()).toMatch(/waitlist/);
    expect(PRICING_DRAFT_NOTE).not.toMatch(/USD/i);
  });

  it("exposes FAQ copy for caps and downgrades", () => {
    expect(PRICING_FAQ.length).toBeGreaterThanOrEqual(4);
    expect(PRICING_FAQ.some((item) => /archived/i.test(item.a))).toBe(true);
    expect(PRICING_FAQ.some((item) => /downgrade/i.test(item.q))).toBe(true);
  });
});
