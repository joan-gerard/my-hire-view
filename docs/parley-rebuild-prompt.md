# Rebuild prompt — Parley home page (single landing page)

Recreate this exact website pixel-perfectly using **vanilla HTML + CSS + JavaScript**. No framework, no build step, no backend, no database. Exactly three files: `index.html`, `styles.css`, `script.js`, plus remotely hosted assets referenced by URL. The result must be byte-equivalent in rendering to https://parley-home.vercel.app — treat the source below as canonical.

Fonts: **DM Sans** (display) + **Geist** (UI/body) via Google Fonts (the `<link>` tags are already in the HTML source below). Background `#f7f7f4`, ink `#251f19`, accent orange `#f48d17`. Desktop container is 1200px; breakpoints at 1240px, 900px, and 560px.

## ASSETS — DO NOT DOWNLOAD, DO NOT RE-HOST

Reference these URLs directly. Rewrite every relative `assets/...` path in the source to these absolute URLs (find-and-replace `assets/` → the base URL), or mirror the same folder layout locally if your environment forbids remote assets.

const ASSETS = "https://parley-home.vercel.app/assets/";
const ICONS  = "https://parley-home.vercel.app/assets/icons/";

Files under ASSETS:
arrows.svg avatar-daniel.png avatar-daniel@2x.png avatar-emily.png avatar-james.png avatar-james@2x.png avatar-paul.png avatar-sophie.png avatar-sophie@2x.png benefit-1.png benefit-3.png benefit-4.png btn-hire@2x.png btn-pro@2x.png btn-solo@2x.jpg btn-teams@2x.jpg btn-trial@2x.png canyon.png cloud.jpg cta-sunset.png decor.svg faq-mosaic.png footer-mosaic.png gradient-warm.jpg hero.jpg hiw-1.json hiw-2.json hiw-3.json logo-bloopglow-mark-d.svg logo-bloopglow-mark-h.svg logo-bloopglow-type-d.svg logo-bloopglow-type-h.svg logo-cloudplex-mark-d.svg logo-cloudplex-mark-h.svg logo-cloudplex-type-d.svg logo-cloudplex-type-h.svg logo-junotwig-d.svg logo-junotwig-h.svg logo-tytotone-mark-d.svg logo-tytotone-mark-h.svg logo-tytotone-type-d.svg logo-tytotone-type-h.svg logo-zingzap-mark-d.svg logo-zingzap-mark-h.svg logo-zingzap-type-d.svg logo-zingzap-type-h.svg lottie.min.js mock-0.png mock-0@2x.png mock-1.png mock-1@2x.png mock-2.png mock-2@2x.png mock-3.png mock-3@2x.png mosaic-a.png mosaic-b.png mosaic-c.png mosaic-d.png parley-logo.png parleys-plan.png pro-cloud.png section-bg.jpg tcard-cloud.jpg watermark.png

Files under ICONS (integration brand marks, 96×96 viewBox SVGs):
gcal.svg linear.svg loom.svg notion.svg onenote.svg slack.svg trello.svg zapier.svg

Key assets by role:
- hero.jpg — painted canyon hero background (scroll-expands from inset card to full-bleed)
- cloud.jpg — pricing card hover/featured background painting
- canyon.png — "How it works" panel background painting (rounded corners baked in)
- cta-sunset.png — final CTA sunset painting
- watermark.png — giant "Parley" wordmark for the footer
- footer-mosaic.png / faq-mosaic.png / mosaic-a|b|c.png / decor.svg — orange pixel-mosaic decorations
- parleys-plan.png — "PARLEY'S PLAN" checklist card used inside the Why-Parley expanded card
- mock-0..3.png (+@2x) — delegation section app mocks (step order: 0 natural-language, 1 multi-step, 2 human-in-the-loop, 3 persistent profile — note mock-1/mock-2 images are intentionally swapped in the HTML to match label order)
- btn-*.png/jpg — pre-rendered CTA button images (nav "Hire Parley", hero "Start free trial", 3 pricing buttons)
- logo-*-d.svg / logo-*-h.svg — client logo strip, default + hover variants (cross-fade on hover)
- avatar-*.png — testimonial portraits

## PAGE STRUCTURE (top to bottom)

