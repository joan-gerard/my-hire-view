"use client";

import Image from "next/image";
import {
  ArrowButton,
  Eyebrow,
  SprigShell,
} from "../sprig-shared";

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

/**
 * Secondary Sprig page — denser UI chrome using the same marketing tokens.
 */
export function CareLogPage() {
  return (
    <SprigShell current="care-log">
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
    </SprigShell>
  );
}
