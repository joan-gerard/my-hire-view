/**
 * Data and configuration for the FAQ section.
 * Kept in a separate module so items can be reused (e.g. tests, docs) and
 * content can be updated in one place.
 */

export interface FAQItemData {
  q: string;
  a: string;
}

/** Decorative image shown next to the FAQ list. */
export const FAQ_IMAGE = "/customer-service-250x250.png";

export const FAQ_ITEMS: readonly FAQItemData[] = [
  {
    q: "When will MyHireView launch?",
    a: "We're launching in Q2 2026. Early signups will be notified first and receive exclusive launch benefits.",
  },
  {
    q: "Will MyHireView be free?",
    a: "Yes! We'll have a free tier that lets you create applications with core features. Premium plans with advanced analytics and unlimited applications will also be available.",
  },
  {
    q: "Do recruiters need to create an account to view my application?",
    a: "No! Recruiters can view your application with just a link – no login required. This makes it effortless for them to engage with your content.",
  },
  {
    q: "What if I don't want to record a video?",
    a: "Video is optional but highly recommended. Our data shows applications with video pitches get 3x more engagement.",
  },
  {
    q: "Can I create different applications for different jobs?",
    a: "Yes. You can create custom applications for each role, each with its own shareable link. Tailor your CV, video pitch, and portfolio link so recruiters see the most relevant version of you.",
  },
  {
    q: "What analytics will I see?",
    a: "You'll see when recruiters open your application, how they engage with it, and basic view metrics. Premium plans include advanced analytics so you can follow up at the right time.",
  },
  {
    q: "Is my application and data secure?",
    a: "Yes. We take security seriously. Your data is stored securely, and you control who can access your application via the links you share. You can update or revoke access when needed.",
  },
  {
    q: "Can I update my application after sharing the link?",
    a: "Yes. You can edit your CV, video, and details at any time. The same link will always show your latest version, so you don't need to resend it to recruiters.",
  },
  {
    q: "How long should my video pitch be?",
    a: "We recommend 60–90 seconds. That's enough to introduce yourself, highlight why you're a fit, and show your communication skills without overwhelming recruiters.",
  },
] as const;