1. Fixed nav (blur-over-hero, hides on scroll down / reveals on scroll up): Parley logo | Workflows · Pricing · Contact · Blog | "Hire Parley" button image.
2. HERO — headline "The AI agent that works *with you*, not just for you" over hero.jpg. The image starts as an inset 1200×600 rounded-18px card and expands to full viewport width/height over the first 500px of scroll (smoothstep-eased, radius→0, inner image scale 1.8→1.0). Scroll-linked only — no scroll hijack.
3. LOGO STRIP — "Trusted by 200+ businesses" + 5 logos (Cloudplex, TYTOTONE, Bloopglow, Zingzap, Junotwig), hover swaps grey→brand-color SVG.
4. WHY PARLEY — exact port of framer "Benefit cards": row height 420, gap 12, cards vertically centered. Closed card: surface #eeede6, radius 12, padding 20/20/40, number in DM Sans 500 52px rgb(221,216,211), mosaic block 164px tall (01 mosaic-a.png, 02 mosaic-d.png, 03 mosaic-b.png, 04 mosaic-c.png), single-line 20px title at bottom. Open card: white, radius 20, padding 8, 352px wide × 440 tall (overhangs the 420 row), shadow 0 12px 16px #ebe8e4, benefit image (benefit-1/parleys-plan/benefit-3/benefit-4.png) radius 12, content padding 20 gap 20 with 32px DM Sans title + 16px desc. Hovering any closed card opens it with tween cubic-bezier(0.34,1.2,0.64,1) 400ms; the selection is STICKY — nothing resets when the pointer leaves (framer wires onMouseEnter → SET_VARIANT with no reverse handler).
5. INTELLIGENT DELEGATION — scrollytelling: 380vh scroll region, sticky 100vh pin. 4 feature tabs advance as scroll passes 0/25/50/75% triggers; each swaps the mock image with fade+rise. Feature order: Natural language commands, Multi-step task execution, Human-in-the-loop control, Persistent user profile. Clicking a tab scrolls to its trigger (smooth), with a 700ms guard lock.
6. TESTIMONIALS — exact port of framer "Review" card: white 373×346, radius 12, padding 20, column space-between. Quote 16px at opacity 0.8 (1 on hover). Avatar 52px radius 8 with 1.5px white border; name DM Sans 500 20px; role 16px opacity 0.5 (0.7 on hover). Hover fades in tcard-cloud.jpg painting (no scrim) and reveals a "Read on 𝕏" chip (ink bg, radius 4, padding 4/8, 12px text) at bottom-right. Marquee 60s linear, 10px gaps. Hover: card lifts, warm gradient (gradient-warm.jpg) fades in behind, "Read on 𝕏" pill slides up. Cards: James R. (CloudPlex), Sophie K. (Tytotone), Daniel M. (Bloopglow), Paul M. (ZingZap), Emily C. (Junotwig), Marcus T. (Pylon Foods).
7. PRICING — exact port of framer "Pricing": toggle track #eeede6 radius 8 padding 4, tabs padding 8/12 radius 8 text 16px Geist 400 (active = white bg, inactive text #68615a, "-15%" 500 dark). Cards: #eeede6 with 1px #ddd8d3 border, radius 12, padding 16, gap 20, column gap 20. Plan name DM Sans 500 italic 24; price "$0" DM Sans 500 32px with the period text 8px below (Geist 16 #68615a); features rows padding 8/0 with 8px brand squares, gap 12, 16px text; disabled rows keep the square at opacity 0 and text at rgba(37,31,25,.6). Pro card bg = pro-cloud.png with the same border. Buttons are real DOM instances of the button component (secondary/primary/secondary, full width). 3 cards (Solo $0 / Pro $49 featured / Teams $89): featured card shows cloud.jpg through transparent bg with a 22% white scrim; hovering any card cross-fades the cloud+scrim to it (opacity only — the background NEVER translates between cards) and lifts it 2px with a warm shadow. Feature rows 16px with 16px gaps, 8px orange square dots; disabled rows drop the dot, indent 20px, rgba(0,0,0,0.78). Card padding 20px. Buttons are the provided images (8px radius).
8. HOW IT WORKS — exact port of framer "Tab+images": canyon.png panel radius 24, padding 40/20, gap 40. Three CLICKABLE tab pills (gap 16, padding 8/12, radius 8, 16px Geist, rgba(255,255,255,.5) + 6px backdrop blur; active = solid white). Below, a stage (radius 25, bg #f7f7f4, aspect-ratio 1.53) that plays one of three Lottie animations via the self-hosted lottie.min.js player (SVG renderer, loop): hiw-1.json (Connect your tools), hiw-2.json (Brief & customize), hiw-3.json (Delegate everywhere). Clicking a pill cross-fades stages (320ms) and pauses the inactive players; the first animation lazy-loads via IntersectionObserver 600px before the panel enters view.
9. FAQ — 2-col grid (5fr/6fr): left badge FAQ, h2 "Questions answered.", "Still curious?", dark "Chat with us" button (orange chip chevron), faq-mosaic.png. Right: 5 `<details>` accordions (surface, radius 14), orange plus icon rotates 45° when open, height animated via WAAPI (expand 320ms spring, collapse 280ms standard), opening one closes the rest. Q&A text is embedded verbatim in the HTML below.
10. INTEGRATIONS — exact port of the framer ticker: two rows (gap 20) of 96×96 tiles, radius 12, bg rgba(235,232,228,.6), full-bleed 96px icon SVGs, inside a centered 800px window masked with radial-gradient(50% 122% at 50% 50%, black 0%, rgba(0,0,0,.8) 80.63%, transparent 100%). Velocity 20px/s (46.4s per half-loop), rows drift in opposite directions, no hover slowdown.
11. CTA — exact port of framer "Final CTA": panel height 500, radius 24, cta-sunset.png cover + a #251f19 overlay at 0.25 opacity. Content max-width 700, gap 20: 52px DM Sans 500 white centered title (no text-shadow), 16px white lede (max 500px), primary button.
12. FOOTER — exact port of framer "Footer": bg #eeede6; social buttons are 32×32 squares (radius 4, bg #e4e0dd, 18px icons in #68615a, hover bg #f7f7f4) with a 12px "Social media" label; 1px solid #d4cdc7 divider; tagline + 3 link columns with orange square bullets (Workflows: Lead enrichment, Inbound triage, Ticket triage · Company: Blog, Contact · Legal: 404, Waitlist); a 235px clipped block where the giant watermark.png (307px tall) is pinned at bottom:-101px so its lower third sits below the page edge, footer-mosaic.png centered over it, and the © row overlaid at bottom:23px; "© 2026 Parley. AI Agent template · Designed by Apollo Studio" + Terms&Conditions.

## BUTTON COMPONENT (exact port of framer "Buttons/button" — used in nav, hero, pricing ×3, FAQ, CTA)

Anatomy: root inline-flex, radius 8, padding 4px 12px 4px 4px, gap 12. Chip 36×36, radius 4, bg #f48d16, containing a 25×24 clipped window with TWO 24px chevron SVGs (stroke #251f19, width 1.5) side by side, resting at translateX(-23px); hover slides to translateX(0) over 400ms spring. Label is an 18px-tall clipped roller with two stacked copies (Geist 500 14/18, opacity .9); hover rolls translateY(-18px). Variants: primary = #251f19 bg + white label; secondary = #ffffff bg + #251f19 label; fbtn--full stretches to 100%.

## MOTION SPEC (must match exactly)

- Easings: --ease-spring cubic-bezier(0.32,0.72,0,1); --ease-standard cubic-bezier(0.2,0,0,1); --ease-out cubic-bezier(0.16,1,0.3,1).
- Hero expansion: progress = clamp(scrollY/500), eased = p·p·(3−2p); width lerps from container width→100vw, height 600→hero height, radius 18→0, img scale 1.8→1.0. Uses the sticky wrapper's measured left edge so responsive container padding never causes horizontal overflow.
- Nav: hides after 6px scroll-down delta, reveals on any scroll-up, always visible above 80px scrollY; gains blur+55% bg while over the hero image.
- Why-cards: width transition 278→330px, 380ms spring; content choreography 80/160/240ms staggers.
- Pricing cloud: 260ms opacity cross-fades only; lift 220ms transform + 240ms shadow.
- All scroll listeners are passive + rAF-throttled. prefers-reduced-motion collapses every animation and un-pins the scrollytelling.

## CONSTRAINTS

- Do not change any class name, pixel value, color, delay, duration, easing, copy string, or asset URL from the source below.
- The three source files below are COMPLETE and CANONICAL — write them verbatim (only rewriting `assets/` paths to the hosted URLs above if serving from a different origin).
- Serve as a static site; entry at `/`.

## VERIFY AFTER BUILD

Load the page and confirm: no console errors; hero expands smoothly to full-bleed within ~500px of scroll and settles; logo strip hover swaps color; Why-card 02 is expanded by default and re-settles after hover away; delegation pins for ~380vh and steps through all four tabs (clicking tab 3 jumps to it); testimonial marquee loops seamlessly and cards lift on hover; pricing cloud stays put and only cross-fades between cards; How-it-works inner pane pans up while pills advance 1→2→3; FAQ opens with animated height (dashed orange plus rotates 45°) and only one item open at a time; both integration rows drift in opposite directions inside the 800px masked window; no horizontal scrollbar at 1440/768/375 widths.

---

FILE: index.html
------------------------------ BEGIN index.html ------------------------------
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Parley — The AI agent that works with you, not just for you</title>
    <meta
      name="description"
      content="Parley thinks, plans, and acts alongside you — handling emails, scheduling, research, and complex workflows."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400;1,9..40,500;1,9..40,600&family=Geist:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css?v=4" />
  </head>
  <body>
    <!-- ============ TOP NAV ============ -->
    <div class="nav-bar">
      <nav class="nav">
        <a href="#hero" class="nav__brand" aria-label="Parley">
          <img src="assets/parley-logo.png" alt="Parley" width="78" height="26" />
        </a>
        <div class="nav__right">
          <ul class="nav__links">
            <li><a href="#delegation">Workflows</a></li>
            <li aria-hidden="true" class="nav__sep"></li>
            <li><a href="#pricing">Pricing</a></li>
            <li aria-hidden="true" class="nav__sep"></li>
            <li><a href="#footer">Contact</a></li>
            <li aria-hidden="true" class="nav__sep"></li>
            <li><a href="#">Blog</a></li>
          </ul>
          <a href="#cta" class="fbtn fbtn--primary"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Hire Parley</span><span aria-hidden="true">Hire Parley</span></span></a>
        </div>
      </nav>
    </div>

    <main class="page">
      <div class="container">
        <!-- ============ HERO ============ -->
        <section class="hero" id="hero">
          <div class="hero__sticky">
            <div class="hero__media" id="hero-media">
              <img class="hero__img" src="assets/hero.jpg" alt="" />
              <div class="hero__overlay"></div>
              <div class="hero__content">
                <h1 class="hero__headline">
                  The AI agent that<br />
                  works <em>with you</em>, not<br />
                  just for you
                </h1>
                <p class="hero__lede">
                  Parley thinks, plans, and acts alongside you, handling emails,
                  scheduling, research, and complex workflows so you can focus on
                  the work only you can do.
                </p>
                <a href="#pricing" class="fbtn fbtn--primary"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Start free trial</span><span aria-hidden="true">Start free trial</span></span></a>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ LOGO STRIP ============ -->
        <section class="logos">
          <p class="logos__label">Trusted by 200+ businesses</p>
          <ul class="logos__list" role="list">
            <li class="logo logo--cloudplex">
              <span class="logo__part logo__part--mark" style="--w:24px;--h:24px">
                <img class="logo__d" src="assets/logo-cloudplex-mark-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-cloudplex-mark-h.svg" alt="" />
              </span>
              <span class="logo__part logo__part--type" style="--w:88px;--h:19px">
                <img class="logo__d" src="assets/logo-cloudplex-type-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-cloudplex-type-h.svg" alt="" />
              </span>
            </li>
            <li class="logo logo--tytotone">
              <span class="logo__part logo__part--mark" style="--w:25px;--h:20px">
                <img class="logo__d" src="assets/logo-tytotone-mark-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-tytotone-mark-h.svg" alt="" />
              </span>
              <span class="logo__part logo__part--type" style="--w:90px;--h:16px">
                <img class="logo__d" src="assets/logo-tytotone-type-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-tytotone-type-h.svg" alt="" />
              </span>
            </li>
            <li class="logo logo--bloopglow">
              <span class="logo__part logo__part--mark" style="--w:28px;--h:24px">
                <img class="logo__d" src="assets/logo-bloopglow-mark-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-bloopglow-mark-h.svg" alt="" />
              </span>
              <span class="logo__part logo__part--type" style="--w:78px;--h:19px">
                <img class="logo__d" src="assets/logo-bloopglow-type-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-bloopglow-type-h.svg" alt="" />
              </span>
            </li>
            <li class="logo logo--zingzap">
              <span class="logo__part logo__part--mark" style="--w:27px;--h:22px">
                <img class="logo__d" src="assets/logo-zingzap-mark-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-zingzap-mark-h.svg" alt="" />
              </span>
              <span class="logo__part logo__part--type" style="--w:80px;--h:18px">
                <img class="logo__d" src="assets/logo-zingzap-type-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-zingzap-type-h.svg" alt="" />
              </span>
            </li>
            <li class="logo logo--junotwig">
              <span class="logo__part logo__part--type" style="--w:80px;--h:18px">
                <img class="logo__d" src="assets/logo-junotwig-d.svg" alt="" />
                <img class="logo__h" src="assets/logo-junotwig-h.svg" alt="" />
              </span>
            </li>
          </ul>
        </section>

        <!-- ============ WHY PARLEY ============ -->
        <section class="why" id="why">
          <header class="why__header">
            <div class="why__heading">
              <p class="badge">Why Parley</p>
              <h2 class="h2">A real partner,<br />not a chatbot in disguise</h2>
            </div>
            <p class="why__lede">
              Most AI tools answer questions. Parley takes initiative —
              anticipating needs, executing tasks, and growing smarter with every
              interaction.
            </p>
          </header>

          <div class="why-cards" id="why-cards" role="list">
            <article class="wcard" data-index="01" tabindex="0" role="listitem">
              <div class="wcard__closed" aria-hidden="true">
                <p class="wcard__number">01.</p>
                <div class="wcard__mosaic"><img src="assets/mosaic-a.png" alt="" loading="lazy" /></div>
                <h3 class="wcard__title-closed">Always context-aware</h3>
              </div>
              <div class="wcard__open">
                <div class="wcard__img"><img src="assets/benefit-1.png" alt="" loading="lazy" /></div>
                <div class="wcard__content">
                  <h3 class="wcard__title">Always context-aware</h3>
                  <p class="wcard__desc">Parley remembers your preferences, priorities, and past decisions — so you never have to repeat yourself. It understands your work the way a long-time colleague would.</p>
                </div>
              </div>
            </article>
            <article class="wcard is-active" data-index="02" tabindex="0" role="listitem">
              <div class="wcard__closed" aria-hidden="true">
                <p class="wcard__number">02.</p>
                <div class="wcard__mosaic"><img src="assets/mosaic-d.png" alt="" loading="lazy" /></div>
                <h3 class="wcard__title-closed">Takes real action</h3>
              </div>
              <div class="wcard__open">
                <div class="wcard__img"><img src="assets/parleys-plan.png" alt="" loading="lazy" /></div>
                <div class="wcard__content">
                  <h3 class="wcard__title">Takes real action</h3>
                  <p class="wcard__desc">Beyond suggestions, Parley executes — sending emails, booking meetings, updating records, and managing tasks across all your tools without constant hand-holding.</p>
                </div>
              </div>
            </article>
            <article class="wcard" data-index="03" tabindex="0" role="listitem">
              <div class="wcard__closed" aria-hidden="true">
                <p class="wcard__number">03.</p>
                <div class="wcard__mosaic"><img src="assets/mosaic-b.png" alt="" loading="lazy" /></div>
                <h3 class="wcard__title-closed">Connects everything</h3>
              </div>
              <div class="wcard__open">
                <div class="wcard__img"><img src="assets/benefit-3.png" alt="" loading="lazy" /></div>
                <div class="wcard__content">
                  <h3 class="wcard__title">Connects everything</h3>
                  <p class="wcard__desc">Slack, Notion, HubSpot, GitHub — all in one place. Parley connects to 60+ tools. One conversation updates everything, no extra work.</p>
                </div>
              </div>
            </article>
            <article class="wcard" data-index="04" tabindex="0" role="listitem">
              <div class="wcard__closed" aria-hidden="true">
                <p class="wcard__number">04.</p>
                <div class="wcard__mosaic"><img src="assets/mosaic-c.png" alt="" loading="lazy" /></div>
                <h3 class="wcard__title-closed">Gets better over time</h3>
              </div>
              <div class="wcard__open">
                <div class="wcard__img"><img src="assets/benefit-4.png" alt="" loading="lazy" /></div>
                <div class="wcard__content">
                  <h3 class="wcard__title">Gets better over time</h3>
                  <p class="wcard__desc">The longer you work together, the less you explain. Parley learns your tone, shortcuts, and rules. Today’s prompts become tomorrow’s one-word commands.</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- ============ INTELLIGENT DELEGATION ============ -->
        <section class="delegation" id="delegation">
          <div class="delegation__scroll" id="delegation-scroll">
            <div class="trigger" data-step="0"></div>
            <div class="trigger" data-step="1"></div>
            <div class="trigger" data-step="2"></div>
            <div class="trigger" data-step="3"></div>
            <div class="delegation__pin">
              <header class="delegation__header">
                <div class="delegation__heading">
                  <p class="badge">Intelligent Delegation</p>
                  <h2 class="h2">Tell Parley once.<br /><em>It handles the rest.</em></h2>
                </div>
                <p class="delegation__lede">
                  Describe a goal in plain language and Parley breaks it into steps,
                  selects the right tools, and executes, keeping you updated along
                  the way.
                </p>
              </header>
              <div class="delegation__inner">
                <ol class="features" role="tablist">
                  <li class="feature">
                    <button class="feature__btn" type="button" role="tab" data-step="0" aria-selected="true" aria-controls="mock-0">
                      <img class="feature__chevron" src="assets/arrows.svg" alt="" aria-hidden="true" />
                      <span class="feature__head">
                        <span class="feature__label">Natural language commands</span>
                        <span class="feature__desc">
                          Just speak naturally — "prep my Monday morning" or "follow up with leads who haven't replied in 5 days."
                        </span>
                      </span>
                    </button>
                  </li>
                  <li class="feature">
                    <button class="feature__btn" type="button" role="tab" data-step="1" aria-selected="false" aria-controls="mock-1">
                      <img class="feature__chevron" src="assets/arrows.svg" alt="" aria-hidden="true" />
                      <span class="feature__head">
                        <span class="feature__label">Multi-step task execution</span>
                        <span class="feature__desc">
                          From a single intent, Parley plans the full sequence, runs every step, and recovers when something breaks.
                        </span>
                      </span>
                    </button>
                  </li>
                  <li class="feature">
                    <button class="feature__btn" type="button" role="tab" data-step="2" aria-selected="false" aria-controls="mock-2">
                      <img class="feature__chevron" src="assets/arrows.svg" alt="" aria-hidden="true" />
                      <span class="feature__head">
                        <span class="feature__label">Human-in-the-loop control</span>
                        <span class="feature__desc">
                          Stay in charge of high-stakes actions. Parley pauses for approval whenever the call should be yours.
                        </span>
                      </span>
                    </button>
                  </li>
                  <li class="feature">
                    <button class="feature__btn" type="button" role="tab" data-step="3" aria-selected="false" aria-controls="mock-3">
                      <img class="feature__chevron" src="assets/arrows.svg" alt="" aria-hidden="true" />
                      <span class="feature__head">
                        <span class="feature__label">Persistent user profile</span>
                        <span class="feature__desc">
                          Knows your team, your tools, your customers, across every session, never starting from zero.
                        </span>
                      </span>
                    </button>
                  </li>
                </ol>

                <div class="stage" aria-live="polite">
                  <div class="mock is-active" id="mock-0" role="tabpanel" data-step="0">
                    <img class="mock__img" src="assets/mock-0.png" srcset="assets/mock-0.png 1x, assets/mock-0@2x.png 2x" alt="" />
                  </div>
                  <div class="mock" id="mock-1" role="tabpanel" data-step="1" hidden>
                    <img class="mock__img" src="assets/mock-2.png" srcset="assets/mock-2.png 1x, assets/mock-2@2x.png 2x" alt="" />
                  </div>
                  <div class="mock" id="mock-2" role="tabpanel" data-step="2" hidden>
                    <img class="mock__img" src="assets/mock-1.png" srcset="assets/mock-1.png 1x, assets/mock-1@2x.png 2x" alt="" />
                  </div>
                  <div class="mock" id="mock-3" role="tabpanel" data-step="3" hidden>
                    <img class="mock__img" src="assets/mock-3.png" srcset="assets/mock-3.png 1x, assets/mock-3@2x.png 2x" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ TESTIMONIALS ============ -->
        <section class="testimonials bleed" id="testimonials">
          <header class="testimonials__header">
            <p class="badge">What people say</p>
            <h2 class="h2">Teams that work<br />with Parley, not around it</h2>
            <p class="testimonials__lede">
              From solo founders to enterprise teams — here's what our users have to
              say after making Parley their daily partner.
            </p>
          </header>

          <div class="marquee">
            <ul class="marquee__track" id="track" role="list">
              <li class="tcard">
                <p class="tcard__quote">
                  Parley does what every other AI tool promised but never delivered
                  — it actually takes things off my plate. My inbox went from 200
                  unread to zero, daily.
                </p>
                <figure class="tcard__author">
                  <img class="tcard__avatar" src="assets/avatar-james.png" srcset="assets/avatar-james.png 1x, assets/avatar-james@2x.png 2x" alt="" />
                  <figcaption>
                    <span class="tcard__name">James R.</span>
                    <span class="tcard__role">CEO, CloudPlex</span>
                  </figcaption>
                </figure>
                <a class="tcard__source" href="https://x.com/" target="_blank" rel="noopener" aria-label="Read on X">
                  <span>Read on</span>
                  <svg class="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
                </a>
              </li>
              <li class="tcard">
                <p class="tcard__quote">
                  I was skeptical about 'AI partners' — but Parley learned my
                  communication style in a week and now drafts emails I barely need
                  to edit. Genuinely impressive.
                </p>
                <figure class="tcard__author">
                  <img class="tcard__avatar" src="assets/avatar-sophie.png" srcset="assets/avatar-sophie.png 1x, assets/avatar-sophie@2x.png 2x" alt="" />
                  <figcaption>
                    <span class="tcard__name">Sophie K.</span>
                    <span class="tcard__role">VP Marketing, Tytotone</span>
                  </figcaption>
                </figure>
                <a class="tcard__source" href="https://x.com/" target="_blank" rel="noopener" aria-label="Read on X">
                  <span>Read on</span>
                  <svg class="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
                </a>
              </li>
              <li class="tcard">
                <p class="tcard__quote">
                  The CRM follow-up workflow alone saved our sales team 12 hours a
                  week. And the meeting notes are better than anything our team was
                  writing manually.
                </p>
                <figure class="tcard__author">
                  <img class="tcard__avatar" src="assets/avatar-daniel.png" srcset="assets/avatar-daniel.png 1x, assets/avatar-daniel@2x.png 2x" alt="" />
                  <figcaption>
                    <span class="tcard__name">Daniel M.</span>
                    <span class="tcard__role">Head of Sales, Bloopglow</span>
                  </figcaption>
                </figure>
                <a class="tcard__source" href="https://x.com/" target="_blank" rel="noopener" aria-label="Read on X">
                  <span>Read on</span>
                  <svg class="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
                </a>
              </li>
              <li class="tcard">
                <p class="tcard__quote">
                  Parley is the first AI tool that actually reduces my workload. I
                  stay on top of emails, clients, and meetings without the usual
                  chaos.
                </p>
                <figure class="tcard__author">
                  <img class="tcard__avatar" src="assets/avatar-paul.png" alt="" />
                  <figcaption>
                    <span class="tcard__name">Paul M.</span>
                    <span class="tcard__role">Operations Director, ZingZap</span>
                  </figcaption>
                </figure>
                <a class="tcard__source" href="https://x.com/" target="_blank" rel="noopener" aria-label="Read on X">
                  <span>Read on</span>
                  <svg class="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
                </a>
              </li>
              <li class="tcard">
                <p class="tcard__quote">
                  Parley feels like the assistant I always needed. It keeps
                  conversations organized, handles follow-ups, and saves me hours
                  every week.
                </p>
                <figure class="tcard__author">
                  <img class="tcard__avatar" src="assets/avatar-emily.png" alt="" />
                  <figcaption>
                    <span class="tcard__name">Emily C.</span>
                    <span class="tcard__role">Head of Client Success, Junotwig</span>
                  </figcaption>
                </figure>
                <a class="tcard__source" href="https://x.com/" target="_blank" rel="noopener" aria-label="Read on X">
                  <span>Read on</span>
                  <svg class="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
                </a>
              </li>
              <li class="tcard">
                <p class="tcard__quote">
                  Onboarded Parley on a Tuesday. By Friday it had cleared two weeks
                  of backlog and surfaced three deals I would have missed. It earns
                  its seat on the team.
                </p>
                <figure class="tcard__author">
                  <img class="tcard__avatar" src="assets/avatar-james.png" srcset="assets/avatar-james.png 1x, assets/avatar-james@2x.png 2x" alt="" />
                  <figcaption>
                    <span class="tcard__name">Marcus T.</span>
                    <span class="tcard__role">Operations Lead, Pylon Foods</span>
                  </figcaption>
                </figure>
                <a class="tcard__source" href="https://x.com/" target="_blank" rel="noopener" aria-label="Read on X">
                  <span>Read on</span>
                  <svg class="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
                </a>
              </li>
            </ul>
          </div>
        </section>

        <!-- ============ PRICING ============ -->
        <section class="pricing" id="pricing">
          <header class="pricing__header">
            <div class="pricing__heading">
              <p class="badge">Pricing</p>
              <h2 class="h2">
                Simple, transparent<br />pricing. <em>No surprises.</em>
              </h2>
            </div>
            <div class="pricing__side">
              <p class="pricing__lede">
                Start free, scale as you grow. Every plan includes core features —
                upgrade when you need more power or seats.
              </p>
              <div class="toggle" role="tablist" aria-label="Billing period">
                <button class="toggle__btn is-active" type="button" role="tab" aria-selected="true">Monthly</button>
                <button class="toggle__btn" type="button" role="tab" aria-selected="false">
                  Annual <span class="toggle__off">-15%</span>
                </button>
              </div>
            </div>
          </header>

          <div class="plans" id="plans">
            <article class="plan" data-index="0">
              <h3 class="plan__name">Solo</h3>
              <div class="plan__price">
                <span class="plan__currency">$</span><span class="plan__amount">0</span>
              </div>
              <p class="plan__period">Free forever</p>
              <p class="plan__desc">
                Perfect for individuals getting started with AI-powered
                productivity. No credit card required.
              </p>
              <ul class="plan-features">
                <li><span class="plan-features__dot"></span>1 connected workspace</li>
                <li><span class="plan-features__dot"></span>Up to 5 integrations</li>
                <li><span class="plan-features__dot"></span>100 AI tasks / month</li>
                <li><span class="plan-features__dot"></span>Basic memory (30 days)</li>
                <li><span class="plan-features__dot"></span>Email + calendar workflows</li>
                <li class="is-off"><span class="plan-features__dot"></span>Custom workflows</li>
                <li class="is-off"><span class="plan-features__dot"></span>Priority support</li>
                <li class="is-off"><span class="plan-features__dot"></span>Team features</li>
              </ul>
              <a href="#" class="fbtn fbtn--secondary fbtn--full"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Get started free</span><span aria-hidden="true">Get started free</span></span></a>
            </article>

            <article class="plan is-featured" data-index="1">
              <h3 class="plan__name">Pro</h3>
              <div class="plan__price">
                <span class="plan__currency">$</span><span class="plan__amount">49</span>
              </div>
              <p class="plan__period">per month, billed monthly</p>
              <p class="plan__desc">
                The full Parley experience for professionals who want a true AI
                partner in their work.
              </p>
              <ul class="plan-features">
                <li><span class="plan-features__dot"></span>1 connected workspace</li>
                <li><span class="plan-features__dot"></span>Up to 5 integrations</li>
                <li><span class="plan-features__dot"></span>100 AI tasks / month</li>
                <li><span class="plan-features__dot"></span>Long-term memory (forever)</li>
                <li><span class="plan-features__dot"></span>All workflow templates</li>
                <li><span class="plan-features__dot"></span>Custom workflows &amp; automations</li>
                <li><span class="plan-features__dot"></span>Priority support</li>
                <li class="is-off"><span class="plan-features__dot"></span>Team features</li>
              </ul>
              <a href="#" class="fbtn fbtn--primary fbtn--full"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Start 14 days free trial</span><span aria-hidden="true">Start 14 days free trial</span></span></a>
            </article>

            <article class="plan" data-index="2">
              <h3 class="plan__name">Teams</h3>
              <div class="plan__price">
                <span class="plan__currency">$</span><span class="plan__amount">89</span>
              </div>
              <p class="plan__period">per seat / month</p>
              <p class="plan__desc">
                For growing teams that want shared intelligence, role-based
                access, and centralized billing.
              </p>
              <ul class="plan-features">
                <li><span class="plan-features__dot"></span>1 connected workspace</li>
                <li><span class="plan-features__dot"></span>Up to 5 integrations</li>
                <li><span class="plan-features__dot"></span>100 AI tasks / month</li>
                <li><span class="plan-features__dot"></span>Basic memory (30 days)</li>
                <li><span class="plan-features__dot"></span>Email + calendar workflows</li>
                <li><span class="plan-features__dot"></span>Custom workflows</li>
                <li><span class="plan-features__dot"></span>Priority support</li>
                <li><span class="plan-features__dot"></span>Team features</li>
              </ul>
              <a href="#" class="fbtn fbtn--secondary fbtn--full"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Talk to sales</span><span aria-hidden="true">Talk to sales</span></span></a>
            </article>
          </div>
        </section>

        <!-- ============ HOW IT WORKS ============ -->
        <section class="hiw" id="how-it-works">
          <header class="hiw__header">
            <p class="badge">How it works</p>
            <h2 class="h2 h2--center">
              From ask to done. <em>Without<br />the back-and-forth.</em>
            </h2>
          </header>

          <div class="hiw__panel" id="hiw-panel">
            <div class="hiw__pills" role="list">
              <button class="hiw__pill is-active" data-step="0" type="button" aria-pressed="true">Connect your tools</button>
              <button class="hiw__pill" data-step="1" type="button" aria-pressed="false">Brief &amp; customize</button>
              <button class="hiw__pill" data-step="2" type="button" aria-pressed="false">Delegate everywhere</button>
            </div>

            <div class="hiw__stage">
              <div class="hiw__lottie is-active" data-step="0"></div>
              <div class="hiw__lottie" data-step="1" hidden></div>
              <div class="hiw__lottie" data-step="2" hidden></div>
            </div>
          </div>
        </section>

        <!-- ============ FAQ ============ -->
        <section class="faq" id="faq">
          <div class="faq__left">
            <p class="badge">FAQ</p>
            <h2 class="h2">Questions<br />answered.</h2>
            <p class="faq__sub">Still curious?</p>
            <a href="#footer" class="fbtn fbtn--primary"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Chat with us</span><span aria-hidden="true">Chat with us</span></span></a>
            <img class="faq__mosaic" src="assets/faq-mosaic.png" alt="" loading="lazy" />
          </div>

          <div class="faq__list">
            <details class="faq__item">
              <summary>
                <span>How is Parley different from ChatGPT and Copilot?</span>
                <svg class="faq__plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M1.5 8h13" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.1 1.7"/></svg>
              </summary>
              <div class="faq__answer">
                <p>
                  Parley isn't a chatbot — it's an action-taking agent. While tools
                  like ChatGPT generate text responses, Parley connects to your real
                  tools, executes multi-step tasks, remembers your context across
                  sessions, and proactively manages your work. It's the difference
                  between answering a question and doing the job.
                </p>
              </div>
            </details>
            <details class="faq__item">
              <summary>
                <span>Is my data safe with Parley?</span>
                <svg class="faq__plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M1.5 8h13" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.1 1.7"/></svg>
              </summary>
              <div class="faq__answer">
                <p>
                  Yes — and it's not a checkbox answer. Your data is encrypted in
                  transit and at rest, never used to train shared models, and stays
                  inside your workspace. Parley is SOC 2 Type II and GDPR-compliant,
                  with EU data residency available on request. You own every record
                  we touch, and you can delete it from us in one click.
                </p>
              </div>
            </details>
            <details class="faq__item">
              <summary>
                <span>What happens if Parley makes a mistake?</span>
                <svg class="faq__plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M1.5 8h13" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.1 1.7"/></svg>
              </summary>
              <div class="faq__answer">
                <p>
                  Every action Parley takes is logged with field-level reasoning, so
                  mistakes are traceable, not mysterious. High-impact actions stay in
                  human-approval mode by default — Parley drafts, you confirm. If
                  something does slip through, one-click undo reverses the change in
                  your connected tools, and Parley learns from the correction so the
                  same mistake doesn't ship twice.
                </p>
              </div>
            </details>
            <details class="faq__item">
              <summary>
                <span>How long does setup take?</span>
                <svg class="faq__plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M1.5 8h13" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.1 1.7"/></svg>
              </summary>
              <div class="faq__answer">
                <p>
                  About 8 minutes for your first workflow. Connect one tool (HubSpot,
                  Slack, or Zendesk to start), pick a template, run it in test mode
                  against a real record. No implementation calls, no four-week pilot.
                  The teams shipping fastest have a workflow running before lunch on
                  day one — and a second one before they head home.
                </p>
              </div>
            </details>
            <details class="faq__item">
              <summary>
                <span>Can I build custom workflows without code?</span>
                <svg class="faq__plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M1.5 8h13" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.1 1.7"/></svg>
              </summary>
              <div class="faq__answer">
                <p>
                  Yes — describe what you do in plain English and Parley drafts the
                  workflow for you to review. Edit any step the same way: "skip leads
                  from competitors," "only ping me about deals over $50k." Templates
                  are forkable on a Friday afternoon. Engineers stay in their queue;
                  RevOps, Support, and Ops own their workflows directly.
                </p>
              </div>
            </details>
          </div>
        </section>

        <!-- ============ INTEGRATIONS ============ -->
        <section class="integrations" id="integrations">
          <header class="integrations__header">
            <p class="badge">Integrations</p>
            <h2 class="h2 h2--center">
              Connect your workflow.<br /><em>Parley meets you there.</em>
            </h2>
            <p class="integrations__lede">
              Slack, Linear, Notion, GitHub and 60+ more. Parley triggers actions,
              fetches context, and keeps things in sync — right where your team
              already works.
            </p>
          </header>

          <div class="int-marquee">
            <div class="int-marquee__row" data-dir="left">
              <div class="int-marquee__set">
                <span class="int-tile"><img src="assets/icons/onenote.svg" alt="OneNote" /></span>
                <span class="int-tile"><img src="assets/icons/notion.svg" alt="Notion" /></span>
                <span class="int-tile"><img src="assets/icons/trello.svg" alt="Trello" /></span>
                <span class="int-tile"><img src="assets/icons/linear.svg" alt="Linear" /></span>
                <span class="int-tile"><img src="assets/icons/loom.svg" alt="Loom" /></span>
                <span class="int-tile"><img src="assets/icons/zapier.svg" alt="Zapier" /></span>
                <span class="int-tile"><img src="assets/icons/gcal.svg" alt="Google Calendar" /></span>
                <span class="int-tile"><img src="assets/icons/slack.svg" alt="Slack" /></span>
              </div>
              <div class="int-marquee__set" aria-hidden="true">
                <span class="int-tile"><img src="assets/icons/onenote.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/notion.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/trello.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/linear.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/loom.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/zapier.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/gcal.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/slack.svg" alt="" /></span>
              </div>
            </div>
            <div class="int-marquee__row" data-dir="right">
              <div class="int-marquee__set">
                <span class="int-tile"><img src="assets/icons/loom.svg" alt="Loom" /></span>
                <span class="int-tile"><img src="assets/icons/trello.svg" alt="Trello" /></span>
                <span class="int-tile"><img src="assets/icons/notion.svg" alt="Notion" /></span>
                <span class="int-tile"><img src="assets/icons/slack.svg" alt="Slack" /></span>
                <span class="int-tile"><img src="assets/icons/zapier.svg" alt="Zapier" /></span>
                <span class="int-tile"><img src="assets/icons/onenote.svg" alt="OneNote" /></span>
                <span class="int-tile"><img src="assets/icons/gcal.svg" alt="Google Calendar" /></span>
                <span class="int-tile"><img src="assets/icons/linear.svg" alt="Linear" /></span>
              </div>
              <div class="int-marquee__set" aria-hidden="true">
                <span class="int-tile"><img src="assets/icons/loom.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/trello.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/notion.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/slack.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/zapier.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/onenote.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/gcal.svg" alt="" /></span>
                <span class="int-tile"><img src="assets/icons/linear.svg" alt="" /></span>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ CTA ============ -->
        <section class="cta" id="cta">
          <div class="cta__panel">
            <img class="cta__bg" src="assets/cta-sunset.png" alt="" loading="lazy" />
            <div class="cta__overlay"></div>
            <div class="cta__content">
              <h2 class="cta__title">Meet your AI partner.<br /><em>Built for real work</em></h2>
              <p class="cta__lede">
                Join 12,000+ professionals who use Parley as their daily partner.<br />
                Set up in minutes. Cancel anytime. Your first 100 tasks are on us.
              </p>
              <a href="#pricing" class="fbtn fbtn--primary"><span class="fbtn__chip"><span class="fbtn__arrows"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span><span class="fbtn__label"><span>Get started free</span><span aria-hidden="true">Get started free</span></span></a>
            </div>
          </div>
        </section>
      </div>

      <!-- ============ FOOTER ============ -->
      <footer class="footer" id="footer">
        <div class="footer__inner">
          <div class="footer__top">
            <img class="footer__logo" src="assets/parley-logo.png" alt="Parley" width="78" height="26" />
            <div class="footer__social">
              <span class="footer__social-label">Social media</span>
              <div class="footer__social-btns">
              <a class="footer__social-btn" href="https://x.com/" target="_blank" rel="noopener" aria-label="X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"/></svg>
              </a>
              <a class="footer__social-btn" href="https://www.threads.net/" target="_blank" rel="noopener" aria-label="Threads">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.18 2c2.7 0 4.85.9 6.38 2.68 1.36 1.58 2.07 3.77 2.12 6.52v.1c0 2.8-.7 5.04-2.1 6.66C17.06 19.72 14.9 20.6 12.2 20.6c-2.35 0-4.26-.65-5.68-1.93C4.9 17.2 4.06 15 4.06 12.3c0-2.68.84-4.88 2.44-6.36C7.93 4.6 9.84 3.95 12.18 2zm.02 1.9c-1.9 0-3.42.52-4.5 1.53-1.2 1.12-1.83 2.83-1.83 4.87 0 2.06.62 3.77 1.8 4.9 1.06 1 2.58 1.5 4.52 1.5 2.16 0 3.83-.66 4.96-1.96 1.06-1.22 1.6-3 1.6-5.28-.04-2.3-.6-4.07-1.63-5.27-1.13-1.3-2.8-1.96-4.92-1.96zm.25 3.62c1.3 0 2.34.4 3.08 1.17.6.63.97 1.5 1.1 2.57.5.26.93.6 1.25 1.03.5.65.74 1.48.68 2.4-.07 1.16-.55 2.15-1.4 2.86-.8.68-1.87 1.03-3.1 1.03-1.5 0-2.7-.52-3.48-1.5-.68-.87-1-2.04-.92-3.4l1.9.12c-.05.98.14 1.76.55 2.28.42.53 1.08.8 1.95.8.83 0 1.5-.2 1.96-.6.44-.37.7-.9.73-1.55.03-.5-.08-.92-.33-1.24-.2-.27-.5-.48-.87-.64-.1.63-.32 1.17-.66 1.6-.53.66-1.3 1-2.24.97-.83-.02-1.55-.3-2.03-.8-.5-.5-.74-1.16-.7-1.87.06-1.4 1.13-2.34 2.73-2.4.5-.02.98.02 1.42.1-.1-.5-.3-.9-.58-1.18-.38-.4-.94-.6-1.66-.6h-.04c-.6 0-1.36.16-1.85.92l-1.6-1.07c.8-1.2 2.03-1.87 3.5-1.9zm-.02 5.14c-.9.04-1.44.4-1.46 1-.01.3.1.55.3.74.23.22.58.35 1 .36.5.02.9-.14 1.2-.5.23-.28.4-.68.47-1.2-.44-.13-.95-.42-1.5-.4z"/></svg>
              </a>
              <a class="footer__social-btn" href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>
              </a>
              </div>
            </div>
          </div>

          <div class="footer__mid">
            <p class="footer__tagline">
              Your AI partner for email, calendar, research, and everything in
              between. Built for people who want to do their best work
            </p>
            <nav class="footer__cols" aria-label="Footer">
              <div class="footer__col">
                <p class="footer__col-title"><span class="footer__square"></span>Workflows</p>
                <a href="#delegation">Lead enrichment</a>
                <a href="#delegation">Inbound triage</a>
                <a href="#delegation">Ticket triage</a>
              </div>
              <div class="footer__col">
                <p class="footer__col-title"><span class="footer__square"></span>Company</p>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
              <div class="footer__col">
                <p class="footer__col-title"><span class="footer__square"></span>Legal</p>
                <a href="#">404</a>
                <a href="#">Waitlist</a>
              </div>
            </nav>
          </div>

          <div class="footer__mark">
            <img class="footer__watermark" src="assets/watermark.png" alt="" loading="lazy" />
            <img class="footer__mosaic" src="assets/footer-mosaic.png" alt="" loading="lazy" />

          <div class="footer__bottom">
            <p>© 2026 Parley. AI Agent template · Designed by <a href="https://apollostudio.design" target="_blank" rel="noopener">Apollo Studio</a></p>
            <a href="#">Terms&amp;Conditions</a>
          </div>
          </div>
        </div>
      </footer>
    </main>
    <script src="assets/lottie.min.js"></script>
    <script src="script.js?v=4"></script>
  </body>
</html>

------------------------------- END index.html -------------------------------

FILE: styles.css
------------------------------ BEGIN styles.css ------------------------------
/* ============================================================
   PARLEY — single home page
   Merged from parley-hero, parley-cards-v2, parley-testimonials,
   parley-pricing + new sections (how-it-works, faq, integrations,
   cta, footer) matching parley.framer.ai structure.
   ============================================================ */

:root {
  --bg: #f7f7f4;
  --surface: #eeede6;
  --surface-hover: #e8e6dd;
  --surface-warm: #f5f4f0;
  --warm-tint: #fbf8f3;
  --white: #ffffff;
  --grey-900: #251f19;
  --grey-800: #251f19;
  --grey-700: #5c544c;
  --grey-600: #68615a;
  --grey-500: #8e867d;
  --grey-400: #948b81;
  --grey-300: #dcd8cc;
  --orange-500: #f48d16;
  --grey-f400: #d4cdc7;
  --grey-f200: #e4e0dd;
  --grey-f100: #ebe8e4;
  --grey-f50: rgba(235, 232, 228, 0.6);
  --card-line: #ddd8d3;
  --orange-300: #f8c28a;
  --green-500: #1fbe6d;
  --ink: #251f19;

  /* Card body copy — darker than grey-600 so secondary text clears AA 4.5:1
     over the amber portion of the cloud bg. */
  --card-body: #3d342c;

  --hairline: rgba(26, 23, 20, 0.08);
  --hairline-strong: rgba(26, 23, 20, 0.14);

  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* why-cards timing */
  --d-grow: 380ms;
  --d-content: 280ms;
  --d-quick: 140ms;

  --wcard-h: 567px;
  --wcol-base: 278px;
  --wcol-active: 330px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--grey-800);
  font-family: "Geist", system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

img {
  display: block;
  max-width: 100%;
}

.page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
}

