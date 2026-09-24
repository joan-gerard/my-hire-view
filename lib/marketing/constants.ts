export const NAV = [
  { label: "Home", href: "#top" },
  { label: "How to", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faq" },
] as const;

export const BILLING_OPTIONS = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
] as const;

export const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
] as const;

export const HERO_IMAGES = [
  { src: "/demo/hero-image-1.webp", width: 430 },
  { src: "/demo/hero-image-2.webp", width: 350 },
  { src: "/demo/hero-image-3.webp", width: 290 },
  { src: "/demo/hero-image-4.webp", width: 430 },
  { src: "/demo/hero-image-5.webp", width: 350 },
  { src: "/demo/hero-image-6.webp", width: 290 },
  { src: "/demo/hero-image-7.webp", width: 290 },
] as const;

export const PRINCIPLES = [
  {
    n: "01",
    title: "Video Pitch",
    body: "Let recruiters see and hear you. Upload a 60–90 second video pitch to showcase your communication skills and personality.",
  },
  {
    n: "02",
    title: "Smart Analytics",
    body: "Know when recruiters view your application. Track engagement and follow up at the perfect time.",
  },
  {
    n: "03",
    title: "Shareable Links",
    body: "Create custom applications for each role with unique, professional URLs. No login required for recruiters.",
  },
] as const;

/** Brand-adjacent accents; index advances once per UTC day. */
export const LOGO_DOT_COLORS = [
  "#9efc65",
  "#ffbcfc",
  "#7dd3c0",
  "#ffd36a",
  "#8ec5ff",
  "#ff8f6b",
] as const;
