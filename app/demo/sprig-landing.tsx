"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowButton,
  Eyebrow,
  SprigShell,
} from "./sprig-shared";

const GALLERY = [
  {
    src: "/demo/hero-image-1.webp",
    alt: "Sunlit indoor plant by a window",
    caption: "Lobby monstera · Floor 1",
  },
  {
    src: "/demo/hero-image-2.webp",
    alt: "Person tending a potted plant",
    caption: "Wednesday mist · Unit 2C",
  },
  {
    src: "/demo/hero-image-3.webp",
    alt: "Close-up of green leaves",
    caption: "New growth logged",
  },
  {
    src: "/demo/hero-image-4.webp",
    alt: "Apartment balcony greenery",
    caption: "Shared terrace pots",
  },
] as const;

const TEAM = [
  {
    name: "Mira Chen",
    role: "Co-founder · Ops",
    bio: "Former building manager who got tired of dead ferns and angry Slack threads.",
    src: "/demo/hero-image-5.webp",
  },
  {
    name: "Joel Okonkwo",
    role: "Co-founder · Product",
    bio: "Designs the care queue so nobody waters the same snake plant twice.",
    src: "/demo/hero-image-6.webp",
  },
  {
    name: "Ana Ruiz",
    role: "Community",
    bio: "Onboards new buildings and writes the care notes residents actually read.",
    src: "/demo/hero-image-7.webp",
  },
  {
    name: "Sam Patel",
    role: "Engineering",
    bio: "Builds the nudges, soil logs, and “who has the misting can” calendar.",
    src: "/demo/hero-image-2.webp",
  },
] as const;

const PLANS = [
  {
    name: "Seedling",
    price: "Free",
    note: "Per building",
    blurb: "Up to 8 plants and 6 neighbors. Perfect for a single hallway.",
    features: ["Plant map", "Weekly slots", "Basic nudges"],
    featured: false,
  },
  {
    name: "Canopy",
    price: "$29",
    note: "Per building / month",
    blurb: "Whole-building co-ops with moisture logs and handoff history.",
    features: [
      "Unlimited plants",
      "Care log history",
      "SMS / email nudges",
      "Guest caretaker invites",
    ],
    featured: true,
  },
  {
    name: "Grove",
    price: "$79",
    note: "Per campus / month",
    blurb: "Multi-building portfolios for property managers.",
    features: [
      "Everything in Canopy",
      "Multi-building admin",
      "Export for facilities",
    ],
    featured: false,
  },
] as const;

/**
 * Fake product landing that exercises docs/design/STYLE_GUIDE_MARKETING.md.
 * Sprig = apartment plant-care co-op (unrelated to MyHireView).
 */