/* Full-bleed helper: section escapes the 1200 container */
.bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

/* ---------- shared type ---------- */

.badge {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
  color: var(--orange-500);
}

.h2 {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 52px;
  line-height: 1.05;
  color: var(--grey-800);
  letter-spacing: -0.01em;
  font-variation-settings: "opsz" 14;
  text-wrap: balance;
}

.h2 em {
  font-style: italic;
  color: var(--grey-400);
  font-weight: 500;
}

.h2--center {
  text-align: center;
}

/* ============ TOP NAV ============ */

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg);
  display: flex;
  justify-content: center;
  transform: translateY(0);
  transition:
    transform 320ms var(--ease-standard),
    background-color 240ms var(--ease-standard),
    backdrop-filter 240ms var(--ease-standard);
  will-change: transform;
}

.nav-bar.is-over-hero {
  background: rgba(247, 247, 244, 0.55);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

.nav-bar.is-hidden {
  transform: translateY(-100%);
}

.nav {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
}

.nav__brand {
  display: inline-flex;
  align-items: center;
}

.nav__brand img {
  display: block;
  height: 18px;
  width: auto;
}

.nav__right {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav__links a {
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  color: var(--grey-800);
  text-decoration: none;
  transition: opacity 200ms var(--ease-standard);
}

.nav__links a:hover {
  opacity: 0.65;
}

.nav__sep {
  width: 4px;
  height: 4px;
  background: var(--grey-900);
  user-select: none;
  flex-shrink: 0;
}

.nav__cta,
.hero__cta {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: transform 200ms var(--ease-standard);
}

.nav__cta img,
.hero__cta img {
  display: block;
  height: 42px;
  width: auto;
}

.nav__cta:hover,
.hero__cta:hover {
  transform: translateY(-1px);
}

/* ============ HERO ============ */

.hero {
  position: relative;
  width: 100%;
  padding-top: 80px;
  height: 700px;
  z-index: 1;
}

.hero__sticky {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero__media {
  --w: 100%;
  --h: 600px;
  --l: 0px;
  --t: 0px;
  --radius: 18px;
  position: absolute;
  width: var(--w);
  height: var(--h);
  left: var(--l);
  top: var(--t);
  border-radius: var(--radius);
  overflow: hidden;
  background: #c8855d;
  will-change: width, height, left, top, border-radius;
}

.hero__img {
  --img-scale: 1.8;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 70%;
  transform: scale(var(--img-scale));
  transform-origin: center 70%;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.hero__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
  text-align: center;
  color: var(--white);
  z-index: 2;
}

.hero__headline {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  font-size: clamp(40px, 5.4vw, 68px);
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--white);
  text-wrap: balance;
  max-width: 1200px;
  text-shadow: 0 2px 24px rgba(26, 23, 20, 0.18);
}

.hero__headline em {
  font-style: italic;
  font-weight: 400;
}

.hero__lede {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.92);
  max-width: 480px;
  text-shadow: 0 1px 12px rgba(26, 23, 20, 0.25);
}

.hero__cta {
  margin-top: 8px;
}

/* ============ LOGO STRIP ============ */

.logos {
  position: relative;
  z-index: 2;
  background: var(--bg);
  width: 100%;
  padding: 60px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logos__label {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--grey-800);
  letter-spacing: 0.01em;
}

.logos__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo__part {
  position: relative;
  display: inline-block;
  width: var(--w);
  height: var(--h);
  flex-shrink: 0;
}

.logo__part img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.logo__part .logo__d {
  opacity: 1;
  transition: opacity 240ms var(--ease-standard);
}

.logo__part .logo__h {
  opacity: 0;
  transition: opacity 240ms var(--ease-standard);
}

.logo:hover .logo__d {
  opacity: 0;
}

.logo:hover .logo__h {
  opacity: 1;
}

/* ============ WHY PARLEY (expanding cards) ============ */

.why {
  width: 100%;
  padding: 140px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.why__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  width: 100%;
}

.why__heading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 540px;
}

