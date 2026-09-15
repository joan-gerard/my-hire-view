import FixedBackgroundHero from "@/components/public/FixedBackgroundHero";
import LandingPageSections from "@/components/public/LandingPageSections";
import PreventOverscrollReveal from "@/components/public/PreventOverscrollReveal";
import ScrollCoverSection from "@/components/public/ScrollCoverSection";
import { marketingAssetUrl } from "@/lib/marketing-assets";

const HOME_HERO_IMAGE = "/hero-image.webp";
const HOME_HERO_IMAGE_CREDIT = {
  label: "Photo by",
  href: "https://unsplash.com/@pawel_czerwinski",
  name: "Pawel Czerwinski",
} as const;

/** R2 key under `marketing/`. Rename (new key) if the video file changes — see `lib/marketing-assets.ts`. */
const HERO_VIDEO = marketingAssetUrl("hero-video.mp4");

/**
 * Pre-launch "Coming Soon" landing page. Structure and copy follow docs/LANDING_PAGE_BRIEF.md.
 * MarketingHeader is rendered by (marketing)/layout.tsx.
 */
export default function Home() {
  return (
    <>
      <PreventOverscrollReveal />
      <FixedBackgroundHero
        title="Stand out. Get Seen."
        subtitle="Create your page, share your link, and get noticed by recruiters. Your personalized job application page in minutes."
        videoSrc={HERO_VIDEO}
        imageSrc={HOME_HERO_IMAGE}
        imageAlt="How it works hero"
        primaryCta={{ label: "Get Early Access", href: "#early-access" }}
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />

      <ScrollCoverSection>
        <LandingPageSections />
      </ScrollCoverSection>
    </>
  );
}
