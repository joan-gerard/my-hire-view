import { marketingAssetUrl } from "@/lib/marketing-assets";

const PARLEY = "https://parley-home.vercel.app/assets";

export const HERO_POSTER = "/hero-image.webp";
export const HERO_VIDEO = marketingAssetUrl("hero-video.mp4");

export const HIW_STEPS = [
  {
    label: "Create your application",
    video: marketingAssetUrl("step-1.mp4"),
    poster: "/solution-2.webp",
  },
  {
    label: "Share your link",
    video: marketingAssetUrl("step-2.mp4"),
    poster: "/hero-image.webp",
  },
  {
    label: "Track & follow up",
    video: marketingAssetUrl("step-3.mp4"),
    poster: "/remote-work-2.webp",
  },
] as const;

export const CHANNELS = [
  "LinkedIn",
  "Email",
  "Indeed",
  "Greenhouse",
  "Lever",
] as const;

export const SHARE_PLACES = [
  "LinkedIn",
  "Email",
  "Indeed",
  "Greenhouse",
  "Lever",
  "Workday",
  "Ashby",
  "Wellfound",
] as const;

export const WHY_CARDS = [
  {
    index: "01",
    title: "Inbox overflow",
    desc: "Your résumé gets lost in a sea of PDFs. A page with a video pitch is harder to skip — and easier to remember.",
    mosaic: `${PARLEY}/mosaic-a.png`,
    image: "/remote-work-2.webp",
    active: false,
  },
  {
    index: "02",
    title: "Six seconds",
    desc: "Recruiters spend about six seconds scanning a résumé. A 60–90 second pitch buys you a real introduction, not a skim.",
    mosaic: `${PARLEY}/mosaic-d.png`,
    image: "/solution-2.webp",
    active: true,
  },
  {
    index: "03",
    title: "No visibility",
    desc: "You have no idea if anyone opened the file. Basic analytics show views, CV downloads, and when they last looked.",
    mosaic: `${PARLEY}/mosaic-b.png`,
    image: "/hero-image.webp",
    active: false,
  },
  {
    index: "04",
    title: "Flat document",
    desc: "A PDF cannot show personality, passion, or how you communicate. Video is optional — and applications with it get 3× more engagement.",
    mosaic: `${PARLEY}/mosaic-c.png`,
    image: "/solution-1-1.webp",
    active: false,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I sent eighty applications last month. I still have no idea if a human opened a single one.",
    name: "Maya L.",
    role: "Product designer",
    avatar: `${PARLEY}/avatar-sophie.png`,
    avatar2x: `${PARLEY}/avatar-sophie@2x.png`,
  },
  {
    quote:
      "If a candidate sent me a ninety-second pitch instead of another PDF, they would already be on the shortlist.",
    name: "Daniel M.",
    role: "In-house recruiter",
    avatar: `${PARLEY}/avatar-daniel.png`,
    avatar2x: `${PARLEY}/avatar-daniel@2x.png`,
  },
  {
    quote:
      "Six seconds is generous. Most résumés never get a full first screen. I remember the people who make it easy.",
    name: "Priya S.",
    role: "Hiring manager",
    avatar: `${PARLEY}/avatar-emily.png`,
  },
  {
    quote:
      "I tailor my CV every time, then watch it disappear into an ATS. There is no second chance to show who I am.",
    name: "Jordan P.",
    role: "Software engineer",
    avatar: `${PARLEY}/avatar-paul.png`,
  },
  {
    quote:
      "The people who get interviews are not always the best on paper. They are the ones a recruiter can actually recall.",
    name: "Elena C.",
    role: "Career coach",
    avatar: `${PARLEY}/avatar-james.png`,
    avatar2x: `${PARLEY}/avatar-james@2x.png`,
  },
  {
    quote:
      "I do not need another job board. I need a page I can send that actually represents me.",
    name: "James R.",
    role: "Product manager",
    avatar: `${PARLEY}/avatar-james.png`,
    avatar2x: `${PARLEY}/avatar-james@2x.png`,
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "When will MyHireView launch?",
    a: "We're launching in Q2 2026. Early signups will be notified first and receive exclusive launch benefits — including three months of Pro free.",
  },
  {
    q: "Will MyHireView be free?",
    a: "Yes. The Free plan lets you create applications with core features — video pitch, a private shareable link, and basic analytics. Pro and Premium add tailored CVs, higher caps, and richer insight.",
  },
  {
    q: "Do recruiters need an account to view my application?",
    a: "No. Recruiters open your link and see the page — no login required. That keeps the path from email or LinkedIn as short as a PDF, with much more of you on it.",
  },
  {
    q: "What if I don't want to record a video?",
    a: "Video is optional but highly recommended. Applications with a 60–90 second pitch get 3× more engagement. You can ship the page with your CV first and add video later — the same link always shows the latest version.",
  },
  {
    q: "Can I create different applications for different jobs?",
    a: "Yes. Create a custom page for each role, each with its own shareable link. Tailor the CV, video pitch, and portfolio so recruiters see the most relevant version of you.",
  },
] as const;

export const PLANS = [
  {
    name: "Free",
    monthly: { amount: "0", period: "No card required" },
    annual: { amount: "0", period: "No card required" },
    desc: "Build and share your first application pages, free.",
    featured: false,
    features: [
      { label: "Up to 3 applications", on: true },
      { label: "Up to 5 primary CVs", on: true },
      { label: "Video pitch", on: true },
      { label: "Private shareable link", on: true },
      { label: "Basic analytics", on: true },
      { label: "Tailored CVs", on: false },
      { label: "Custom vanity id", on: false },
      { label: "Unlimited applications", on: false },
    ],
  },
  {
    name: "Pro",
    monthly: { amount: "9", period: "per month, billed monthly" },
    annual: { amount: "39", period: "~$3.25/mo · billed annually" },
    desc: "Tailor your CV to every role, with room to grow.",
    featured: true,
    features: [
      { label: "Everything in Free", on: true },
      { label: "Primary + tailored CVs", on: true },
      { label: "Up to 15 applications", on: true },
      { label: "Analytics with per-view history", on: true },
      { label: "Video pitch", on: true },
      { label: "Private shareable link", on: true },
      { label: "Early access at launch", on: true },
      { label: "Unlimited applications", on: false },
    ],
  },
  {
    name: "Premium",
    monthly: { amount: "14", period: "per month, billed monthly" },
    annual: { amount: "59", period: "~$4.92/mo · billed annually" },
    desc: "A branded link, deeper insight, and unlimited applications.",
    featured: false,
    features: [
      { label: "Everything in Pro", on: true },
      { label: "Custom vanity public id", on: true },
      { label: "Unlimited applications", on: true },
      { label: "Richer analytics", on: true },
      { label: "Up to 15 primary CVs", on: true },
      { label: "Video pitch", on: true },
      { label: "Private shareable link", on: true },
      { label: "Cross-application comparison", on: true },
    ],
  },
] as const;
