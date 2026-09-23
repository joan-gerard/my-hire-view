"use client";

import { HOW_IT_WORKS_STEPS } from "@/components/public/how-it-works";
import { FormEvent, useEffect, useRef, useState } from "react";

const CDN = "https://framerusercontent.com/images";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "How to", href: "#how" },
  { label: "About", href: "#top", current: true },
];

const PAGE_LINKS = [
  { label: "Contact", href: "#contact" },
  { label: "FAQs", href: "#contact" },
  { label: "Privacy Policy", href: "#legal" },
];

const HERO_IMAGES = [
  { src: "/demo/hero-image-1.webp", width: 430 },
  { src: "/demo/hero-image-2.webp", width: 350 },
  { src: "/demo/hero-image-3.webp", width: 290 },
  { src: "/demo/hero-image-4.webp", width: 430 },
  { src: "/demo/hero-image-5.webp", width: 350 },
  { src: "/demo/hero-image-6.webp", width: 290 },
  { src: "/demo/hero-image-7.webp", width: 290 },
];

const LOGOS = [
  "8YlmHQ6DeSu2sqoakhkKMQnSuQ.svg",
  "3AK7KxQNH7ppyFRSwQBDI3f8o.svg",
  "DHF0voxCUcjFEAyv97qvaX3HVLE.svg",
  "g1UWMIrGG8yG26lxcWec8dFWtwA.svg",
  "f4IlrsMoqnBBanfpbMaX2mRu7E.svg",
  "ixrMK3y6OQfsKnXYVi0raeGyzr0.svg",
  "gr5FR1ur6D0LFO5mGwsz1kkwKsA.svg",
  "Qr6tFNDxPPnhk1QJ8V8g7TfQzo.svg",
  "Nr35cpkJsk84ucWJCUulLR9g8.svg",
  "SImeSdIBL90qXoq2K7XpmFQmHs.svg",
  "8RZwGfryj1qwZKhPkz14lJxt8A.svg",
  "asUrOQQtLkTWQdGdQJH06UhH0c.svg",
  "ZnfT2OdBvt6TAB7N8vgaRPPkc.svg",
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

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    src: `${CDN}/UNHWO6o4eJm1sJGkiuTB3wK7g.svg`,
  },
  {
    label: "X",
    href: "https://x.com/",
    src: `${CDN}/SH6Bc51sN5nPuXONzfaEO0z5Wg.svg`,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    src: `${CDN}/XnrugqEPDcER7y3bawXIhRoS8.svg`,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    src: `${CDN}/RfHkggb4cyU4G40c636RUhlKF4.svg`,
  },
];

function RollLabel({ text }: { text: string }) {
  return (
    <span className="ot-roll">
      <span>{text}</span>
      <span>{text}</span>
    </span>
  );
}

function ArrowButton({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "dark" | "lime";
}) {
  return (
    <a className={`ot-arrow-btn ot-arrow-btn-${tone}`} href={href}>
      <RollLabel text={label} />
      <span className="ot-arrow-btn-icon" aria-hidden="true">
        <img
          src={
            tone === "dark"
              ? `${CDN}/IhB70bIKwahZMOmvTBIBolMs7s.svg`
              : `${CDN}/fwz16wJTN5Rg5RsxBmmMoSp6qy0.svg`
          }
          alt=""
          width={tone === "dark" ? 11 : 20}
          height={tone === "dark" ? 11 : 20}
        />
      </span>
    </a>
  );
}

