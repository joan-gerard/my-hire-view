"use client";

import { HOW_IT_WORKS_STEPS } from "@/components/public/how-it-works";
import { FAQ_ITEMS } from "@/components/public/faq/constants";
import {
  ANNUAL_SAVINGS_LABEL,
  getAnnualNudge,
  getTierPrice,
  PRICING_DRAFT_NOTE,
  PRICING_TIERS,
  type BillingInterval,
  type PricingFeature,
  type PricingTier,
} from "@/components/public/pricing/constants";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "How to", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faq" },
];

const BILLING_OPTIONS = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
] as const;

/** Prefer ASCII punctuation in homepage copy (shared constants may use em dashes). */
function withoutEmDash(text: string): string {
  return text.replace(/\u2014/g, " -");
}

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
] as const;

const HERO_IMAGES = [
  { src: "/demo/hero-image-1.webp", width: 430 },
  { src: "/demo/hero-image-2.webp", width: 350 },
  { src: "/demo/hero-image-3.webp", width: 290 },
  { src: "/demo/hero-image-4.webp", width: 430 },
  { src: "/demo/hero-image-5.webp", width: 350 },
  { src: "/demo/hero-image-6.webp", width: 290 },
  { src: "/demo/hero-image-7.webp", width: 290 },
];

const PRINCIPLES = [
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
];

/** Brand-adjacent accents; index advances once per UTC day. */
const LOGO_DOT_COLORS = [
  "#9efc65",
  "#ffbcfc",
  "#7dd3c0",
  "#ffd36a",
  "#8ec5ff",
  "#ff8f6b",
] as const;

function dailyLogoDotColor(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return LOGO_DOT_COLORS[day % LOGO_DOT_COLORS.length];
}

function RollLabel({ text }: { text: string }) {
  return (
    <span className="ot-roll">
      <span>{text}</span>
      <span>{text}</span>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11 11"
      width="11"
      height="11"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M.72 9.78a.75.75 0 0 0 1.06 0l8.5-8.5A.75.75 0 1 0 9.22.22l-8.5 8.5a.75.75 0 0 0 0 1.06"
      />
      <path
        fill="currentColor"
        d="M9.75 10.5a.75.75 0 0 0 .75-.75v-9A.75.75 0 0 0 9.75 0h-9a.75.75 0 0 0 0 1.5H9v8.25c0 .414.336.75.75.75"
      />
    </svg>
  );
}

function ArrowButton({
  href,
  label,
  tone,
  className,
}: {
  href: string;
  label: string;
  tone: "dark" | "lime";
  className?: string;
}) {
  return (
    <a
      className={`ot-arrow-btn ot-arrow-btn-${tone}${className ? ` ${className}` : ""}`}
      href={href}
    >
      <RollLabel text={label} />
      <span className="ot-arrow-btn-icon" aria-hidden="true">
        <ArrowIcon />
      </span>
    </a>
  );
}

