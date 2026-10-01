export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocumentCopy = {
  slug: "terms" | "privacy" | "cookies";
  title: string;
  eyebrow: string;
  summary: string;
  lastUpdatedLabel: string;
  /** Machine-readable date for `<time dateTime>` (YYYY-MM or YYYY-MM-DD). */
  lastUpdatedDateTime: string;
  sections: LegalSection[];
};

const DRAFT_NOTICE =
  "This page is draft copy for layout and branding review. It is not final legal advice and will be replaced before public launch.";

export const TERMS_COPY: LegalDocumentCopy = {
  slug: "terms",
  title: "Terms of Service",
  eyebrow: "Legal · Draft",
  summary:
    "These draft terms outline how you may use MyHireView while we prepare the product for public launch.",
  lastUpdatedLabel: "Last updated: October 2026 (draft)",
  lastUpdatedDateTime: "2026-10",
  sections: [
    {
      id: "draft",
      title: "Draft status",
      paragraphs: [DRAFT_NOTICE],
    },
    {
      id: "acceptance",
      title: "Acceptance of these terms",
      paragraphs: [
        "By creating an account or using MyHireView, you agree to these Terms of Service. If you do not agree, do not use the service.",
        "If you use MyHireView on behalf of an organization, you represent that you have authority to bind that organization.",
      ],
    },
    {
      id: "service",
      title: "The service",
      paragraphs: [
        "MyHireView lets candidates create personalized application pages that can include a CV, a short video pitch, and shareable links for recruiters.",
        "Features, plans, and limits may change as we build toward launch. We may add, remove, or modify functionality at any time.",
      ],
    },
    {
      id: "accounts",
      title: "Accounts",
      paragraphs: [
        "You are responsible for the accuracy of information you provide and for keeping your login credentials secure.",
        "You must be old enough to form a binding contract in your jurisdiction to use the service.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "You agree not to misuse MyHireView. That includes, without limitation:",
      ],
      bullets: [
        "Uploading unlawful, harmful, or infringing content",
        "Attempting to access another user’s account or data without permission",
        "Interfering with the security, availability, or integrity of the service",
        "Using the service to spam, harass, or mislead recruiters or other users",
      ],
    },
    {
      id: "your-content",
      title: "Your content",
      paragraphs: [
        "You retain ownership of CVs, videos, profile details, and other materials you submit.",
        "You grant MyHireView a limited license to host, display, and process that content solely to operate the service you request (for example, showing a public application page to someone with the link).",
      ],
    },
    {
      id: "availability",
      title: "Availability and changes",
      paragraphs: [
        "We aim for reliable uptime but do not guarantee uninterrupted access. Maintenance, outages, and product changes may occur.",
        "We may update these terms. Material changes will be reflected on this page with an updated date. Continued use after changes become effective constitutes acceptance of the revised terms.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        "MyHireView is provided “as is” and “as available” during this draft period. We do not guarantee interview outcomes, recruiter responses, or employment results.",
        "To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, MyHireView and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or opportunities arising from your use of the service.",
        "Final liability caps and governing-law clauses will be completed with counsel before launch.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about these draft terms can be sent to the support channel listed on the site once it ships. Until then, treat this page as a placeholder for brand and structure only.",
      ],
    },
  ],
};