.why__lede {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.35;
  color: var(--grey-600);
  width: 420px;
  text-wrap: pretty;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(2px, -3px); }
  50% { transform: translate(-1px, 2px); }
  75% { transform: translate(-2px, -1px); }
}

/* ============ DELEGATION ============ */

.delegation {
  position: relative;
  z-index: 2;
  width: 100%;
  background: var(--bg);
}

.delegation__scroll {
  position: relative;
  width: 100%;
  height: 380vh;
}

.trigger {
  position: absolute;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.trigger[data-step="0"] { top: 0; }
.trigger[data-step="1"] { top: 25%; }
.trigger[data-step="2"] { top: 50%; }
.trigger[data-step="3"] { top: 75%; }

.delegation__pin {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 60px;
  padding: 120px 0;
  box-sizing: border-box;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.delegation__header,
.delegation__inner {
  transform: translateZ(0);
}

.delegation__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  width: 100%;
}

.delegation__heading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 540px;
}

.delegation__lede {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.35;
  color: var(--grey-600);
  width: 420px;
}

.delegation__inner {
  display: flex;
  align-items: stretch;
  gap: 40px;
  width: 100%;
}

.features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 438px;
  flex-shrink: 0;
}

.feature__btn {
  appearance: none;
  background: none;
  border: 0;
  padding: 20px 0;
  width: 100%;
  display: block;
  position: relative;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.feature__btn:focus-visible {
  outline: 2px solid var(--orange-500);
  outline-offset: 4px;
  border-radius: 8px;
}

.feature__chevron {
  position: absolute;
  left: -32px;
  top: 28px;
  width: 21px;
  height: 16px;
  display: block;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10px) scale(0.7);
  transition: opacity 0s, transform 0s, visibility 0s 100ms;
}