function BillingIntervalToggle({
  value,
  onChange,
  annualRadioRef,
}: {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  annualRadioRef: RefObject<HTMLButtonElement | null>;
}) {
  const monthlyRadioRef = useRef<HTMLButtonElement>(null);

  const focusOption = (interval: BillingInterval) => {
    const el =
      interval === "annual" ? annualRadioRef.current : monthlyRadioRef.current;
    el?.focus();
  };

  const selectOption = (interval: BillingInterval) => {
    onChange(interval);
    focusOption(interval);
  };

  const handleRadioKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentId: BillingInterval,
  ) => {
    const index = BILLING_OPTIONS.findIndex((o) => o.id === currentId);
    if (index < 0) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % BILLING_OPTIONS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + BILLING_OPTIONS.length) % BILLING_OPTIONS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = BILLING_OPTIONS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = BILLING_OPTIONS[nextIndex];
    if (next) selectOption(next.id);
  };

  return (
    <div className="ot-billing">
      <div
        role="radiogroup"
        aria-label="Billing interval"
        className="ot-billing-toggle"
      >
        {BILLING_OPTIONS.map((option) => {
          const selected = value === option.id;
          const isAnnual = option.id === "annual";
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={
                isAnnual ? `Annual, ${ANNUAL_SAVINGS_LABEL}` : undefined
              }
              tabIndex={selected ? 0 : -1}
              ref={isAnnual ? annualRadioRef : monthlyRadioRef}
              onClick={() => selectOption(option.id)}
              onKeyDown={(event) => handleRadioKeyDown(event, option.id)}
              className={
                selected
                  ? "ot-billing-option is-selected"
                  : "ot-billing-option"
              }
            >
              {option.label}
              {isAnnual && (
                <span aria-hidden className="ot-billing-save">
                  {ANNUAL_SAVINGS_LABEL}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {value === "monthly" && (
        <p className="ot-billing-hint">
          {`Switch to annual and ${ANNUAL_SAVINGS_LABEL.toLowerCase()}`}
        </p>
      )}
    </div>
  );
}

function PricingFeatureText({ feature }: { feature: PricingFeature }) {
  if (!feature.tooltip) {
    return <span>{feature.label}</span>;
  }

  const tipId = `ot-pricing-tip-${feature.label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <span className="ot-price-feature-text">
      <span>{feature.label}</span>
      <button
        type="button"
        className="ot-price-tip-btn"
        aria-describedby={tipId}
        aria-label={`More about ${feature.label}`}
      >
        ?
      </button>
      <span id={tipId} role="tooltip" className="ot-price-tip">
        {feature.tooltip}
      </span>
    </span>
  );
}

function PricingTierCard({
  tier,
  billingInterval,
  onSelectAnnual,
}: {
  tier: PricingTier;
  billingInterval: BillingInterval;
  onSelectAnnual: () => void;
}) {
  const isHighlighted = tier.highlighted;
  const price = getTierPrice(tier, billingInterval);
  const annualNudge =
    billingInterval === "monthly" ? getAnnualNudge(tier) : null;

  return (
    <article
      className={
        isHighlighted ? "ot-price-card is-featured" : "ot-price-card"
      }
    >
      {isHighlighted && (
        <span className="ot-price-badge">Recommended</span>
      )}

      <header className="ot-price-header">
        <h3>{tier.name}</h3>
        <p>{tier.tagline}</p>
      </header>

      <div className="ot-price-amount">
        <p className="ot-price-value">{price.priceLabel}</p>
        <p className="ot-price-note">{price.priceNote}</p>
        {annualNudge && (
          <button
            type="button"
            className="ot-price-nudge"
            onClick={onSelectAnnual}
          >
            {withoutEmDash(annualNudge)}
          </button>
        )}
      </div>

      <ul className="ot-price-features" role="list">
        {tier.features.map((feature) => (
          <li key={feature.label}>
            <span className="ot-price-check" aria-hidden="true" />
            <PricingFeatureText feature={feature} />
          </li>
        ))}
      </ul>

      <ArrowButton
        href={tier.cta.href}
        label={tier.cta.label}
        tone={isHighlighted ? "lime" : "dark"}
        className="ot-price-cta"
      />
    </article>
  );
}

export function MhvLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("annual");
  const [faqOpen, setFaqOpen] = useState<ReadonlySet<number>>(
    () => new Set([0]),
  );
  const annualRadioRef = useRef<HTMLButtonElement>(null);
  const focusAnnualAfterNudgeRef = useRef(false);
  const caseRefs = useRef<Array<HTMLElement | null>>([]);

  const selectAnnualAndFocusToggle = useCallback(() => {
    focusAnnualAfterNudgeRef.current = true;
    setBillingInterval("annual");
  }, []);

  useLayoutEffect(() => {
    if (billingInterval !== "annual" || !focusAnnualAfterNudgeRef.current) {
      return;
    }
    focusAnnualAfterNudgeRef.current = false;
    annualRadioRef.current?.focus();
  }, [billingInterval]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 721px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function coverage(current: DOMRect, next: DOMRect): number {
      if (current.height <= 0) return 0;
      return Math.min(
        1,
        Math.max(0, (current.bottom - next.top) / current.height),
      );
    }

    /** Ease recess from ~half covered through nearly full cover. */
    function recessProgress(amount: number): number {
      const start = 0.45;
      const end = 0.95;
      const t = Math.min(1, Math.max(0, (amount - start) / (end - start)));
      return t * t * (3 - 2 * t);
    }

    function setRecess(el: HTMLElement | null, value: number) {
      if (!el) return;
      el.style.setProperty("--ot-recess", value.toFixed(4));
    }

    function update() {
      const [first, second, third] = caseRefs.current;

      if (!desktopQuery.matches || motionQuery.matches) {
        setRecess(first, 0);
        setRecess(second, 0);
        setRecess(third, 0);
        return;
      }

      if (!first || !second || !third) return;

      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const thirdRect = third.getBoundingClientRect();

      setRecess(first, recessProgress(coverage(firstRect, secondRect)));
      setRecess(second, recessProgress(coverage(secondRect, thirdRect)));
      setRecess(third, 0);
    }

    let frame = 0;
    function onScrollOrResize() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    desktopQuery.addEventListener("change", onScrollOrResize);
    motionQuery.addEventListener("change", onScrollOrResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      desktopQuery.removeEventListener("change", onScrollOrResize);
      motionQuery.removeEventListener("change", onScrollOrResize);
    };
  }, []);

  return (
    <div className="mhv-landing ot-nav-deferred" id="top">
      <header className="ot-header">
        <a className="ot-logo" href="#top">
          MyHireView
          <span
            className="ot-logo-dot"
            style={{ backgroundColor: dailyLogoDotColor() }}
            aria-hidden="true"
          />
        </a>

        <nav className="ot-nav" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ot-header-end">
          <ArrowButton href="/login" label="Login" tone="dark" />
          <button
            type="button"
            className="ot-menu-btn"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="ot-drawer">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <ArrowButton href="/login" label="Login" tone="dark" />
        </div>
      ) : null}

      <main>
        <section className="ot-hero" aria-labelledby="hero-title">
          <div className="ot-wrap ot-hero-copy">
            <p className="ot-eyebrow">
              <i />
              Stand out & Get seen
              <i />
            </p>
            <h1 id="hero-title" className="ot-hero-title">
              <span>We</span>
              <span>built</span>
              <span className="ot-word-lime">MyHireView</span>
              <span>because</span>
              <span>good</span>
              <span className="ot-word-pink">applications</span>
              <span>kept</span>
              <span>vanishing</span>
              <span>in</span>
              <span>the</span>
              <span>void.</span>
            </h1>
          </div>
          <div className="ot-marquee" aria-hidden="true">
            <div className="ot-marquee-track ot-hero-track">
              {[0, 1].map((copy) => (
                <div className="ot-hero-set" key={copy}>
                  {HERO_IMAGES.map((image) => (
                    <img
                      key={`${copy}-${image.src}`}
                      src={image.src}
                      alt=""
                      style={{ width: image.width }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ot-story" id="story">
          <div className="ot-wrap ot-story-grid">
            <div className="ot-story-copy">
              <h2>
                Hiring still treats people like unread files. You apply, you
                follow up, then nothing: no signal that anyone looked.
              </h2>
              <p>
                So we built MyHireView: one page per role with your CV, an
                optional video pitch, and a link you can share anywhere.
                Recruiters open it with no account. You see when they viewed it,
                so follow-ups aren&apos;t guesswork.
              </p>
            </div>
            <div className="ot-stats">
              <article className="ot-stat ot-stat-a">
                <p>Recruiter scan time</p>
                <p className="ot-stat-num">
                  6<span>s</span>
                </p>
              </article>
              <article className="ot-stat ot-stat-b">
                <p>Engagement with video</p>
                <p className="ot-stat-num">3×</p>
              </article>
              <article className="ot-stat ot-stat-c">
                <p>Time to share a page</p>
                <p className="ot-stat-num ot-stat-num-light">
                  &lt;2<span>m</span>
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="ot-principles" aria-labelledby="principles-title">
          <div className="ot-principles-panel">
            <div className="ot-principles-intro">
              <h2 id="principles-title">
                Introducing MyHireView: Your application, elevated
              </h2>
              <p>
                Stand out with a video pitch, smart analytics, and shareable
                links, so recruiters see the real you.
              </p>
            </div>
            <div className="ot-principle-grid">
              {PRINCIPLES.map((item) => (
                <article key={item.n} className="ot-principle">
                  <span className="ot-principle-n">{item.n}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ot-work" id="how" aria-labelledby="how-title">
          <div className="ot-wrap">
            <div className="ot-work-top">
              <div className="ot-work-intro">
                <h2 id="how-title">How to</h2>
                <p>
                  Our platform helps you stand out in your job search by
                  providing you with the tools and resources you need to
                  succeed.
                </p>
              </div>
              <ArrowButton href="/login" label="Get started" tone="dark" />
            </div>
            <div className="ot-work-list">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <article
                  key={step.id}
                  ref={(node) => {
                    caseRefs.current[index] = node;
                  }}
                  className="ot-case"
                >
                  <div className="ot-case-media" aria-hidden="true">
                    <video
                      src={step.video}
                      muted
                      loop
                      playsInline
                      autoPlay
                      aria-label={step.title}
                    />
                  </div>
                  <div className="ot-case-info">
                    <div className="ot-case-top">
                      <div className="ot-case-badges">
                        <span className="ot-case-badge">Step {step.id}</span>
                      </div>
                      <div className="ot-case-copy">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </div>
                    <div className="ot-case-bottom">
                      <div className="ot-case-metric">
                        <p className="ot-case-metric-value">
                          {String(step.id).padStart(2, "0")}
                        </p>
                        <p className="ot-case-metric-label">of three steps</p>
                      </div>
                      <a className="ot-case-cta" href="/login">
                        <RollLabel text="Get started" />
                        <span className="ot-case-cta-icon" aria-hidden="true">
                          <ArrowIcon />
                        </span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
              <div className="ot-work-spacer" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section
          className="ot-pricing"
          id="pricing"
          aria-labelledby="pricing-title"
        >
          <div className="ot-wrap">
            <div className="ot-pricing-intro">
              <p className="ot-eyebrow">
                <i />
                Pricing
                <i />
              </p>
              <h2 id="pricing-title">Plans that grow with you</h2>
              <p>
                Start free. Unlock tailored CVs on Pro. Go Premium for branded
                links and richer insight.
              </p>
            </div>

            <BillingIntervalToggle
              value={billingInterval}
              onChange={setBillingInterval}
              annualRadioRef={annualRadioRef}
            />

            <div className="ot-pricing-grid">
              {PRICING_TIERS.map((tier) => (
                <PricingTierCard
                  key={tier.id}
                  tier={tier}
                  billingInterval={billingInterval}
                  onSelectAnnual={selectAnnualAndFocusToggle}
                />
              ))}
            </div>

            <p className="ot-pricing-draft">{withoutEmDash(PRICING_DRAFT_NOTE)}</p>
          </div>
        </section>

        <section className="ot-faq" id="faq" aria-labelledby="faq-title">
          <div className="ot-wrap">
            <div className="ot-faq-intro">
              <p className="ot-eyebrow">
                <i />
                Common questions
                <i />
              </p>
              <h2 id="faq-title">Frequently asked questions</h2>
            </div>

            <div className="ot-faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = faqOpen.has(index);
                const panelId = `ot-faq-panel-${index}`;
                const buttonId = `ot-faq-button-${index}`;

                return (
                  <div
                    key={item.q}
                    className={isOpen ? "ot-faq-item is-open" : "ot-faq-item"}
                  >
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        className="ot-faq-question"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => {
                          setFaqOpen((prev) => {
                            const next = new Set(prev);
                            if (next.has(index)) next.delete(index);
                            else next.add(index);
                            return next;
                          });
                        }}
                      >
                        <span>{item.q}</span>
                        <span className="ot-faq-switch" aria-hidden="true">
                          <span className="ot-faq-switch-bar ot-faq-switch-bar-h" />
                          <span className="ot-faq-switch-bar ot-faq-switch-bar-v" />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="ot-faq-answer"
                      aria-hidden={!isOpen}
                    >
                      <div className="ot-faq-answer-inner">
                        <p>{withoutEmDash(item.a)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="ot-footer">
        <div className="ot-footer-card">
          <div className="ot-footer-inner">
            <div className="ot-footer-cta">
              <h2>Ready to transform your job search?</h2>
              <ArrowButton href="/login" label="Login" tone="lime" />
            </div>

            <div className="ot-footer-bar">
              <a className="ot-footer-brand" href="#top">
                MyHireView
              </a>
              <nav className="ot-footer-legal" aria-label="Legal links">
                {LEGAL_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <p className="ot-copyright">© 2026 MyHireView</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
