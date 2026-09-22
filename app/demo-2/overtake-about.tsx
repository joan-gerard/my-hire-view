"use client";

import { FormEvent, useState } from "react";

const CDN = "https://framerusercontent.com/images";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Case Studies", href: "#story" },
  { label: "About", href: "#top", current: true },
  { label: "Blog", href: "#team" },
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
    title: "Outcomes over activity",
    body: "If it doesn't move revenue, CAC, or payback, we don't count it as work.",
  },
  {
    n: "02",
    title: "Truth in the numbers",
    body: "We'd rather show an uncomfortable metric than a flattering vanity one.",
  },
  {
    n: "03",
    title: "Senior hands only",
    body: "The people who win your pitch are the people who run your account.",
  },
];

const TEAM = [
  {
    name: "Maya Chen",
    role: "Founder, Media",
    src: `${CDN}/eOi6ikxEOa6cyZHnVHIWZiMzcFY.jpg`,
  },
  {
    name: "Dev Okafor",
    role: "Head of Creative",
    src: `${CDN}/ohkx1aSG8d7DdRjW6fpYGxZWA.jpg`,
  },
  {
    name: "Priya Raman",
    role: "Head of Analytics",
    src: `${CDN}/JhMntRZ4YJoZLBup4uG7ZuP460s.jpg`,
  },
  {
    name: "Liam Novak",
    role: "Head of Growth Strategy",
    src: `${CDN}/wGBT6a6I8Ai2j9ur0WMB6IiiB9M.jpg`,
  },
];

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
          <a href="#team">Blog</a>
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
                Our founders spent a decade inside agencies that billed for
                activity and hid behind reach metrics. Growth teams deserved
                better.
              </h2>
              <p>
                So in 2019 we built the opposite: a small, senior team that ties
                every decision to revenue, runs creative and media as one loop,
                and reports numbers a CFO would sign off on. Six years later,
                that discipline manages over $180M in spend for brands that
                refuse to plateau.
              </p>
            </div>
            <div className="ot-stats">
              <article className="ot-stat ot-stat-a">
                <p>Brands scaled past $1M/mo</p>
                <p className="ot-stat-num">
                  40<span>+</span>
                </p>
              </article>
              <article className="ot-stat ot-stat-b">
                <p>Brands scaled past $1M/mo</p>
                <p className="ot-stat-num">10+</p>
              </article>
              <article className="ot-stat ot-stat-c">
                <p>Client retention rate</p>
                <p className="ot-stat-num ot-stat-num-light">
                  94<span>%</span>
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="ot-principles" aria-labelledby="principles-title">
          <div className="ot-principles-slab">
            <div className="ot-principles-panel">
              <h2 id="principles-title">What we stand on</h2>
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

        <section className="ot-team" id="team">
          <div className="ot-wrap">
            <div className="ot-team-intro">
              <p className="ot-pill">The senior team promise</p>
              <h2>No juniors hiding behind the pitch deck.</h2>
            </div>
            <ul className="ot-team-grid">
              {TEAM.map((person) => (
                <li key={person.name}>
                  <div className="ot-portrait">
                    <img src={person.src} alt="" width={400} height={450} />
                    <div className="ot-portrait-socials">
                      <a href="https://x.com/" aria-label="Social Link">
                        <img
                          src={SOCIALS[1].src}
                          alt=""
                          width={14}
                          height={14}
                        />
                      </a>
                      <a
                        href="https://www.linkedin.com/"
                        aria-label="Social Link"
                      >
                        <img
                          src={SOCIALS[2].src}
                          alt=""
                          width={14}
                          height={14}
                        />
                      </a>
                    </div>
                  </div>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="ot-footer" id="contact">
        <div className="ot-footer-card">
          <div className="ot-footer-inner">
            <div className="ot-footer-cta">
              <h2>Ready to outpace your category?</h2>
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
                  <a href="#story">Case Studies</a>
                  <a href="#team">Blog</a>
                </div>
                <div>
                  <p className="ot-footer-label">Support</p>
                  <a href="#contact">FAQs</a>
                  <a href="#contact">Contact us</a>
                  <a href="#legal">Privacy Policy</a>
                </div>
              </div>

              <div className="ot-footer-contact">
                <div>
                  <p className="ot-footer-label">Stay Connected</p>
                  <a href="mailto:hello@yourbrand.com">hello@yourbrand.com</a>
                  <a href="tel:+12025550147">+1 (202) 555 0147</a>
                </div>
                <div>
                  <p className="ot-footer-label">Offline</p>
                  <a href="https://www.google.com/maps">
                    1238 Echo Ridge Blvd, Suite 400, San Francisco, CA 94103,
                    United States
                  </a>
                </div>
              </div>
            </div>

            <div className="ot-copyright" id="legal">
              <p>© 2026 Overtake Growth Inc.</p>
              <p>
                Design by <a href="https://www.webestica.com/">Webestica</a>,
                Powered by <a href="https://framer.com/">Framer</a>
              </p>
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