export const PRIVACY_COPY: LegalDocumentCopy = {
  slug: "privacy",
  title: "Privacy Policy",
  eyebrow: "Legal · Draft",
  summary:
    "This draft explains what information MyHireView may collect and how we intend to use it. Final policy copy will follow legal review.",
  lastUpdatedLabel: "Last updated: October 2026 (draft)",
  lastUpdatedDateTime: "2026-10",
  sections: [
    {
      id: "draft",
      title: "Draft status",
      paragraphs: [DRAFT_NOTICE],
    },
    {
      id: "scope",
      title: "Scope",
      paragraphs: [
        "This Privacy Policy applies to the MyHireView website and product, including candidate dashboards and public application pages.",
        "It does not cover third-party sites you link to from your profile or application (for example LinkedIn or portfolio sites).",
      ],
    },
    {
      id: "collect",
      title: "Information we collect",
      paragraphs: [
        "Depending on how you use the service, we may process:",
      ],
      bullets: [
        "Account details such as name, email address, and authentication data",
        "Profile information you choose to add (location, links, photo)",
        "Application content you upload (CVs, video pitches, company/role details)",
        "Usage and device data needed to operate, secure, and improve the product",
        "Cookies and similar technologies as described in our Cookies page",
      ],
    },
    {
      id: "use",
      title: "How we use information",
      paragraphs: [
        "We use personal data to provide and improve MyHireView, including authenticating you, hosting your application pages, showing view activity where enabled, preventing abuse, and communicating about the service.",
        "We do not sell your personal information.",
      ],
    },
    {
      id: "sharing",
      title: "Sharing",
      paragraphs: [
        "We use trusted processors (for example authentication, database, and file storage providers) to run the product. They process data on our instructions.",
        "Public application pages are designed to be reachable by anyone with the link. Do not publish sensitive information you are not willing to share with recipients of that link.",
        "We may disclose information if required by law or to protect the rights, safety, and integrity of users and the service.",
      ],
    },
    {
      id: "retention",
      title: "Retention",
      paragraphs: [
        "We keep account and application data while your account is active and as needed to operate the service.",
        "Retention rules for archived applications and deleted accounts will be finalized in product policy and reflected here before launch.",
      ],
    },
    {
      id: "rights",
      title: "Your choices and rights",
      paragraphs: [
        "Depending on where you live, you may have rights to access, correct, export, or delete personal data, or to object to certain processing.",
        "Account and content controls in the product are the primary way to update or remove information you control. Additional request channels will be documented when support tooling ships.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "We use industry-standard measures appropriate to a web application that stores CVs and profile data. No method of transmission or storage is perfectly secure.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: [
        "MyHireView is intended for adults seeking employment. We do not knowingly collect personal information from children.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Privacy questions can be directed to the support channel listed on the site once available. This draft exists so links from the marketing and application footers resolve to branded pages.",
      ],
    },
  ],
};

export const COOKIES_COPY: LegalDocumentCopy = {
  slug: "cookies",
  title: "Cookies Policy",
  eyebrow: "Legal · Draft",
  summary:
    "This draft describes how MyHireView expects to use cookies and similar technologies. Final wording will be confirmed before launch.",
  lastUpdatedLabel: "Last updated: October 2026 (draft)",
  lastUpdatedDateTime: "2026-10",
  sections: [
    {
      id: "draft",
      title: "Draft status",
      paragraphs: [DRAFT_NOTICE],
    },
    {
      id: "what",
      title: "What cookies are",
      paragraphs: [
        "Cookies are small text files stored on your device when you visit a website. Similar technologies include local storage and session tokens used by modern web apps.",
      ],
    },
    {
      id: "how",
      title: "How we use them",
      paragraphs: [
        "MyHireView uses cookies and similar technologies to keep you signed in, protect accounts, remember preferences, measure product reliability, and—where enabled—support analytics that help us improve the experience.",
      ],
    },
    {
      id: "types",
      title: "Types we may use",
      paragraphs: ["Categories we expect to rely on:"],
      bullets: [
        "Essential — authentication, security, and core product functionality",
        "Preferences — remembering UI choices such as dismissed onboarding tips",
        "Analytics — aggregated usage signals to understand what works (if enabled)",
        "View-tracking helpers — short-lived tokens that reduce double-counting of public page views",
      ],
    },
    {
      id: "manage",
      title: "Managing cookies",
      paragraphs: [
        "Most browsers let you block or delete cookies. Blocking essential cookies may prevent sign-in or break parts of the product.",
        "Where a consent banner or preference center is required by law, we will add it before public launch and update this page accordingly.",
      ],
    },
    {
      id: "third-parties",
      title: "Third parties",
      paragraphs: [
        "Infrastructure and analytics providers may set their own cookies when we use their services. Their policies apply to those technologies.",
      ],
    },
    {
      id: "updates",
      title: "Updates",
      paragraphs: [
        "We may update this Cookies Policy as the product and legal requirements evolve. The “Last updated” line at the top of the page will change when we do.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about cookies can go to the support channel on the site once it ships. Until then, this page is a branded placeholder with draft substance.",
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS = [TERMS_COPY, PRIVACY_COPY, COOKIES_COPY] as const;
