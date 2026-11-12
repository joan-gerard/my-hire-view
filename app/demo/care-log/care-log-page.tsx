"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowButton,
  Eyebrow,
  SprigShell,
} from "../sprig-shared";
import DemoApplicationCard, {
  type DemoApplication,
  type DemoCardLayout,
} from "./DemoApplicationCard";

/** Placeholder applications — no API, mirrors the admin card's states/data. */
const DEMO_APPLICATIONS: DemoApplication[] = [
  {
    id: "demo-1",
    company: "Madira Ink",
    role: "Senior Product Designer",
    status: "active",
    viewed: true,
    createdLabel: "28.03.2023",
    viewCount: 128,
    downloadCount: 12,
    lastViewedLabel: "2 Apr, 14:20",
    linkEnding: "…/madira-ink-senior-product-designer",
    shareUrl: "https://myhireview.com/view/demo/madira-ink-senior-product-designer",
    cvMissing: false,
    profilePictureMissing: false,
  },
  {
    id: "demo-2",
    company: "Aperture Labs",
    role: "Backend Engineer",
    status: "active",
    viewed: false,
    createdLabel: "09.04.2023",
    viewCount: 0,
    downloadCount: 0,
    lastViewedLabel: null,
    linkEnding: "…/aperture-labs-backend-engineer",
    shareUrl: "https://myhireview.com/view/demo/aperture-labs-backend-engineer",
    cvMissing: false,
    profilePictureMissing: false,
  },
  {
    id: "demo-3",
    company: "Northwind Studio",
    role: "Frontend Engineer",
    status: "draft",
    viewed: false,
    createdLabel: "05.04.2023",
    viewCount: 0,
    downloadCount: 0,
    lastViewedLabel: null,
    linkEnding: "…/northwind-frontend-engineer",
    shareUrl: "https://myhireview.com/view/demo/northwind-frontend-engineer",
    cvMissing: true,
    profilePictureMissing: false,
  },
  {
    id: "demo-4",
    company: "Halcyon Labs",
    role: "Design Systems Lead",
    status: "archived",
    viewed: true,
    createdLabel: "11.02.2023",
    viewCount: 46,
    downloadCount: 5,
    lastViewedLabel: "19 Feb, 09:05",
    linkEnding: "…/halcyon-design-systems-lead",
    shareUrl: "https://myhireview.com/view/demo/halcyon-design-systems-lead",
    cvMissing: false,
    profilePictureMissing: true,
  },
  {
    id: "demo-5",
    company: "Brightwave",
    role: "Product Manager",
    status: "active",
    viewed: true,
    createdLabel: "22.03.2023",
    viewCount: 83,
    downloadCount: 9,
    lastViewedLabel: "30 Mar, 11:10",
    linkEnding: "…/brightwave-product-manager",
    shareUrl: "https://myhireview.com/view/demo/brightwave-product-manager",
    cvMissing: false,
    profilePictureMissing: false,
  },
  {
    id: "demo-6",
    company: "Monarch Interactive",
    role: "UX Researcher",
    status: "active",
    viewed: false,
    createdLabel: "12.04.2023",
    viewCount: 0,
    downloadCount: 0,
    lastViewedLabel: null,
    linkEnding: "…/monarch-interactive-ux-researcher",
    shareUrl: "https://myhireview.com/view/demo/monarch-interactive-ux-researcher",
    cvMissing: false,
    profilePictureMissing: true,
  },
  {
    id: "demo-7",
    company: "Vellum & Co",
    role: "Content Designer",
    status: "draft",
    viewed: false,
    createdLabel: "15.04.2023",
    viewCount: 0,
    downloadCount: 0,
    lastViewedLabel: null,
    linkEnding: "…/vellum-co-content-designer",
    shareUrl: "https://myhireview.com/view/demo/vellum-co-content-designer",
    cvMissing: false,
    profilePictureMissing: false,
  },
  {
    id: "demo-8",
    company: "Cindershore",
    role: "Mobile Engineer",
    status: "archived",
    viewed: true,
    createdLabel: "28.01.2023",
    viewCount: 71,
    downloadCount: 8,
    lastViewedLabel: "3 Feb, 16:40",
    linkEnding: "…/cindershore-mobile-engineer",
    shareUrl: "https://myhireview.com/view/demo/cindershore-mobile-engineer",
    cvMissing: false,
    profilePictureMissing: false,
  },
];

const ENTRIES = [
  {
    when: "Today · 08:12",
    who: "Mira · 4B",
    plant: "Lobby monstera",
    note: "Watered thoroughly. Leaves dusted. Soil still cool at 3cm.",
    tone: "lime" as const,
  },
  {
    when: "Yesterday · 19:40",
    who: "Joel · 2C",
    plant: "Third-floor ferns",
    note: "Misted only. Skipped the snake plant — still damp from Monday.",
    tone: "paper" as const,
  },
  {
    when: "Mon · 07:55",
    who: "Ana · 1A",
    plant: "Mailroom pothos",
    note: "Yellow tip on one vine. Tagged for Joel to check light.",
    tone: "pink" as const,
  },
  {
    when: "Sun · 16:20",
    who: "Sam · 5D",
    plant: "Terrace herbs",
    note: "Basil thirsty. Rosemary fine. Refilled the shared watering can.",
    tone: "paper" as const,
  },
] as const;

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="4" width="18" height="4" rx="1.5" />
      <rect x="3" y="10" width="18" height="4" rx="1.5" />
      <rect x="3" y="16" width="18" height="4" rx="1.5" />
    </svg>
  );
}

