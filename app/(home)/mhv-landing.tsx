import {
  Faq,
  Hero,
  HowItWorks,
  MarketingShell,
  Pricing,
  Principles,
  Story,
} from "@/components/marketing";

export function MhvLanding() {
  return (
    <MarketingShell>
      <Hero />
      <Story />
      <Principles />
      <HowItWorks />
      <Pricing />
      <Faq />
    </MarketingShell>
  );
}