.feature__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.feature__label {
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 24px;
  line-height: 1.1;
  color: var(--grey-400);
  transition: color 320ms var(--ease-standard);
}

.feature__desc {
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  color: var(--grey-600);
  max-width: 360px;
  text-wrap: balance;
  display: block;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-height 320ms var(--ease-spring),
    opacity 240ms var(--ease-standard);
}

.feature__btn[aria-selected="true"] .feature__chevron {
  opacity: 1;
  visibility: visible;
  transform: translateX(0) scale(1);
  transition:
    opacity 280ms var(--ease-standard) 80ms,
    transform 480ms var(--ease-spring) 80ms,
    visibility 0s;
}

.feature__btn[aria-selected="true"] .feature__label {
  color: var(--grey-800);
}

.feature__btn[aria-selected="true"] .feature__desc {
  max-height: 200px;
  opacity: 1;
}

.stage {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 564px;
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  isolation: isolate;
}

.mock {
  position: absolute;
  inset: 0;
  padding: 48px 0 0 54px;
  opacity: 0;
  transform: translateY(12px) scale(0.99);
  transition:
    opacity 360ms var(--ease-standard),
    transform 480ms var(--ease-spring);
  pointer-events: none;
}

.mock[hidden] {
  display: block;
}

.mock.is-active {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.mock__img {
  display: block;
  width: 860px;
  height: auto;
  max-width: none;
  max-height: none;
  border-radius: 24px;
  box-shadow: 0 28px 70px -23px rgba(26, 23, 20, 0.18);
}

/* ============ TESTIMONIALS ============ */

.testimonials {
  position: relative;
  padding: 120px 0;
  display: flex;
  flex-direction: column;
  gap: 60px;
  background: var(--bg);
}

.testimonials__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 0 24px;
}

