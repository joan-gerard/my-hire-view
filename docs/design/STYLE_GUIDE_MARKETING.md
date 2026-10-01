# Marketing brand & UI style guide

> Source of truth for the public marketing surface (`/`, and landings that should match it).  
> Legal (`/terms`, `/privacy`, `/cookies`) and the generic 404 share a related **dark void** family (minimal chrome, deep fields, accent stamps) rather than the white homepage shell — see `LegalDocument` / `MarketingNotFound` and `.mhv-legal-*` / `.mhv-404` in `mhv-demo.css`.  
> Implementation today: `app/(home)/mhv-demo.css` + `components/marketing/`.  
> Product chrome (admin, auth, `/view`) uses a **different** system — see [STYLE_GUIDE_PRODUCT.md](STYLE_GUIDE_PRODUCT.md).

**Living demo of this guide on an unrelated product:** [`/demo`](/demo) (Sprig home) and [`/demo/care-log`](/demo/care-log) (denser product-style subpage). Covers story, how-it-works, image gallery, team, pricing, FAQ, and log UI — all on these tokens.

---

## 1. Brand personality

| Trait | How it shows up |
| ----- | ---------------- |
| Direct | Short headlines; little marketing fluff |
| High contrast | Near-black ink on white/paper; lime and pink as punctuation, not wallpaper |
| Soft geometry | Pill buttons, large radii on cards/media (20–30px), circular icon wells |
| Motion with purpose | Text roll on CTA hover; sticky header hide-on-scroll; optional marquee — not scroll-fade on every section |

Voice: plain, confident, sentence case. CTAs name the action (“Get started”, “Join Sprig”), not vague verbs (“Submit”, “Learn more” unless the next step truly is reading).

---

## 2. Color tokens

Define these on a page root scope (e.g. `.mhv-landing` or `.sg-landing`):

| Token | Hex | Role |
| ----- | --- | ---- |
| `--ink` | `#0b0b0c` | Primary text, dark CTAs, featured cards |
| `--muted` | `#6a6e6e` | Body / secondary copy |
| `--mist` | `#b7bcbc` | Tertiary text on dark surfaces |
| `--lime` | `#9efc65` | Primary accent — highlighted words, lime CTAs, badges, focus rings |
| `--pink` | `#ffbcfc` | Fill accent (stat tiles, billing “save” when selected) — **not** for body text |
| `--pink-text` | `#c026a8` | Pink **text** on white/paper (WCAG AA). Never use bright `--pink` as text on light backgrounds |
| `--paper` | `#f0f0f0` | Soft surface, inactive nav pill, card default |
| `--card` | `#171718` | Near-black panel |
| `--deep` / `--deep-2` | `#122020` / `#1e2b2b` | Dark story/stat surfaces |
| `--white` | `#ffffff` | Page background, icon wells on dark buttons |

### Usage rules

- **Page default:** white background, `--ink` text.
- **Accent sparingly:** lime and pink highlight *one* idea (a word in a headline, a badge, a primary CTA) — not whole sections washed in color.
- **Dark sections** (footer, featured pricing, deep stats): `--ink` or `--deep` fill; body text `--mist` or white; lime for the loudest control.
- **Focus:** `outline: 2px solid var(--lime); outline-offset: 2px` on interactive controls.

---

## 3. Typography

| Role | Family | CSS variable | Notes |
| ---- | ------ | ------------ | ----- |
| Headings | Switzer | `--font-switzer` | Weight 500–600; `letter-spacing: -0.02em` to `-0.03em` |
| UI / body / nav | Stack Sans Headline | `--font-stack-sans-headline` | Default page `font-size: 16px`; `line-height: 1.2`–`1.35` |
| Logo wordmark | Switzer | same as headings | ~24px, weight 500; optional colored dot |

Self-host via `next/font` (see `app/(home)/fonts.ts`). Do not fall back to Inter / system-only marketing pages.

### Type scale (marketing)

| Element | Size | Weight |
| ------- | ---- | ------ |
| Hero title | `clamp(42px, 5.7vw, 82px)` | 600 |
| Section title | 36–42px (pricing ~42px) | 500 |
| Card title | 26–28px | 500 |
| Body | 16–18px | 400; color `--muted` |
| Eyebrow / nav | 14–16px | inherit |
| Fine print / badges | 10–13px | 600 when label-like |

Headline trick used on home: wrap one word in a lime pill (`.ot-word-lime`) and tint another with `--pink-text` (`.ot-word-pink`). Use at most one of each per headline.

---

## 4. Layout

| Token / pattern | Value |
| --------------- | ----- |
| Content width | `min(1200px, 100%)` centered |
| Horizontal padding | `30px` (tighten on small screens as needed) |
| Header height | ~102px; sticky; may hide on scroll down |
| Section vertical rhythm | Large (e.g. story ~140–180px padding); keep one job per section |
| Grid gaps | Often 20–30px |

Left-align story and hero copy; center pricing intros when the block is a decision UI.

---

## 5. Components

### Buttons (arrow CTA)

- Height 42px (lime primary 48px); pill `border-radius: 100px`.
- **Dark:** `#101011` fill, white label, white circular icon well with ink arrow.
- **Lime:** `--lime` fill, ink label, ink icon well with white arrow.
- Hover: vertical text roll (duplicate label slides up). Respect `prefers-reduced-motion: reduce` (disable roll / marquee).

### Eyebrow

Pill with 1px ink border at 10% opacity, 14px type, optional 5px ink dots on either side. Not ALL CAPS.

### Nav links

Muted by default; current page = `--paper` pill + ink text. Hover → ink.

### Cards

- Default: `--paper`, radius ~26–30px.
- Featured: `--ink` fill, white / mist text, optional lime badge overlapping the top edge.
- Avoid generic drop-shadow stacks; soft shadow only for floating menus (`0 16px 40px rgba(11, 11, 12, 0.12)`).

### Media

Hero / product images: `border-radius: 20px`; tall crops OK. Prefer real product or atmosphere shots over abstract gradients as the main visual.

### Logo

Wordmark + small colored circular “dot” (lime or pink). Keep logo and brand name as a first-viewport signal on landings.

---

## 6. Motion

Allowed patterns (match home):

1. CTA label roll on hover  
2. Sticky header show/hide on scroll direction  
3. Optional infinite marquee for image strips  

Avoid: fade-up on every section, glow, multi-layer shadows, emoji as decoration.

---

## 7. Accessibility

- Body text contrast: ink / muted on white or paper; mist only on dark fills.
- Pink as text → always `--pink-text` on light surfaces.
- Keyboard: visible lime focus rings; menus open on `:focus-within`.
- Decorative images: empty `alt` + `aria-hidden` on marquees when appropriate.
- Honor `prefers-reduced-motion`.

---

## 8. Do / don’t

| Do | Don’t |
| -- | ----- |
| Use the token table above | Invent a third marketing palette for one-off pages |
| Put brand name at hero scale | Bury the brand under a louder generic headline |
| One lime CTA group in the first viewport | Card grids, stat strips, and promos in the hero |
| Reuse arrow button + eyebrow patterns | Default Inter + purple SaaS gradients |

---

## 9. Checklist for a new marketing page

1. Root scope with the color tokens and both font CSS variables.  
2. Brand / logo as a primary signal in the first viewport.  
3. One headline, one short support line, one CTA group, one dominant visual.  
4. Sections each have one purpose.  
5. Lime/pink used as accents only; pink text token for readable pink copy.  
6. Reduced-motion path verified.
