# F34 — Align product UI with marketing brand (working plan)

> **Temporary.** Implementation tracker for `F34-118` on branch `feat/f34-product-marketing-branding`.  
> Canonical ticket status lives in [Backlog.md](../product/Backlog.md).  
> **Delete or move to `docs/retrospectives/` when the F34 implementation ships** (restyle complete / `F34-118` done) — not when an early docs-only PR merges.

**Sources of truth while coding**

- Marketing: [STYLE_GUIDE_MARKETING.md](STYLE_GUIDE_MARKETING.md) · `app/(home)/mhv-demo.css` · live `/` and denser `/demo/care-log`
- Product (until rewritten): [STYLE_GUIDE_PRODUCT.md](STYLE_GUIDE_PRODUCT.md) · `app/globals.css`
- Trello: [F34-118](https://trello.com/c/L4QSQrim/121-f34-118-align-product-ui-with-marketing-brand)

---

## Goal

Restyle `/admin`, `/view`, `/login`, and `/signup` to match the **marketing brand system** (ink / paper / lime / pink, Switzer + Stack Sans), not the warm F17 palette. Visual skin only. Update `STYLE_GUIDE_PRODUCT.md` in the same PR.

**Out of scope:** the live marketing surface stays byte-stable in look and behavior. F34 must not restyle `/`, legal pages, or marketing-owned CSS/components.

---

## Gate — do not change marketing

**Hard rule:** F34 must not alter the appearance or behavior of the current marketing pages. Prefer forking over mutating anything marketing already uses.

### Frozen (do not edit for F34 look/feel)

| Surface / artifact | Why |
| ------------------ | --- |
| `/` (`app/(home)/`, `mhv-landing.tsx`) | Live marketing homepage |
| `/terms`, `/privacy`, `/cookies` | Marketing legal family |
| `app/(home)/mhv-demo.css`, `mhv-404.css`, `app/(home)/fonts.ts` | Marketing implementation |
| `components/marketing/*` | Marketing-only UI |

Optional visual check before merge: open `/` (and one legal page) and confirm no intentional diff vs `main` for those trees.

### Shared-component rule

If a module is used by marketing **or** changing it would change a marketing-visible surface (including shared route-level UI):

1. **Do not** restyle that module in place for product unless the surface is explicitly in-scope (see Button / `app/error.tsx` below).
2. **Create** a product-specific component (or wrap / variant that marketing does not import).
3. Point **product / auth / admin / view** callers at the new module; leave marketing imports untouched.

Grep beyond `components/marketing/*`: also check root route files (`app/error.tsx`, `app/not-found.tsx`, `app/layout.tsx`) and any other shared shells.

Examples of risk today (verify with grep before editing — do not rely on this table alone):

| Module | Current consumers | F34 approach |
| ------ | ----------------- | ------------ |
| Marketing logo | Live `/` uses `components/marketing/Header.tsx` + `.ot-logo` / `.ot-logo-dot` in `mhv-demo.css` — **not** `components/ui/Logo.tsx` | Leave marketing Header / `.ot-logo` alone. Product wordmark lives in `components/ui/Logo.tsx` (auth, admin, view only) — restyle or extend **that** file in place; no fork required for marketing freeze |
| `components/ui/Logo.tsx` | Product only today: `AuthPageShell`, `AdminHeader`, `ApplicationPageHeader` | Safe to restyle for F34 (Switzer + accent dot). Do not assume a `MarketingHeader` dependency — that path is gone |
| `components/ui/Button` (and other `ui/*`) | Product forms/admin **and** root `app/error.tsx` (“Try again” / “Go home”) | Not imported by `components/marketing/*`, but **is** marketing-visible when the global error boundary renders over `/`. Either (a) treat `app/error.tsx` as **in-scope** shared chrome and accept the new Button look there, or (b) give product a Button variant / fork and keep error on controls that stay unchanged. Do not assume “no marketing import ⇒ no marketing-visible change” |
| `app/globals.css` `:root` / `body` / `#logo` | Root layout loads globals for the whole app; marketing scopes its look under `.mhv-landing` | Remap product tokens carefully; **do not** change rules that marketing depends on (prefer product-scoped wrappers or product-only selectors over rewriting shared global type if that would affect `.mhv-landing`) |
| `components/marketing/*` | Marketing only | Never restyle for F34 |
| `app/not-found.tsx` | Uses `MarketingNotFound` | Frozen with marketing 404 family |

### Gate checklist (every phase + before merge)

- [ ] Diff does not intentionally change `app/(home)/**`, `components/marketing/**`, or marketing CSS for look/feel
- [ ] Shared modules checked against **full** import graph (product + route-level), not only `components/marketing/*`
- [ ] Any module marketing still imports was **forked**, not mutated, when product needed a different look
- [ ] Decision recorded for `app/error.tsx` + `Button` (in-scope restyle vs fork/variant)
- [ ] Smoke `/` (and optionally `/terms`) — looks unchanged vs pre-F34

If a change seems to require editing a frozen file to “fix” product, stop and fork or scope styles to product layouts instead.

---

## Principles

1. **Marketing is frozen** (see gate above). Product borrows the *system*, not the marketing files.
2. **Match the brand system, not the landing layout.** Product stays dense and task-focused; marketing stays spacious. Prefer `/demo/care-log` over the homepage hero as a density reference.
3. **Keep semantic meaning.** Draft / published / danger stay readable; remap colors, don’t invent a new status language mid-PR.
4. **Respect marketing contrast rules.** Lime focus only on dark surfaces; `--pink-text` (not bright `--pink`) on light; ink outline on white / paper.
5. **Change product CSS variables first.** Components already use `--brand-*`, `--background`, status tokens — remapping product-facing tokens in `globals.css` (without breaking marketing) should carry most of the UI.
6. **Do not** import all of `mhv-demo.css` into product layouts, copy landing motion (marquee, sticky hide-on-scroll) into admin unless it clearly helps, or bake marketing hex into dozens of components.

---

## Progress

| Phase | Name | Status |
| ----- | ---- | ------ |
| 0 | Token / type mapping | Not started |
| 1 | Foundations (`globals.css`, fonts, shared UI) | Not started |
| 2 | Auth shell | Not started |
| 3 | Admin chrome + dashboard | Not started |
| 4 | Forms (create / edit / profile) | Not started |
| 5 | Public `/view` | Not started |
| 6 | Docs + QA | Not started |

Mark a phase **Done** when its checklist below is complete and you’ve smoke-tested the listed routes.

---

## Phase 0 — Decide the mapping

Lock this table before painting screens. Adjust cells as you decide; leave “Notes” when tradeoffs matter.

### Color / surface

| Product token (today) | Today hex | Proposed marketing target | Role | Notes |
| --------------------- | --------- | ------------------------- | ---- | ----- |
| `--background` | `#f6f0e9` | `#ffffff` (`--white`) | Page background | |
| `--secondary-background` | `#fcf6ef` | `#f0f0f0` (`--paper`) | Alternate bands | |
| `--surface` | `#f8f4ef` | `#f0f0f0` (`--paper`) | Inputs, cards | |
| `--foreground` | `#2b1809` | `#0b0b0c` (`--ink`) | Primary text | |
| `--brand-primary` | `#2b1809` | `#0b0b0c` (`--ink`) | Primary CTA fill | |
| `--brand-primary-text` | `#ffffff` | `#ffffff` | Text on primary | |
| `--brand-secondary` | `#f0e7dd` | `#f0f0f0` (`--paper`) | Secondary chrome | |
| `--brand-secondary-text` | `#2b1809` | `#0b0b0c` (`--ink`) | Text on secondary | |
| `--brand-accent-1` | `#0d9488` | TBD — see accent note | Focus / positive accent | Don’t use lime focus on light surfaces |
| `--brand-accent-2` | `#0f766e` | TBD | Accent hover | |
| `--dark-section-bg` | `#1a1510` | `#0b0b0c` / `#122020` | Dark bands | |
| `--dark-section-text` | `#faf8f6` | white / `--mist` | Text on dark | |
| `--header-mobile-menu-bg` | `#e2ddd6` | `#f0f0f0` | Mobile menu sheet | |

**Accent note:** Teal is both focus and “Publish / success” today. Lime is the marketing loud accent but fails WCAG as a focus ring on white. Propose:

- Light surfaces: `outline: 2px solid var(--ink)` (marketing rule)
- Dark surfaces: lime focus
- Success / Publish: either keep a teal-like success pair, or redefine success chips so they don’t collide with primary CTA lime — **decide here before Phase 1**

| Status token | Today | Proposed | Notes |
| ------------ | ----- | -------- | ----- |
| `--status-success-*` | teal pair | TBD | Must stay distinct from primary CTA |
| `--status-draft-*` | warm amber | TBD — muted / paper + ink? | |
| `--status-warning-*` | warm amber | TBD | |
| `--status-danger-*` | red pair | Keep red family (tune if needed) | |

### Typography

| Role | Product today | Marketing target |
| ---- | ------------- | ---------------- |
| Body / UI | FunnelSans | Stack Sans Headline |
| Headings | FunnelSans (FaunaOne available) | Switzer |
| Logo wordmark | Varela Round | Switzer + optional lime/pink dot |

Reuse `app/(home)/fonts.ts` (or extract a shared fonts module) — do not load CDN stylesheets.

### Geometry

| Pattern | Product today | Direction |
| ------- | ------------- | --------- |
| Buttons | `rounded-xl` | More pill-like where it fits (`border-radius: 100px` for primary CTAs; keep usable density on dense forms) |
| Cards | soft warm surfaces | `--paper`, large radii (~20–30px) where appropriate; soft shadow only for floating menus |
| Logo | text wordmark | Wordmark + small colored circular dot |

### Checklist

- [ ] Color table locked (including accent / success decision)
- [ ] Type + geometry direction locked
- [ ] Compared `/`, `/demo/care-log`, `/login`, `/admin` side by side

---

## Phase 1 — Foundations

**Touch:** `app/globals.css` (product-safe remaps only), fonts wiring for **product** layouts, product `components/ui/*` (`Logo` is product-only today; `Button` also feeds `app/error.tsx`).

### Checklist

- [ ] Remap product tokens in `globals.css` per Phase 0 without changing marketing look
- [ ] Wire **product** layouts to marketing fonts (do not change `app/(home)/fonts.ts` unless unavoidable; prefer reuse/import)
- [ ] Update product primitives (Button, Input, Textarea, Logo + accent dot, focus rings) — restyle `Logo` in place; decide Button vs `app/error.tsx` per gate
- [ ] Grep full import graph (including `app/error.tsx`); no frozen marketing paths edited for look/feel
- [ ] Smoke: `/login`, `/signup`, `/admin` — and confirm `/` unchanged

---

## Phase 2 — Auth shell

**Touch:** `components/auth/*`, login/signup pages.

### Checklist

- [ ] Auth shell / panel matches marketing (not warm cream card)
- [ ] Password fields, alerts, focus states
- [ ] Keyboard / focus pass on `/login` and `/signup`

---

## Phase 3 — Admin chrome + dashboard

**Touch:** admin header, empty state, search, application cards, checklist, legend, status icons.

### Checklist

- [ ] Header + logo
- [ ] Empty state, search, cards
- [ ] Onboarding checklist + legend
- [ ] Status icons readable on new surfaces
- [ ] Prefer token/class updates over one-off hex

---

## Phase 4 — Forms (create / edit / profile)

Highest interaction density — watch contrast on inputs, tips, validation.

### Checklist

- [ ] Create / edit application forms
- [ ] Profile form + picture / CV library chrome
- [ ] Validation / tip / dialog contrast OK

---

## Phase 5 — Public `/view`

Quiet chrome so CV / video stay primary; brand without looking like a marketing landing.

### Checklist

- [ ] Header / footer / buttons match brand
- [ ] Draft preview banner / unavailable states
- [ ] Owner vs recruiter smoke

---

## Phase 6 — Docs + QA

### Checklist

- [ ] Rewrite [STYLE_GUIDE_PRODUCT.md](STYLE_GUIDE_PRODUCT.md) for the new system (remove “don’t use lime/pink” guidance)
- [ ] Update any stale “warm palette” mentions that F34 makes false
- [ ] Manual pass: login → dashboard → create → preview → `/view`
- [ ] Contrast spot-checks (lime / pink / focus on light and dark)
- [ ] **Marketing gate:** `/` (+ one legal page) unchanged; no unintended diffs under frozen paths; `app/error.tsx` / Button decision verified
- [ ] Strike `F34-118` in Backlog + move Trello card to Done when the F34 implementation ships
- [ ] Delete or archive **this** file (only then)

---

## What not to do

- Change marketing pages, `components/marketing/*`, or marketing CSS to “make product match”
- Mutate a shared module that marketing (or a marketing-visible route shell) still depends on without forking or an explicit in-scope decision
- Assume “not imported under `components/marketing/*`” means safe — always check route-level consumers too
- Import all of `mhv-demo.css` into product layouts
- Copy landing-only motion into admin by default
- Mix warm leftovers and new tokens page-by-page — finish Phase 1 first
- Hard-code marketing hex in many components — keep going through product CSS variables

---

## PR shape

Prefer **one PR** with phased commits matching Phases 1→6. If the diff balloons, split:

1. Tokens + fonts + shared UI  
2. Auth + admin  
3. `/view` + style guide  

---

## Session log

| Date | What landed | Next |
| ---- | ----------- | ---- |
| | | Phase 0 — lock mapping table |
