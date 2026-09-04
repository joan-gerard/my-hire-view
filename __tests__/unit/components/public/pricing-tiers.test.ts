import { describe, expect, it } from "vitest";
import {
  PRICING_DRAFT_NOTE,
  PRICING_TIERS,
  PRICING_WAITLIST_HREF,
} from "@/components/public/pricing/constants";

describe("pricing tier draft data (E3-014)", () => {
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

  it("does not invent paid price amounts while TBA", () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.priceLabel).not.toMatch(/[$€£]/);
      if (tier.id !== "free") {
        expect(tier.priceLabel).toBe("TBA");
      }
    }
  });

  it("routes all tier CTAs to the waitlist until billing ships", () => {
    expect(PRICING_WAITLIST_HREF).toBe("/#early-access");
    for (const tier of PRICING_TIERS) {
      expect(tier.cta.href).toBe(PRICING_WAITLIST_HREF);
    }
  });

  it("covers core matrix capabilities from the membership doc", () => {
    const free = PRICING_TIERS.find((t) => t.id === "free");
    const pro = PRICING_TIERS.find((t) => t.id === "pro");
    const premium = PRICING_TIERS.find((t) => t.id === "premium");

    expect(free?.features.some((f) => /3 applications/i.test(f))).toBe(true);
    expect(free?.features.some((f) => /primary cvs only/i.test(f))).toBe(true);

    expect(pro?.features.some((f) => /tailored/i.test(f))).toBe(true);

    expect(premium?.features.some((f) => /vanity/i.test(f))).toBe(true);
    expect(premium?.features.some((f) => /richer analytics/i.test(f))).toBe(
      true,
    );
  });

  it("includes a draft disclaimer for open caps and prices", () => {
    expect(PRICING_DRAFT_NOTE.length).toBeGreaterThan(40);
    expect(PRICING_DRAFT_NOTE.toLowerCase()).toMatch(/finaliz/);
  });
});