.testimonials__lede {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  color: var(--grey-600);
  max-width: 480px;
  text-wrap: balance;
}

.marquee {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: clip;
  overflow-y: visible;
  padding: 24px 0;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 100px,
    black calc(100% - 100px),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 100px,
    black calc(100% - 100px),
    transparent 100%
  );
}

/* ============ PRICING ============ */

.pricing {
  padding: 120px 0;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.pricing__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
}

.pricing__heading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
}

.pricing__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 40px;
  max-width: 420px;
  /* Align description first line with the h2 first line */
  padding-top: 26px;
}

.pricing__lede {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  color: var(--grey-600);
  text-align: right;
}

/* ============ HOW IT WORKS ============ */

.hiw {
  padding: 40px 0 120px;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.hiw__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

/* ============ FAQ ============ */

.faq {
  padding: 40px 0 140px;
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: 60px;
  align-items: start;
}

.faq__left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.faq__sub {
  margin: 20px 0 6px;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: var(--grey-600);
}

.faq__mosaic {
  margin-top: 48px;
  width: 530px;
  max-width: 90%;
  height: auto;
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq__item {
  background: var(--surface);
  border-radius: 14px;
  overflow: hidden;
}

.faq__item summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  cursor: pointer;
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 1.3;
  color: var(--grey-900);
  transition: background-color 200ms var(--ease-standard);
}

.faq__item summary::-webkit-details-marker {
  display: none;
}

.faq__item summary:hover {
  background: var(--surface-hover);
}

.faq__plus {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--orange-500);
  transition: transform 320ms var(--ease-spring);
}

.faq__item[open] .faq__plus {
  transform: rotate(45deg);
}

.faq__answer {
  padding: 0 24px;
  overflow: hidden;
}

.faq__answer p {
  margin: 0;
  padding: 2px 0 24px;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.5;
  color: var(--grey-600);
  max-width: 560px;
}

/* ============ INTEGRATIONS ============ */

.integrations {
  padding: 0 0 140px;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.integrations__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.integrations__lede {
  margin: 4px 0 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.45;
  color: var(--grey-600);
  max-width: 460px;
  text-wrap: balance;
}





/* ============ CTA ============ */

.cta {
  padding: 0 0 20px;
}

/* ============ FOOTER ============ */

.footer {
  width: 100%;
  background: #efeee8;
  margin-top: 100px;
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0 0;
  display: flex;
  flex-direction: column;
}

.footer__logo {
  height: 22px;
  width: auto;
}

.footer__mid {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 60px;
  padding: 36px 0 10px;
}

.footer__tagline {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: var(--grey-600);
  max-width: 300px;
}

.footer__cols {
  display: flex;
  gap: 80px;
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer__col-title {
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Geist", sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--grey-900);
}

.footer__square {
  width: 7px;
  height: 7px;
  background: var(--orange-500);
  flex-shrink: 0;
}

.footer__col a {
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: var(--grey-600);
  text-decoration: none;
  padding-left: 17px;
  transition: color 180ms var(--ease-standard);
}

.footer__col a:hover {
  color: var(--grey-900);
}

/* framer footer [logo] block: 235px clipped window; the wordmark is
   pinned at bottom:-101px so its lower third sits below the page edge. */
.footer__mark {
  position: relative;
  margin-top: 20px;
  height: 235px;
  overflow: hidden;
}

.footer__watermark {
  position: absolute;
  left: 0;
  bottom: -101px;
  width: 100%;
  height: 307px;
  object-fit: cover;
  display: block;
}

.footer__mosaic {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 624px;
  max-width: 80%;
  height: auto;
  pointer-events: none;
  z-index: 1;
}

.footer__bottom {
  position: absolute;
  left: 0;
  bottom: 23px;
  width: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: var(--grey-600);
}

.footer__bottom p {
  margin: 0;
}

.footer__bottom a {
  color: var(--grey-600);
  text-decoration: none;
  transition: color 180ms var(--ease-standard);
}

.footer__bottom a:hover {
  color: var(--grey-900);
}

/* ============ REDUCED MOTION ============ */

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .hero {
    height: auto;
  }
  .hero__sticky {
    position: static;
    height: 100vh;
  }
  .delegation__scroll {
    height: auto;
  }
  .delegation__pin {
    position: static;
    height: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============ TABLET / MOBILE ============ */

@media (max-width: 1240px) {
  .container {
    padding: 0 20px;
  }
  .nav {
    padding: 16px 20px;
  }
}

@media (max-width: 900px) {
  .nav {
    padding: 14px 16px;
  }
  .nav__links {
    display: none;
  }

  .hero__headline {
    font-size: clamp(32px, 7vw, 48px);
  }

  .logos__list {
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;
    padding: 0 16px;
  }

  .h2 {
    font-size: 38px;
  }

  /* why cards: vertical stack, all expanded */
  .why {
    padding: 90px 0 0;
  }
  .why__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .why__heading,
  .why__lede {
    width: 100%;
  }

  /* delegation flows naturally on mobile */
  .delegation__scroll {
    width: 100%;
    height: auto;
  }
  .delegation__pin {
    position: static;
    height: auto;
    padding: 60px 0;
  }
  .delegation__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .delegation__heading,
  .delegation__lede {
    width: 100%;
  }
  .delegation__inner {
    flex-direction: column;
    gap: 24px;
  }
  .features {
    width: 100%;
  }
  .stage {
    height: 460px;
  }

  .testimonials {
    padding: 80px 0;
    gap: 40px;
  }
  .marquee {
    mask-image: linear-gradient(
      to right,
      transparent 0,
      black 40px,
      black calc(100% - 40px),
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0,
      black 40px,
      black calc(100% - 40px),
      transparent 100%
    );
  }

  .pricing {
    padding: 80px 0;
    gap: 40px;
  }
  .pricing__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .pricing__side {
    align-items: flex-start;
    padding-top: 0;
  }
  .pricing__lede {
    text-align: left;
  }

  /* how-it-works: window scrolls naturally, no pan */
  .hiw {
    padding: 20px 0 80px;
    gap: 36px;
  }

  .faq {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 20px 0 90px;
  }
  .faq__mosaic {
    margin-top: 24px;
    width: 320px;
  }

  .integrations {
    padding: 0 0 90px;
  }

  .footer__inner {
    padding: 40px 20px 24px;
  }
  .footer__mid {
    flex-direction: column;
    gap: 32px;
  }
  .footer__cols {
    gap: 40px;
    flex-wrap: wrap;
  }
  .footer__mark {
    height: 150px;
  }
  .footer__watermark {
    height: 140px;
    bottom: -46px;
  }
  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    bottom: 60px;
    padding: 0 4px;
  }
}

@media (max-width: 560px) {
  .hero {
    height: 620px;
  }
  .hero__media {
    --h: 520px;
  }
  .footer__cols {
    flex-direction: column;
    gap: 24px;
  }
}

/* ================================================================
   FRAMER COMPONENT PORTS — exact specs from project M9cZnnZEzzWUCV6nAPp1
   ================================================================ */

/* ---------- Buttons/button (Y7iLraJCB) ---------- */

.fbtn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 12px 4px 4px;
  border-radius: 8px;
  text-decoration: none;
  overflow: hidden;
  transition: background-color 200ms var(--ease-standard);
}

.fbtn--primary { background: var(--grey-900); }
.fbtn--secondary { background: var(--white); }
.fbtn--full { width: 100%; }

.fbtn__chip {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: var(--orange-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

/* 25px window, two 24px chevrons; default shows the right one,
   hover slides to the left one (framer end→start distribution swap) */
.fbtn__arrows {
  display: inline-flex;
  align-items: center;
  width: 25px;
  height: 24px;
  overflow: hidden;
}

.fbtn__arrows svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--grey-900);
  transform: translateX(-23px);
  transition: transform 400ms var(--ease-spring);
}

.fbtn:hover .fbtn__arrows svg {
  transform: translateX(0);
}

/* label roller: 18px window, two stacked copies */
.fbtn__label {
  display: inline-flex;
  flex-direction: column;
  height: 18px;
  overflow: hidden;
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
}

.fbtn__label span {
  display: block;
  height: 18px;
  line-height: 18px;
  opacity: 0.9;
  transform: translateY(0);
  transition: transform 400ms var(--ease-spring);
}

.fbtn:hover .fbtn__label span {
  transform: translateY(-18px);
}

.fbtn--primary .fbtn__label { color: var(--white); }
.fbtn--secondary .fbtn__label { color: var(--grey-900); }

/* ---------- Cards/Benefit cards (OA43R7kz7 + L54dG_oz5) ---------- */

.why-cards {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 420px;
}

.wcard {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 420px;
  background: var(--surface);
  border-radius: 12px;
  overflow: clip;
  cursor: pointer;
  outline: none;
  /* framer: tween 0.34,1.2,0.64,1 0.4s on the card variant switch */
  transition:
    flex-basis 400ms cubic-bezier(0.34, 1.2, 0.64, 1),
    flex-grow 400ms cubic-bezier(0.34, 1.2, 0.64, 1),
    height 400ms cubic-bezier(0.34, 1.2, 0.64, 1),
    background-color 400ms cubic-bezier(0.34, 1.2, 0.64, 1),
    border-radius 400ms cubic-bezier(0.34, 1.2, 0.64, 1),
    box-shadow 400ms cubic-bezier(0.34, 1.2, 0.64, 1);
}

.wcard.is-active {
  flex: 0 0 352px;
  height: 440px;
  background: var(--white);
  border-radius: 20px;
  box-shadow: 0 12px 16px 0 var(--grey-f100);
}

.wcard:focus-visible {
  box-shadow:
    0 0 0 2px var(--bg),
    0 0 0 4px var(--orange-500);
}

/* closed state: number / mosaic / title, space-between */
.wcard__closed {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 40px;
  opacity: 1;
  transition: opacity 240ms var(--ease-standard) 120ms;
}

.wcard.is-active .wcard__closed {
  opacity: 0;
  transition-delay: 0ms;
  pointer-events: none;
}

.wcard__number {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 52px;
  line-height: 1.05;
  color: rgb(221, 216, 211);
  font-variation-settings: "opsz" 14;
}

.wcard__mosaic {
  width: 100%;
  height: 164px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wcard__mosaic img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  animation: drift 9s ease-in-out infinite;
}

.wcard[data-index="02"] .wcard__mosaic img { animation-delay: -2s; }
.wcard[data-index="03"] .wcard__mosaic img { animation-delay: -4s; }
.wcard[data-index="04"] .wcard__mosaic img { animation-delay: -6s; }

.wcard__title-closed {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.1;
  color: var(--grey-900);
  font-variation-settings: "opsz" 14;
}

/* opened state: image (radius 12) + content, padding 8 */
.wcard__open {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 240ms var(--ease-standard);
}

.wcard.is-active .wcard__open {
  opacity: 1;
  pointer-events: auto;
  transition-delay: 120ms;
}

.wcard__img {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.wcard__img img {
  display: block;
  width: 100%;
  height: auto;
}

.wcard__content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wcard__title {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
  color: var(--grey-900);
  font-variation-settings: "opsz" 14;
  text-wrap: balance;
}

.wcard__desc {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--grey-900);
  text-wrap: pretty;
}

/* ---------- Cards/Review (G8EVipizY) ---------- */

.marquee__track {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 10px;
  width: max-content;
  animation: marquee 60s linear infinite;
  will-change: transform;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-50% - 5px)); }
}