export function SprigLanding() {
  return (
    <SprigShell current="home">
      <section className="sg-hero" aria-labelledby="sprig-hero-title">
        <div className="sg-wrap sg-hero-copy">
          <Eyebrow>Style guide demo · not a real product</Eyebrow>
          <h1 id="sprig-hero-title" className="sg-hero-title">
            <span className="sg-word-lime">Sprig</span>
            <span>keeps the</span>
            <span className="sg-word-pink">hallway fiddle-leaf</span>
            <span>alive while you</span>
            <span>travel.</span>
          </h1>
          <p className="sg-hero-support">
            A co-op for apartment buildings: neighbors claim watering slots,
            log soil moisture, and ping the next caretaker — no group chat
            chaos.
          </p>
          <div className="sg-hero-actions">
            <ArrowButton href="#join" label="Start a building" tone="lime" />
            <ArrowButton href="#how" label="See the loop" tone="dark" />
          </div>
        </div>

        <div className="sg-wrap sg-hero-visual">
          <div className="sg-hero-media">
            <Image
              src="/demo/hero-image-1.webp"
              alt="Lush indoor plants in a bright apartment hallway"
              width={1200}
              height={640}
              priority
              className="sg-hero-img"
            />
            <div className="sg-hero-caption">
              <p>Live from 14 Willow Court</p>
              <span>Unit 4B has the misting can this week</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sg-story" id="story" aria-labelledby="story-title">
        <div className="sg-wrap sg-story-grid">
          <div className="sg-story-copy">
            <Eyebrow>Who we are</Eyebrow>
            <h2 id="story-title">We started in one lobby that kept killing plants.</h2>
            <p>
              Sprig is a fictional company invented for this style-guide demo.
              The story pattern matches the marketing guide: left-aligned copy,
              muted body, and a visual side that feels like atmosphere — not a
              dashboard.
            </p>
            <p>
              Neighbors already care. They just need a quiet system for “who
              waters when,” so the building’s greenery survives holidays and
              lease turnovers.
            </p>
            <ArrowButton href="/demo/care-log" label="Peek the care log" tone="dark" />
          </div>
          <div className="sg-story-visual">
            <Image
              src="/demo/hero-image-3.webp"
              alt="Close detail of healthy green leaves"
              width={560}
              height={640}
              className="sg-story-img"
            />
            <div className="sg-story-stat sg-tile sg-tile-lime">
              <span>Buildings on the waitlist</span>
              <strong>128</strong>
            </div>
            <div className="sg-story-stat sg-story-stat-b sg-tile sg-tile-pink">
              <span>Avg. plants per floor</span>
              <strong>14</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="sg-how" id="how" aria-labelledby="how-title">
        <div className="sg-wrap">
          <div className="sg-how-intro">
            <Eyebrow>How it works</Eyebrow>
            <h2 id="how-title">Three steps. One shared watering can.</h2>
            <p>
              A sequenced section on purpose — numbered steps when the content
              really is a loop.
            </p>
          </div>
          <ol className="sg-steps">
            <li className="sg-step">
              <span className="sg-step-num" aria-hidden="true">
                1
              </span>
              <h3>Map the plants</h3>
              <p>
                Add each common-area plant with a floor tag and a care note
                (light, water, “leave me alone”).
              </p>
            </li>
            <li className="sg-step">
              <span className="sg-step-num" aria-hidden="true">
                2
              </span>
              <h3>Claim a slot</h3>
              <p>
                Neighbors pick a week. Sprig nudges the next person when soil
                hits “thirsty.”
              </p>
            </li>
            <li className="sg-step">
              <span className="sg-step-num" aria-hidden="true">
                3
              </span>
              <h3>Hand off cleanly</h3>
              <p>
                Log what you did in one tap. No screenshots in the building
                WhatsApp.
              </p>
            </li>
          </ol>

          <div className="sg-how-media">
            <figure className="sg-how-figure">
              <Image
                src="/demo/hero-image-4.webp"
                alt="Potted plants arranged near a sunny window"
                width={720}
                height={480}
              />
              <figcaption>Map · claim · log — the weekly loop</figcaption>
            </figure>
            <figure className="sg-how-figure">
              <Image
                src="/demo/hero-image-6.webp"
                alt="Resident checking on an indoor plant"
                width={720}
                height={480}
              />
              <figcaption>Handoffs stay in Sprig, not the group chat</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="sg-gallery" id="look" aria-labelledby="look-title">
        <div className="sg-wrap">
          <div className="sg-section-head">
            <Eyebrow>In the wild</Eyebrow>
            <h2 id="look-title">Real corners. Shared greenery.</h2>
            <p>
              Image treatment from the guide: rounded 20px media, atmosphere
              first, captions as quiet labels.
            </p>
          </div>
          <div className="sg-gallery-grid">
            {GALLERY.map((shot) => (
              <figure key={shot.src} className="sg-gallery-item">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={560}
                  height={420}
                />
                <figcaption>{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-team" id="team" aria-labelledby="team-title">
        <div className="sg-wrap">
          <div className="sg-section-head">
            <Eyebrow>Meet the team</Eyebrow>
            <h2 id="team-title">Four people. Zero gardeners-for-hire.</h2>
            <p>
              Sprig is fictional — these roles show portrait cards, soft paper
              surfaces, and readable pink links elsewhere on the page.
            </p>
          </div>
          <ul className="sg-team-grid">
            {TEAM.map((person) => (
              <li key={person.name} className="sg-team-card">
                <Image
                  src={person.src}
                  alt={`Portrait of ${person.name}`}
                  width={400}
                  height={400}
                  className="sg-team-photo"
                />
                <div className="sg-team-copy">
                  <h3>{person.name}</h3>
                  <p className="sg-team-role">{person.role}</p>
                  <p>{person.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sg-pricing" id="pricing" aria-labelledby="pricing-title">
        <div className="sg-wrap">
          <div className="sg-section-head sg-section-head-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 id="pricing-title">Pick a plan for your building.</h2>
            <p>
              Featured card uses the ink surface; lime badge marks the
              recommended tier — same pattern as the marketing pricing block.
            </p>
          </div>
          <div className="sg-pricing-grid">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`sg-price-card${plan.featured ? " is-featured" : ""}`}
              >
                {plan.featured ? (
                  <span className="sg-price-badge">Most buildings</span>
                ) : null}
                <div className="sg-price-header">
                  <h3>{plan.name}</h3>
                  <p>{plan.blurb}</p>
                </div>
                <div className="sg-price-amount">
                  <span className="sg-price-value">{plan.price}</span>
                  <span className="sg-price-note">{plan.note}</span>
                </div>
                <ul className="sg-price-features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <ArrowButton
                  href="#join"
                  label={plan.featured ? "Start Canopy" : "Choose plan"}
                  tone={plan.featured ? "lime" : "dark"}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-faq" id="faq" aria-labelledby="faq-title">
        <div className="sg-wrap sg-faq-grid">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="faq-title">Quick answers before you tour the care log.</h2>
            <p className="sg-faq-lead">
              Want a denser product surface? Open the{" "}
              <Link href="/demo/care-log">care log subpage</Link> — same tokens,
              more UI chrome.
            </p>
          </div>
          <div className="sg-faq-list">
            <details className="sg-faq-item" open>
              <summary>Is Sprig a real product?</summary>
              <p>
                No. It exists only to show MyHireView’s marketing style guide on
                an unrelated idea.
              </p>
            </details>
            <details className="sg-faq-item">
              <summary>Do residents need accounts?</summary>
              <p>
                In this fiction, yes — a light invite so the building knows who
                claimed which week.
              </p>
            </details>
            <details className="sg-faq-item">
              <summary>What about private balcony plants?</summary>
              <p>
                Sprig is for shared / common-area plants. Balcony jungles stay
                gloriously ungoverned.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="sg-strip" id="join" aria-labelledby="join-title">
        <div className="sg-wrap">
          <div className="sg-strip-inner">
            <div>
              <h2 id="join-title">Ready to retire the group chat?</h2>
              <p>
                Dark featured surface + lime arrow CTA. Continue to the care log
                if you want to see logs, filters, and a deeper layout.
              </p>
            </div>
            <div className="sg-strip-actions">
              <ArrowButton href="#top" label="Join the waitlist" tone="lime" />
              <ArrowButton
                href="/demo/care-log"
                label="Open care log"
                tone="ghost"
              />
            </div>
          </div>
        </div>
      </section>
    </SprigShell>
  );
}