/**
 * Secondary Sprig page — denser UI chrome using the same marketing tokens.
 */
export function CareLogPage() {
  const [cardLayout, setCardLayout] = useState<DemoCardLayout>("grid");

  return (
    <SprigShell current="care-log" wide>
      <section className="sg-subhero" aria-labelledby="care-title">
        <div className="sg-wrap sg-subhero-grid">
          <div className="sg-subhero-copy">
            <Eyebrow>Product surface demo</Eyebrow>
            <h1 id="care-title">
              The <span className="sg-word-lime">care log</span> for 14 Willow
              Court
            </h1>
            <p>
              A subpage to push the style guide further: filters, entry list,
              and a deep aside — still lime/pink/ink, still Switzer headlines.
            </p>
            <div className="sg-hero-actions">
              <ArrowButton href="#entries" label="Jump to entries" tone="lime" />
              <ArrowButton href="/demo" label="Back to home" tone="dark" />
            </div>
          </div>
          <div className="sg-subhero-media">
            <Image
              src="/demo/hero-image-7.webp"
              alt="Indoor plants along a bright corridor"
              width={640}
              height={520}
              priority
            />
          </div>
        </div>
      </section>

      <section className="sg-log" id="entries" aria-labelledby="entries-title">
        <div className="sg-wrap">
          <div className="sg-log-toolbar">
            <h2 id="entries-title">This week’s handoffs</h2>
            <div className="sg-filters" role="group" aria-label="Filter entries">
              <button type="button" className="is-active">
                All
              </button>
              <button type="button">Watered</button>
              <button type="button">Misted</button>
              <button type="button">Flagged</button>
            </div>
          </div>

          <div className="sg-log-layout">
            <ol className="sg-log-list">
              {ENTRIES.map((entry) => (
                <li
                  key={`${entry.when}-${entry.plant}`}
                  className={`sg-log-entry sg-log-entry-${entry.tone}`}
                >
                  <div className="sg-log-meta">
                    <span>{entry.when}</span>
                    <span>{entry.who}</span>
                  </div>
                  <h3>{entry.plant}</h3>
                  <p>{entry.note}</p>
                </li>
              ))}
            </ol>

            <aside className="sg-log-aside">
              <div className="sg-log-aside-card">
                <Eyebrow>On duty</Eyebrow>
                <h3>Unit 4B · Mira</h3>
                <p>
                  Through Sunday. Next up: Joel (2C). Nudge sends Tuesday at
                  8am if nothing is logged.
                </p>
                <ArrowButton href="/demo#join" label="Invite a neighbor" tone="lime" />
              </div>
              <figure className="sg-log-aside-photo">
                <Image
                  src="/demo/hero-image-5.webp"
                  alt="Close-up of a leafy houseplant"
                  width={480}
                  height={360}
                />
                <figcaption>Lobby monstera · last watered today</figcaption>
              </figure>
            </aside>
          </div>
        </div>
      </section>

      <section className="sg-deep" aria-labelledby="tip-title">
        <div className="sg-wrap sg-deep-inner">
          <div>
            <Eyebrow>Building tip</Eyebrow>
            <h2 id="tip-title">
              Log the skip, not just the water.
            </h2>
            <p>
              Dark `--deep` band with mist body copy — useful for tips,
              announcements, or a second CTA without inventing new colors.
            </p>
          </div>
          <ArrowButton href="/demo#pricing" label="See plans" tone="lime" />
        </div>
      </section>

      <section className="sg-appcards" aria-labelledby="appcards-title">
        <div className="sg-wrap">
          <div className="sg-appcards-inner">
            <div className="sg-appcards-toolbar">
              <div className="sg-appcards-head">
                <Eyebrow>Card concept</Eyebrow>
                <h2 id="appcards-title">
                  Application card,{" "}
                  <span className="sg-word-lime">reimagined</span>
                </h2>
                <p>
                  A denser take on the admin application card — same data and
                  actions, dressed in the marketing style guide. Placeholder
                  data only. Toggle between grid and list.
                </p>
              </div>
              <div
                className="sg-appcards-layout"
                role="group"
                aria-label="Card layout"
              >
                <button
                  type="button"
                  className={cardLayout === "grid" ? "is-active" : undefined}
                  aria-pressed={cardLayout === "grid"}
                  onClick={() => setCardLayout("grid")}
                >
                  <GridIcon className="sg-appcards-layout-icon" />
                  Grid
                </button>
                <button
                  type="button"
                  className={cardLayout === "list" ? "is-active" : undefined}
                  aria-pressed={cardLayout === "list"}
                  onClick={() => setCardLayout("list")}
                >
                  <ListIcon className="sg-appcards-layout-icon" />
                  List
                </button>
              </div>
            </div>
            <div
              className={
                cardLayout === "list" ? "sg-appcards-list" : "sg-appcards-grid"
              }
            >
              {DEMO_APPLICATIONS.map((application) => (
                <DemoApplicationCard
                  key={application.id}
                  application={application}
                  layout={cardLayout}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </SprigShell>
  );
}