.tcard {
  flex: 0 0 373px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  padding: 20px;
  height: 346px;
  border-radius: 12px;
  background: var(--white);
  isolation: isolate;
  overflow: hidden;
  cursor: pointer;
}

/* hover: cloud painting fades in (no scrim — exact framer behavior) */
.tcard::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: url("assets/tcard-cloud.jpg") center / cover no-repeat;
  opacity: 0;
  transition: opacity 400ms var(--ease-standard);
  pointer-events: none;
}

.tcard:hover::before { opacity: 1; }

.tcard__quote {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  color: var(--grey-900);
  opacity: 0.8;
  text-wrap: pretty;
  transition: opacity 300ms var(--ease-standard);
}

.tcard:hover .tcard__quote { opacity: 1; }

.tcard__author {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.tcard__avatar {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  background: #ffd8a8;
  border: 1.5px solid var(--white);
}

.tcard__name {
  display: block;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.1;
  color: var(--grey-900);
  font-variation-settings: "opsz" 14;
}

.tcard__role {
  display: block;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--grey-900);
  opacity: 0.5;
  margin-top: 5px;
  transition: opacity 300ms var(--ease-standard);
}

.tcard:hover .tcard__role { opacity: 0.7; }

.tcard__source {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--grey-900);
  color: var(--grey-f100);
  border-radius: 4px;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 280ms var(--ease-standard);
}

.tcard__source-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.tcard:hover .tcard__source {
  opacity: 1;
  pointer-events: auto;
}

.tcard__source:focus-visible {
  outline: 2px solid var(--orange-500);
  outline-offset: 2px;
}

/* ---------- Sections/Pricing (Xithlzoxo) ---------- */

.toggle {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  background: var(--surface);
  border-radius: 8px;
}

.toggle__btn {
  appearance: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 8px 12px;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--grey-600);
  border-radius: 8px;
  transition: background 240ms var(--ease-standard), color 240ms var(--ease-standard);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.toggle__btn.is-active {
  background: var(--white);
  color: var(--grey-900);
}

.toggle__off {
  font-family: "Geist", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--grey-900);
  line-height: 1.2;
}

.plans {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.plan {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--card-line);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 20px;
  isolation: isolate;
  overflow: hidden;
  cursor: default;
}

/* per-card cloud (portrait painting) cross-fade — kept from the approved
   interaction, styled with the exact framer pro-card asset */
.plan::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url("assets/pro-cloud.png") center / cover no-repeat;
  opacity: 0;
  transition: opacity 260ms var(--ease-standard);
  pointer-events: none;
}

.plan.is-featured::before { opacity: 1; }
.plans:hover .plan.is-featured:not(:hover)::before { opacity: 0; }
.plans .plan:hover::before { opacity: 1; }

.plan.is-featured,
.plans .plan:hover { background-color: transparent; }
.plans:hover .plan.is-featured:not(:hover) { background-color: var(--surface); }

.plan__name {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-style: italic;
  font-weight: 500;
  font-size: 24px;
  line-height: 1.1;
  color: var(--grey-900);
}

.plan__price {
  display: block;
}

.plan__price .plan__currency,
.plan__price .plan__amount {
  display: inline;
}

.plan__amount,
.plan__currency {
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 32px;
  line-height: 1.1;
  color: var(--grey-900);
  font-variation-settings: "opsz" 14;
}

.plan__period {
  margin: 8px 0 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--grey-600);
}

.plan__desc {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--grey-600);
  text-wrap: pretty;
  min-height: 58px;
}

.plan-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--grey-900);
}

.plan-features__dot {
  width: 8px;
  height: 8px;
  background: var(--orange-500);
  flex-shrink: 0;
}

/* disabled rows: square stays in layout at opacity 0, text at 0.6 */
.plan-features li.is-off { opacity: 1; color: var(--grey-900); }
.plan-features li.is-off .plan-features__dot { display: block; opacity: 0; }
.plan-features li.is-off { color: rgba(37, 31, 25, 0.6); }

.plan .fbtn { margin-top: auto; }

/* ---------- Sections/Tab+images (uHCAWDn2h) ---------- */

.hiw__panel {
  position: relative;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: url("assets/canyon.png") center / cover no-repeat;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.hiw__pills {
  display: flex;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 3;
}

.hiw__pill {
  appearance: none;
  border: 0;
  cursor: pointer;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  color: var(--grey-900);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: background-color 260ms var(--ease-standard);
}

.hiw__pill.is-active {
  background: var(--white);
}

.hiw__stage {
  position: relative;
  width: 100%;
  border-radius: 25px;
  overflow: hidden;
  background: var(--bg);
  aspect-ratio: 1.53;
}

.hiw__lottie {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 320ms var(--ease-standard);
}

.hiw__lottie.is-active {
  opacity: 1;
}

.hiw__lottie[hidden] { display: block; }

.hiw__lottie canvas,
.hiw__lottie svg {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* ---------- Integrations ticker (oEMyWBkEX) ---------- */

.int-marquee {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  -webkit-mask-image: radial-gradient(50% 122% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 80.63%, rgba(0,0,0,0) 100%);
  mask-image: radial-gradient(50% 122% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 80.63%, rgba(0,0,0,0) 100%);
}

.int-marquee__row {
  display: flex;
  gap: 20px;
  width: max-content;
  border-radius: 10px;
}

/* velocity 20px/s over half-set width 928px → 46.4s */
.int-marquee__row[data-dir="left"] { animation: int-left 46.4s linear infinite; }
.int-marquee__row[data-dir="right"] { animation: int-right 46.4s linear infinite; }

@keyframes int-left {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-50% - 10px)); }
}

@keyframes int-right {
  from { transform: translateX(calc(-50% - 10px)); }
  to   { transform: translateX(0); }
}

.int-marquee__set {
  display: flex;
  gap: 20px;
}

.int-tile {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  background: var(--grey-f50);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.int-tile img {
  width: 96px;
  height: 96px;
}

/* ---------- Sections/Final CTA (IlMg0EFiD / RVGavsn11) ---------- */

.cta {
  padding: 0 0 20px;
}

.cta__panel {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.cta__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}

.cta__overlay {
  position: absolute;
  inset: 0;
  background: var(--grey-900);
  opacity: 0.25;
  z-index: -1;
  pointer-events: none;
}

.cta__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 40px 24px;
  max-width: 700px;
}

.cta__title {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  font-size: 52px;
  line-height: 1.05;
  letter-spacing: 0;
  color: var(--white);
  font-variation-settings: "opsz" 14;
  text-wrap: balance;
}

.cta__title em {
  font-style: italic;
  font-weight: 500;
}

.cta__lede {
  margin: 0;
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.2;
  color: var(--white);
  max-width: 500px;
}

/* ---------- Navigation/Footer (pAQMlpg20) ---------- */

.footer {
  width: 100%;
  background: var(--surface);
  margin-top: 100px;
}

.footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--grey-f400);
}

.footer__social {
  display: flex;
  align-items: center;
  gap: 19px;
}

.footer__social-label {
  font-family: "Geist", sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.2;
  color: var(--grey-600);
}

.footer__social-btns {
  display: flex;
  gap: 8px;
}

.footer__social-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: var(--grey-f200);
  color: var(--grey-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 200ms var(--ease-standard);
}

.footer__social-btn:hover {
  background: var(--bg);
}

.footer__social-btn svg {
  width: 18px;
  height: 18px;
}

/* ---------- responsive overrides for ported components ---------- */