export function OvertakeAbout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const caseRefs = useRef<Array<HTMLAnchorElement | null>>([]);

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

    function setRecess(el: HTMLAnchorElement | null, value: number) {
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

  function onSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email) return;
    setJoined(true);
  }

  return (
    <div className="overtake ot-nav-deferred" id="top">
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
          {NAV.slice(0, 3).map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
          <div
            className={`ot-pages${pagesOpen ? " is-open" : ""}`}
            onMouseEnter={() => setPagesOpen(true)}
            onMouseLeave={() => setPagesOpen(false)}
          >
            <button
              type="button"
              className="ot-pages-trigger"
              aria-expanded={pagesOpen}
              onClick={() => setPagesOpen((open) => !open)}
            >
              Pages
              <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true">
                <path
                  d="M1 1.2 6 6.2 11 1.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="ot-pages-menu" role="menu">
              {PAGE_LINKS.map((item) => (
                <a key={item.label} href={item.href} role="menuitem">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
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
          {[...NAV, ...PAGE_LINKS].map((item) => (
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
                <a
                  key={step.id}
                  ref={(node) => {
                    caseRefs.current[index] = node;
                  }}
                  className="ot-case"
                  href="/login"
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
                      <span className="ot-case-cta">
                        <RollLabel text="Get started" />
                        <span className="ot-case-cta-icon" aria-hidden="true">
                          <img
                            src={`${CDN}/fwz16wJTN5Rg5RsxBmmMoSp6qy0.svg`}
                            alt=""
                            width={16}
                            height={16}
                          />
                        </span>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
              <div className="ot-work-spacer" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="ot-principles" aria-labelledby="principles-title">
          <div className="ot-principles-slab">
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
            <div className="ot-marquee ot-logo-marquee" aria-hidden="true">
              <div className="ot-marquee-track ot-logo-track">
                {[0, 1].map((copy) => (
                  <div className="ot-logo-set" key={copy}>
                    {LOGOS.map((file) => (
                      <img
                        key={`${copy}-${file}`}
                        src={`${CDN}/${file}`}
                        alt=""
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ot-footer" id="contact">
        <div className="ot-footer-card">
          <div className="ot-footer-inner">
            <div className="ot-footer-cta">
              <h2>Ready to transform your job search?</h2>
              <ArrowButton href="/login" label="Login" tone="lime" />
            </div>

            <div className="ot-footer-mid">
              <div className="ot-news">
                <div>
                  <h3>Stay connected</h3>
                  <p>
                    Join our newsletter for tips, updates, and project
                    highlights only the good stuff.
                  </p>
                </div>
                {joined ? (
                  <p className="ot-joined" role="status">
                    You&apos;re on the list.
                  </p>
                ) : (
                  <form onSubmit={onSubscribe}>
                    <label className="ot-email">
                      <span className="ot-sr">Email</span>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Your email address*"
                        autoComplete="email"
                      />
                      <button type="submit" aria-label="Subscribe">
                        <img
                          src={`${CDN}/5neo2o4T9lq8ZcucmEfXT4A3ec0.svg`}
                          alt=""
                          width={23}
                          height={19}
                        />
                      </button>
                    </label>
                  </form>
                )}
                <div className="ot-follow">
                  <p>Follow us on:</p>
                  <ul>
                    {SOCIALS.map((social) => (
                      <li key={social.label}>
                        <a href={social.href} aria-label="Social Link">
                          <img src={social.src} alt="" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ot-footer-links">
                <div>
                  <p className="ot-footer-label">Pages</p>
                  <a href="#top">Home</a>
                  <a href="#top">About</a>
                  <a href="#how">How to</a>
                </div>
                <div>
                  <p className="ot-footer-label">Support</p>
                  <a href="#contact">FAQs</a>
                  <a href="#legal">Terms</a>
                  <a href="#legal">Privacy Policy</a>
                  <a href="#legal">Cookies</a>
                </div>
              </div>

              <div className="ot-footer-contact">
                <div>
                  <p className="ot-footer-label">Stay Connected</p>
                  <a href="mailto:hello@yourbrand.com">hello@yourbrand.com</a>
                  <a href="tel:+12025550147">+1 (202) 555 0147</a>
                </div>
              </div>
            </div>

            <div className="ot-copyright" id="legal">
              <p>© 2026 MyHireView</p>
            </div>
          </div>
        </div>
      </footer>

      <a className="ot-get" href="https://framer.link/overtake">
        <RollLabel text="Get it for FREE" />
        <img
          src={`${CDN}/JCDk8i61Ec1N2laCFRxqdUPv0sM.svg`}
          alt=""
          width={21}
          height={21}
        />
      </a>
    </div>
  );
}
