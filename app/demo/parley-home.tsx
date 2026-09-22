"use client";

import { useEffect, useRef, useState } from "react";
import {
  CHANNELS,
  FAQ_ITEMS,
  HERO_POSTER,
  HERO_VIDEO,
  HIW_STEPS,
  PLANS,
  SHARE_PLACES,
  TESTIMONIALS,
} from "./content";
import { DemoWaitlist } from "./demo-waitlist";
import { FaqPlus, Fbtn, Wordmark } from "./demo-ui";
import { DelegationSection } from "./delegation-section";
import { initParley } from "./init-parley";
import { WhySection } from "./why-section";

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"
      />
    </svg>
  );
}

function ShareTiles({ places, labeled }: { places: readonly string[]; labeled: boolean }) {
  return (
    <div className="int-marquee__set" aria-hidden={labeled ? undefined : true}>
      {places.map((place) => (
        <span
          className="int-tile int-tile--text"
          key={`${labeled ? "a" : "b"}-${place}`}
        >
          {place}
        </span>
      ))}
    </div>
  );
}

function PricingPlans() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="pricing" id="pricing">
      <header className="pricing__header">
        <div className="pricing__heading">
          <p className="badge">Pricing</p>
          <h2 className="h2">
            Simple, transparent
            <br />
            pricing. <em>No surprises.</em>
          </h2>
        </div>
        <div className="pricing__side">
          <p className="pricing__lede">
            Start free. Upgrade when you need more pages, richer analytics, or a
            branded link. Prices are a working draft until launch.
          </p>
          <div className="toggle" role="tablist" aria-label="Billing period">
            <button
              className={`toggle__btn${annual ? "" : " is-active"}`}
              type="button"
              role="tab"
              aria-selected={!annual}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`toggle__btn${annual ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={annual}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="toggle__off">-64%</span>
            </button>
          </div>
        </div>
      </header>

      <div className="plans" id="plans">
        {PLANS.map((plan, index) => {
          const price = annual ? plan.annual : plan.monthly;
          return (
            <article
              className={`plan${plan.featured ? " is-featured" : ""}`}
              data-index={index}
              key={plan.name}
            >
              <h3 className="plan__name">{plan.name}</h3>
              <div className="plan__price">
                <span className="plan__currency">$</span>
                <span className="plan__amount">{price.amount}</span>
                {plan.name !== "Free" && annual ? (
                  <span className="plan__suffix">/yr</span>
                ) : null}
              </div>
              <p className="plan__period">{price.period}</p>
              <p className="plan__desc">{plan.desc}</p>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li className={feature.on ? undefined : "is-off"} key={feature.label}>
                    <span className="plan-features__dot"></span>
                    {feature.label}
                  </li>
                ))}
              </ul>
              <Fbtn
                href="#cta"
                variant={plan.featured ? "primary" : "secondary"}
                full
              >
                Join waitlist
              </Fbtn>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ParleyHome() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return initParley(root);
  }, []);

  return (
    <div className="parley-demo" ref={rootRef}>
      <div className="nav-bar">
        <nav className="nav">
          <Wordmark />
          <div className="nav__right">
            <ul className="nav__links">
              <li>
                <a href="#how-it-works">How it works</a>
              </li>
              <li aria-hidden="true" className="nav__sep"></li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li aria-hidden="true" className="nav__sep"></li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li aria-hidden="true" className="nav__sep"></li>
              <li>
                <a href="#cta">Waitlist</a>
              </li>
            </ul>
            <Fbtn href="#cta" variant="primary">
              Get Early Access
            </Fbtn>
          </div>
        </nav>
      </div>

      <main className="page">
        <div className="container">
          <section className="hero" id="hero">
            <div className="hero__sticky">
              <div className="hero__media" id="hero-media">
                <video
                  className="hero__img"
                  src={HERO_VIDEO}
                  poster={HERO_POSTER}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Candidate recording a video pitch for a job application page"
                />
                <div className="hero__overlay"></div>
                <div className="hero__content">
                  <h1 className="hero__headline">
                    Stand out.
                    <br />
                    Get <em>seen.</em>
                  </h1>
                  <p className="hero__lede">
                    Create your page, share your link, and get noticed by
                    recruiters. A personalized job application — CV, video
                    pitch, and proof they looked — in minutes.
                  </p>
                  <Fbtn href="#cta" variant="primary">
                    Get Early Access
                  </Fbtn>
                </div>
              </div>
            </div>
          </section>

          <section className="logos">
            <p className="logos__label">
              Share it wherever recruiters already are
            </p>
            <ul className="logos__list" role="list">
              {CHANNELS.map((channel) => (
                <li className="logo logo--word" key={channel}>
                  {channel}
                </li>
              ))}
            </ul>
          </section>

          <WhySection />

          <DelegationSection />

          <section className="testimonials bleed" id="testimonials">
            <header className="testimonials__header">
              <p className="badge">What people say</p>
              <h2 className="h2">
                The hiring process,
                <br />
                <em>in their words</em>
              </h2>
              <p className="testimonials__lede">
                Candidates, recruiters, and hiring managers already know the
                PDF is broken. MyHireView is the page they wish they had.
              </p>
            </header>

            <div className="marquee">
              <ul className="marquee__track" id="track" role="list">
                {TESTIMONIALS.map((item) => (
                  <li className="tcard" key={item.quote}>
                    <p className="tcard__quote">{item.quote}</p>
                    <figure className="tcard__author">
                      <img
                        className="tcard__avatar"
                        src={item.avatar}
                        srcSet={
                          "avatar2x" in item
                            ? `${item.avatar} 1x, ${item.avatar2x} 2x`
                            : undefined
                        }
                        alt=""
                      />
                      <figcaption>
                        <span className="tcard__name">{item.name}</span>
                        <span className="tcard__role">{item.role}</span>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <PricingPlans />

          <section className="hiw" id="how-it-works">
            <header className="hiw__header">
              <p className="badge">How it works</p>
              <h2 className="h2 h2--center">
                Create. Share.{" "}
                <em>
                  Follow up
                  <br />
                  with proof.
                </em>
              </h2>
            </header>

            <div className="hiw__panel" id="hiw-panel">
              <div className="hiw__pills" role="list">
                {HIW_STEPS.map((step, index) => (
                  <button
                    className={`hiw__pill${index === 0 ? " is-active" : ""}`}
                    data-step={index}
                    type="button"
                    aria-pressed={index === 0}
                    key={step.label}
                  >
                    {step.label}
                  </button>
                ))}
              </div>

              <div className="hiw__stage">
                {HIW_STEPS.map((step, index) => (
                  <div
                    className={`hiw__lottie${index === 0 ? " is-active" : ""}`}
                    data-step={index}
                    hidden={index !== 0}
                    key={step.video}
                  >
                    <video
                      className="hiw__video"
                      src={step.video}
                      poster={step.poster}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={step.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="faq" id="faq">
            <div className="faq__left">
              <p className="badge">FAQ</p>
              <h2 className="h2">
                Questions
                <br />
                answered.
              </h2>
              <p className="faq__sub">Still curious?</p>
              <Fbtn href="mailto:support@myhireview.com" variant="primary">
                Email us
              </Fbtn>
              <img
                className="faq__mosaic"
                src="https://parley-home.vercel.app/assets/faq-mosaic.png"
                alt=""
                loading="lazy"
              />
            </div>

            <div className="faq__list">
              {FAQ_ITEMS.map((item) => (
                <details className="faq__item" key={item.q}>
                  <summary>
                    <span>{item.q}</span>
                    <FaqPlus />
                  </summary>
                  <div className="faq__answer">
                    <p>{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="integrations" id="integrations">
            <header className="integrations__header">
              <p className="badge">Where it lives</p>
              <h2 className="h2 h2--center">
                Share it where they already look.
                <br />
                <em>No recruiter login.</em>
              </h2>
              <p className="integrations__lede">
                LinkedIn, email, job boards, ATS — one private link. Recruiters
                open it like a PDF, and actually see you.
              </p>
            </header>

            <div className="int-marquee">
              <div className="int-marquee__row" data-dir="left">
                <ShareTiles places={SHARE_PLACES} labeled />
                <ShareTiles places={SHARE_PLACES} labeled={false} />
              </div>
              <div className="int-marquee__row" data-dir="right">
                <ShareTiles places={[...SHARE_PLACES].reverse()} labeled />
                <ShareTiles
                  places={[...SHARE_PLACES].reverse()}
                  labeled={false}
                />
              </div>
            </div>
          </section>

          <section className="cta" id="cta">
            <div className="cta__panel">
              <img
                className="cta__bg"
                src="/solution-1-1.webp"
                alt=""
                loading="lazy"
              />
              <div className="cta__overlay"></div>
              <div className="cta__content">
                <h2 className="cta__title">
                  Ready to transform
                  <br />
                  <em>your job search?</em>
                </h2>
                <p className="cta__lede">
                  Join the waitlist now and be among the first to create
                  applications that actually get noticed. Early signups get 3
                  months of Pro free when we launch.
                </p>
                <DemoWaitlist />
              </div>
            </div>
          </section>
        </div>

        <footer className="footer" id="footer">
          <div className="footer__inner">
            <div className="footer__top">
              <Wordmark href="#hero" className="footer__wordmark" />
              <div className="footer__social">
                <span className="footer__social-label">Social media</span>
                <div className="footer__social-btns">
                  <a
                    className="footer__social-btn"
                    href="https://twitter.com/myhireview"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                  >
                    <TwitterIcon />
                  </a>
                  <a
                    className="footer__social-btn"
                    href="https://www.linkedin.com/company/myhireview"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              </div>
            </div>

            <div className="footer__mid">
              <p className="footer__tagline">
                Your video pitch, one link. A personalized job application page
                so recruiters see the real you — and you see when they looked.
              </p>
              <nav className="footer__cols" aria-label="Footer">
                <div className="footer__col">
                  <p className="footer__col-title">
                    <span className="footer__square"></span>Product
                  </p>
                  <a href="#how-it-works">How it works</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#faq">FAQ</a>
                </div>
                <div className="footer__col">
                  <p className="footer__col-title">
                    <span className="footer__square"></span>Company
                  </p>
                  <a href="#cta">Waitlist</a>
                  <a href="mailto:support@myhireview.com">Contact</a>
                </div>
                <div className="footer__col">
                  <p className="footer__col-title">
                    <span className="footer__square"></span>Legal
                  </p>
                  <a href="/terms">Terms of Service</a>
                  <a href="/privacy">Privacy Policy</a>
                </div>
              </nav>
            </div>

            <div className="footer__mark">
              <p className="footer__watermark-text" aria-hidden="true">
                MyHireView
              </p>
              <img
                className="footer__mosaic"
                src="https://parley-home.vercel.app/assets/footer-mosaic.png"
                alt=""
                loading="lazy"
              />

              <div className="footer__bottom">
                <p>© 2026 MyHireView. All rights reserved.</p>
                <a href="/terms">Terms&amp;Conditions</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