@media (max-width: 900px) {
  .why-cards {
    flex-direction: column;
    height: auto;
    align-items: stretch;
  }
  .wcard,
  .wcard.is-active {
    flex: 0 0 auto;
    width: 100%;
    height: auto;
    min-height: 0;
    background: var(--white);
    border-radius: 12px;
  }
  .wcard__closed { display: none; }
  .wcard__open {
    position: relative;
    opacity: 1;
    pointer-events: auto;
  }
  .plans { grid-template-columns: 1fr; }
  .cta__panel { height: 420px; }
  .cta__title { font-size: 32px; }
  .hiw__pills { flex-wrap: wrap; }
  .int-tile, .int-tile img { width: 76px; height: 76px; }
  .fbtn--full { width: 100%; }
}

------------------------------- END styles.css -------------------------------

FILE: script.js
------------------------------ BEGIN script.js ------------------------------
// ============================================================
// PARLEY home — merged interactions
// nav hide/show + hero expand (from parley-hero), why-cards hover
// settle (from parley-cards-v2), delegation scrollytelling (from
// parley-hero), testimonial marquee duplication, pricing toggle,
// how-it-works scroll pan, FAQ accordion animation.
// ============================================================

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ============ NAV: hide on scroll down, show on scroll up; bg-aware ============
  const navBar = document.querySelector(".nav-bar");
  const heroSection = document.getElementById("hero");
  if (navBar) {
    const REVEAL_AT_TOP = 80;
    const DELTA = 6;
    let lastY = window.scrollY;
    let lastDir = 0;

    const onNav = () => {
      const y = window.scrollY;
      const dy = y - lastY;

      if (y <= REVEAL_AT_TOP) {
        navBar.classList.remove("is-hidden");
        lastDir = 0;
      } else if (Math.abs(dy) >= DELTA) {
        const dir = dy > 0 ? 1 : -1;
        if (dir !== lastDir) {
          if (dir === 1) navBar.classList.add("is-hidden");
          else navBar.classList.remove("is-hidden");
          lastDir = dir;
        }
      }

      if (heroSection) {
        const navH = navBar.offsetHeight || 60;
        const heroBottomInViewport = heroSection.getBoundingClientRect().bottom;
        navBar.classList.toggle("is-over-hero", heroBottomInViewport > navH);
      }

      lastY = y;
    };
    window.addEventListener("scroll", onNav, { passive: true });
    onNav();
  }

  // ============ HERO BG IMAGE EXPANSION (scroll, no hijack) ============
  const hero = document.getElementById("hero");
  const media = document.getElementById("hero-media");
  const heroImg = document.querySelector(".hero__img");

  if (hero && media && heroImg && !reduced) {
    const INITIAL_H = 600;
    const INITIAL_RADIUS = 18;
    const INITIAL_IMG_SCALE = 1.8;
    const FINAL_IMG_SCALE = 1.0;

    const lerp = (a, b, t) => a + (b - a) * t;

    const sticky = hero.querySelector(".hero__sticky");

    const updateHero = () => {
      const scrolled = Math.max(0, window.scrollY);
      const p = Math.min(1, scrolled / 500);
      const eased = p * p * (3 - 2 * p);

      const vw = window.innerWidth;
      const heroH = hero.offsetHeight;
      // Actual left edge of the hero's positioning context. Accounts for
      // both the centered 1200 container AND its responsive side padding.
      const containerL = Math.max(0, sticky.getBoundingClientRect().left);
      const startW = vw - containerL * 2;
      const finalW = vw;

      const w = lerp(startW, finalW, eased);
      const h = lerp(INITIAL_H, heroH, eased);
      const l = lerp(0, -containerL, eased);
      const t = lerp(0, -80, eased);
      const radius = lerp(INITIAL_RADIUS, 0, eased);
      const imgScale = lerp(INITIAL_IMG_SCALE, FINAL_IMG_SCALE, eased);

      media.style.setProperty("--w", `${w}px`);
      media.style.setProperty("--h", `${h}px`);
      media.style.setProperty("--l", `${l}px`);
      media.style.setProperty("--t", `${t}px`);
      media.style.setProperty("--radius", `${radius}px`);
      heroImg.style.setProperty("--img-scale", imgScale.toFixed(3));
    };

    let heroTick = false;
    const onHeroScroll = () => {
      if (heroTick) return;
      heroTick = true;
      requestAnimationFrame(() => {
        updateHero();
        heroTick = false;
      });
    };

    window.addEventListener("scroll", onHeroScroll, { passive: true });
    window.addEventListener("resize", onHeroScroll, { passive: true });
    updateHero();
  }

  // ============ WHY-CARDS: sticky hover (exact framer Benefit cards) ============
  // Each card opens on mouseenter and STAYS open until another card is
  // hovered — no reset on pointer leave (framer wires onMouseEnter →
  // SET_VARIANT with no reverse handler).
  const whyRow = document.getElementById("why-cards");
  if (whyRow) {
    const wcards = Array.from(whyRow.querySelectorAll(".wcard"));
    const activate = (card) => {
      if (card.classList.contains("is-active")) return;
      wcards.forEach((c) => c.classList.toggle("is-active", c === card));
    };
    wcards.forEach((card) => {
      card.addEventListener("pointerenter", () => activate(card));
      card.addEventListener("focus", () => activate(card));
    });
  }

  // ============ DELEGATION STEP DETECTION ============
  const scroll = document.getElementById("delegation-scroll");
  if (scroll) {
    const buttons = Array.from(document.querySelectorAll(".feature__btn"));
    const mocks = Array.from(document.querySelectorAll(".mock"));
    const triggers = Array.from(document.querySelectorAll(".trigger"));
    const stepCount = buttons.length;

    let currentStep = 0;
    let lockUntil = 0;

    const setStep = (next) => {
      next = Math.max(0, Math.min(stepCount - 1, next));
      if (next === currentStep) return;
      currentStep = next;

      buttons.forEach((b, i) => {
        b.setAttribute("aria-selected", i === next ? "true" : "false");
      });
      mocks.forEach((m, i) => {
        const active = i === next;
        m.classList.toggle("is-active", active);
        if (active) m.removeAttribute("hidden");
        else m.setAttribute("hidden", "");
      });
    };

    const computeStepFromTriggers = () => {
      const middle = window.innerHeight / 2;
      let next = 0;
      for (let i = 0; i < triggers.length; i++) {
        const r = triggers[i].getBoundingClientRect();
        if (r.top <= middle) next = i;
      }
      return next;
    };

    const onUpdate = () => {
      if (performance.now() < lockUntil) return;
      setStep(computeStepFromTriggers());
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onUpdate();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    buttons.forEach((b, i) => {
      b.addEventListener("click", () => {
        const target = scroll.offsetTop + (i / stepCount) * (scroll.offsetHeight - window.innerHeight) + 20;
        lockUntil = performance.now() + 700;
        setStep(i);
        window.scrollTo({
          top: target,
          behavior: reduced ? "auto" : "smooth",
        });
      });

      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = (i + 1) % stepCount;
          buttons[next].click();
          buttons[next].focus();
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const next = (i - 1 + stepCount) % stepCount;
          buttons[next].click();
          buttons[next].focus();
        }
      });
    });

    onUpdate();
  }

  // ============ TESTIMONIAL MARQUEE: duplicate track for seamless loop ============
  const track = document.getElementById("track");
  if (track) {
    const originals = Array.from(track.children);
    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  // ============ PRICING TOGGLE ============
  const toggleBtns = Array.from(document.querySelectorAll(".toggle__btn"));
  toggleBtns.forEach((b) => {
    b.addEventListener("click", () => {
      toggleBtns.forEach((other) => {
        const active = other === b;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", active ? "true" : "false");
      });
    });
  });

  // ============ HOW IT WORKS: Lottie tabs (exact framer Tab+images) ============
  // Three scroll-independent Lottie animations (canvas renderer, loop),
  // switched by the pill tabs — identical to the framer component.
  const hiwPanel = document.getElementById("hiw-panel");
  if (hiwPanel && window.lottie) {
    const pills = Array.from(hiwPanel.querySelectorAll(".hiw__pill"));
    const stages = Array.from(hiwPanel.querySelectorAll(".hiw__lottie"));
    const files = ["assets/hiw-1.json", "assets/hiw-2.json", "assets/hiw-3.json"];
    const players = new Array(files.length).fill(null);

    const load = (i) => {
      if (players[i]) return players[i];
      players[i] = lottie.loadAnimation({
        container: stages[i],
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: files[i],
      });
      return players[i];
    };

    let current = 0;
    const setStep = (next) => {
      if (next === current && players[next]) return;
      current = next;
      pills.forEach((p, i) => {
        p.classList.toggle("is-active", i === next);
        p.setAttribute("aria-pressed", i === next ? "true" : "false");
      });
      stages.forEach((s, i) => {
        const active = i === next;
        s.classList.toggle("is-active", active);
        if (active) s.removeAttribute("hidden");
        else s.setAttribute("hidden", "");
        const pl = players[i];
        if (pl) { if (active) pl.play(); else pl.pause(); }
      });
      const pl = load(next);
      if (!reduced) pl.play();
    };

    pills.forEach((p, i) => p.addEventListener("click", () => setStep(i)));

    // lazy-init the first animation when the panel approaches the viewport
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        const pl = load(0);
        if (!reduced) pl.play();
        io.disconnect();
      }
    }, { rootMargin: "600px" });
    io.observe(hiwPanel);
  }

  // ============ FAQ: animate open/close of <details> ============
  const faqItems = Array.from(document.querySelectorAll(".faq__item"));
  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".faq__answer");
    if (!summary || !answer) return;

    let anim = null;

    const collapse = () => {
      const startH = answer.offsetHeight;
      if (anim) anim.cancel();
      anim = answer.animate(
        [{ height: `${startH}px`, opacity: 1 }, { height: "0px", opacity: 0 }],
        { duration: reduced ? 0 : 280, easing: "cubic-bezier(0.2, 0, 0, 1)" }
      );
      anim.onfinish = () => {
        item.removeAttribute("open");
        answer.style.height = "";
        anim = null;
      };
    };

    const expand = () => {
      item.setAttribute("open", "");
      const endH = answer.scrollHeight;
      if (anim) anim.cancel();
      anim = answer.animate(
        [{ height: "0px", opacity: 0 }, { height: `${endH}px`, opacity: 1 }],
        { duration: reduced ? 0 : 320, easing: "cubic-bezier(0.32, 0.72, 0, 1)" }
      );
      anim.onfinish = () => {
        answer.style.height = "";
        anim = null;
      };
    };

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (item.hasAttribute("open")) {
        collapse();
      } else {
        // close any other open item first
        faqItems.forEach((other) => {
          if (other !== item && other.hasAttribute("open")) {
            other.removeAttribute("open");
          }
        });
        expand();
      }
    });
  });
})();

------------------------------- END script.js -------------------------------
