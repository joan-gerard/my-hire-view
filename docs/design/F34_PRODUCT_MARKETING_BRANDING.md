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
| `components/ui/Button` (and other `ui/*`) | Product forms/admin **and** root `app/error.tsx` (“Try again” / “Go home”) | Not imported by `components/marketing/*`, but **is** marketing-visible when the global error boundary renders over `/`. **Locked (Phase 0):** treat `app/error.tsx` as **in-scope** shared chrome — restyle the single `Button`; no fork. Do not assume “no marketing import ⇒ no marketing-visible change” when grepping |
| `app/globals.css` `:root` / `body` / `#logo` | Root layout loads globals for the whole app; marketing scopes its look under `.mhv-landing` | Remap product tokens carefully; **do not** change rules that marketing depends on (prefer product-scoped wrappers or product-only selectors over rewriting shared global type if that would affect `.mhv-landing`) |
| `components/marketing/*` | Marketing only | Never restyle for F34 |
| `app/not-found.tsx` | Uses `MarketingNotFound` | Frozen with marketing 404 family |

### Gate checklist (every phase + before merge)

- [ ] Diff does not intentionally change `app/(home)/**`, `components/marketing/**`, or marketing CSS for look/feel
- [ ] Shared modules checked against **full** import graph (product + route-level), not only `components/marketing/*`
- [ ] Any module marketing still imports was **forked**, not mutated, when product needed a different look
- [x] Decision recorded for `app/error.tsx` + `Button` — **in-scope restyle** (no fork)
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
| 0 | Token / type mapping | **Done** |
| 1 | Foundations (`globals.css`, fonts, shared UI) | **Done** |
| 2 | Auth shell | **Done** |
| 3 | Admin chrome + dashboard | **Done** |
| 4 | Forms (create / edit / profile) | **Done** |
| 5 | Public `/view` | **Done** |
| 6 | Docs + QA | Not started |

**Status meanings:** **Locked** = decisions recorded; checklist may still have deferred items. **Done** = that phase’s checklist is fully complete (including smoke / deferred compares). Do not mark **Done** while unchecked items remain.

---

## Phase 0 — Decide the mapping

**Locked 2026-10-14.** Implement these values in Phase 1; do not reintroduce teal.

### Color / surface

| Product token (today) | Today hex | Locked target | Role | Notes |
| --------------------- | --------- | ------------- | ---- | ----- |
| `--background` | `#f6f0e9` | `#ffffff` (`--white`) | Page background | |
| `--secondary-background` | `#fcf6ef` | `#f0f0f0` (`--paper`) | Alternate bands | |
| `--surface` | `#f8f4ef` | `#f0f0f0` (`--paper`) | Inputs, cards | |
| `--foreground` | `#2b1809` | `#0b0b0c` (`--ink`) | Primary text | |
| `--brand-primary` | `#2b1809` | `#0b0b0c` (`--ink`) | Primary CTA fill | |
| `--brand-primary-text` | `#ffffff` | `#ffffff` | Text on primary | |
| `--brand-secondary` | `#f0e7dd` | `#f0f0f0` (`--paper`) | Secondary chrome | |
| `--brand-secondary-text` | `#2b1809` | `#0b0b0c` (`--ink`) | Text on secondary | |
| `--brand-text` (legacy) | `#2b1809` | `#0b0b0c` | Alias of foreground / ink | |
| `--brand-surface` (legacy) | `#f6f0e9` | `#ffffff` | Alias of page background | |
| `--brand-accent` (legacy) | `#f0e7dd` | `#f0f0f0` | Soft chrome alias | |
| `--brand-accent-1` | `#0d9488` | `#0b0b0c` (`--ink`) | Light focus rings + former teal solid fills | See accent lock below — **not** lime on light |
| `--brand-accent-2` | `#0f766e` | `#6a6e6e` (`--muted`) | Link / hover emphasis | Replaces teal link color |
| `--dark-section-bg` | `#1a1510` | `#0b0b0c` | Dark bands | |
| `--dark-section-text` | `#faf8f6` | `#ffffff` | Text on dark | Body on dark may use `--mist` in components later |
| `--header-mobile-menu-bg` | `#e2ddd6` | `#f0f0f0` | Mobile menu sheet | |

**New product `:root` tokens** (mirror marketing; add in Phase 1):

| Token | Hex | Role |
| ----- | --- | ---- |
| `--ink` | `#0b0b0c` | Primary text / dark CTAs (alias-friendly name) |
| `--muted` | `#6a6e6e` | Secondary copy / accent-2 |
| `--mist` | `#b7bcbc` | Tertiary text on dark |
| `--lime` | `#9efc65` | Loud accent, logo dot, dark-surface focus only |
| `--pink` | `#ffbcfc` | Fill accent — not body text on light |
| `--pink-text` | `#c026a8` | Pink text on white/paper (WCAG AA) |
| `--paper` | `#f0f0f0` | Soft surface |
| `--white` | `#ffffff` | Page background alias |

### Accent / focus (locked)

Today `--brand-accent-1` is both **focus ring** and occasional **solid fill** (empty-state icon wells, view unavailable CTA). Lime fails WCAG as a focus ring on white (~1.1–1.3:1).

| Context | Locked rule |
| ------- | ----------- |
| Light focus | Ink — keep using `--brand-accent-1` → `#0b0b0c` so existing `focus:ring-[var(--brand-accent-1)]` works without a mass class rewrite |
| Dark focus | `--lime` outline when touching dark chrome in later phases |
| Loud accent (logo dot, rare badges) | `--lime` / `--pink` — **not** `--brand-accent-1` |
| Former teal solid fills | Become **ink** (or intentional lime fill + ink text only where loud). Do **not** reintroduce teal |

Primary actions such as Publish as a primary button use `--brand-primary` (ink) + `--brand-primary-text` — **not** `--brand-accent-2` (that token becomes muted link/hover emphasis). Solid teal CTAs that still use `bg-[var(--brand-accent-2)]` + white text must move to `--brand-primary` before or with the Phase 1 remap (card Publish fixed in `ApplicationCard`; also audit `DraftPreviewBanner`, `FileUpload`, `CvSourceField`, `CvUnavailableWithRetry`). Success **chips** / menu emphasis use the status pair below — distinct from primary CTAs.

### Status chips (locked)

| Status token | Today | Locked | Notes |
| ------------ | ----- | ------ | ----- |
| `--status-success-bg` / `--status-success-fg` | teal pair | `#e8fad9` / `#0b0b0c` | Soft lime wash + ink text; distinct from primary ink CTAs |
| `--status-draft-bg` / `--status-draft-fg` | warm amber | `#f0f0f0` / `#6a6e6e` | Paper + muted |
| `--status-warning-bg` / `--status-warning-fg` | warm amber | `#fff0fe` / `#c026a8` | Soft pink + `--pink-text` |
| `--status-danger-bg` / `--status-danger-fg` / `--status-danger-solid` | red pair | Keep `#fde8e4` / `#b42318` / `#b42318` | Unchanged family |

### Typography (locked)

| Role | Product today | Locked target |
| ---- | ------------- | ------------- |
| Body / UI | FunnelSans | Stack Sans Headline (`--font-stack-sans-headline`) |
| Headings | FunnelSans (FaunaOne available) | Switzer (`--font-switzer`) |
| Logo wordmark | Varela Round | Switzer + lime or pink accent dot (marketing daily-dot pattern OK) |

Reuse fonts via import from `app/(home)/fonts.ts` (or extract a shared fonts module) — do not load CDN stylesheets; do not edit marketing CSS for product fonts.

### Geometry (locked)

| Pattern | Product today | Locked direction |
| ------- | ------------- | ---------------- |
| Primary CTAs | `rounded-xl` | Pill `border-radius: 100px` |
| Dense form controls | `rounded-xl` | May stay `rounded-xl` for density |
| Cards | soft warm surfaces | `--paper`, radii ~20–30px; soft shadow only for floating menus |
| Logo | text wordmark | Wordmark + small colored circular dot |

### Gate: `Button` + `app/error.tsx` (locked)

**In-scope restyle** — one shared `Button`; global `app/error.tsx` adopts the new brand. No fork.

### Checklist

- [x] Color table locked (including accent / success decision)
- [x] Type + geometry direction locked
- [x] Compared `/`, `/login`, `/signup` (and `/admin` → login redirect) in browser after Phase 1 tokens/fonts landed

---

## Phase 1 — Foundations

**Touch:** `app/globals.css` (product-safe remaps only), fonts wiring for **product** layouts, product `components/ui/*` (`Logo` is product-only today; `Button` also feeds `app/error.tsx`).

**Must add** the new marketing-parity tokens to product `:root` (`--ink`, `--muted`, `--mist`, `--lime`, `--pink`, `--pink-text`, `--paper`, `--white`) alongside remapping existing `--brand-*` / status vars per Phase 0.

### Checklist

- [x] Remap product tokens in `globals.css` per Phase 0 without changing marketing look (include new tokens above)
- [x] Move remaining solid `bg-[var(--brand-accent-2)]` + white-text CTAs to `--brand-primary` (DraftPreviewBanner / FileUpload / CvSourceField / CvUnavailableWithRetry; dark unavailable CTA uses lime + ink)
- [x] Wire **product** layouts to marketing fonts via root `app/layout.tsx` importing `app/(home)/fonts.ts` (fonts module untouched)
- [x] Update product primitives (Button pill primary, Logo + accent dot in place; Input/Textarea keep `rounded-xl` + ink focus via `--brand-accent-1`; `Button` + `app/error.tsx` in-scope)
- [x] Grep full import graph — no frozen marketing paths edited for look/feel
- [x] Side-by-side visual compare `/`, `/login`, `/signup` (admin redirects when logged out) — marketing `/` still uses `.mhv-landing` chrome
- [x] Smoke: `/login`, `/signup` show white/ink/pill primary + Switzer/Stack Sans; `/` loads unchanged; `/admin` → login

---

## Phase 2 — Auth shell

**Touch:** `components/auth/*`, login/signup pages.

### Checklist

- [x] Auth chrome uses Reslink-inspired layouts with MHV tokens (login: centered white card on soft pink/lime atmosphere; signup: white/ink split shell + hire-view promo)
- [x] Password fields, alerts, focus states (paper inputs, pill submit with arrow well, visible labels, ink focus)
- [x] Keyboard / focus pass on `/login` and `/signup` (logo → alternate → fields; each password input is immediately followed by its show/hide toggle, then submit)
- [x] Reslink-style layout lives in production `components/auth` (demo `/demo/auth-reslink/*` removed)

---

## Phase 3 — Admin chrome + dashboard

**Touch:** admin header, empty state, search, application cards, checklist, legend, status icons.

### Checklist

- [x] Header + logo
- [x] Empty state, search, cards
- [x] Onboarding checklist + legend
- [x] Status icons readable on new surfaces
- [x] Prefer token/class updates over one-off hex

**Done (2026-10-16):** Shared `admin-chrome.ts` (ink pill primary, paper secondary/panel); AdminHeader nav pills + paper Sign Out; dashboard empty/search/cards/pagination/skeleton; onboarding checklist + status legend on paper/ink with lime progress accents. Forms stay Phase 4.

---

## Phase 4 — Forms (create / edit / profile)

Highest interaction density — watch contrast on inputs, tips, validation.

### Checklist

- [x] Create / edit application forms
- [x] Profile form + picture / CV library chrome
- [x] Validation / tip / dialog contrast OK

**Done (2026-10-16):** White inputs on paper panels; page shells + tips via `admin-chrome`; Button secondary bordered paper; ConfirmDialog + picture/CV modals on paper/ink; form field chrome remapped to ink/muted/white. Public `/view` stays Phase 5.

---

## Phase 5 — Public `/view`

Quiet chrome so CV / video stay primary; brand without looking like a marketing landing.

### Checklist

- [x] Header / footer / buttons match brand
- [x] Draft preview banner / unavailable states
- [x] Owner vs recruiter smoke

**Done (2026-10-16):** Paper panels + ink pill CTAs on header/CV chrome; draft banner pink-text warning + ink Publish; unavailable empty state LogoWhite + lime CTA (already); footer muted/ink; PDF loading/retry ink. Marketing `/` untouched. Docs/style-guide rewrite stays Phase 6.

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
| 2026-10-14 | Phase 0 locked — surfaces, accent/focus, status chips, type, geometry, Button/error in-scope | Phase 1 — foundations (`globals.css`, fonts, shared UI) |
| 2026-10-15 | Progress → Locked (not Done) until visual compare; ApplicationCard Publish → `--brand-primary` | Phase 1 — foundations + remaining accent-2 solid CTAs |
| 2026-10-15 | Phase 1 done: globals tokens, root fonts (Switzer/Stack Sans), Button/Logo, accent-2→primary CTAs; smoke `/` `/login` `/signup` | Phase 2 — auth shell polish |
| 2026-10-15 | Phase 2 done: auth paper panel, white inputs, pill submit, alerts + focus pass | Phase 3 — admin chrome + dashboard |
| 2026-10-15 | Auth split polish: ProIntro-style form + ink brand panel + hire-view mock | Phase 3 — admin chrome + dashboard |
| 2026-10-15 | Added style-only Reslink×MHV auth demos at `/demo/auth-reslink/login` + `/signup` | Compare demos vs production auth; then Phase 3 |
| 2026-10-15 | Phase 2 review fixes: tab-order docs, input focus-visible outline, brand/form safe scroll/center | Phase 3 — admin chrome + dashboard |
| 2026-10-15 | Promoted Reslink-style demo auth to production `/login` + `/signup`; demos redirect | Phase 3 — admin chrome + dashboard |
| 2026-10-15 | Removed `/demo/auth-reslink/*` after layout promotion to production | Phase 3 — admin chrome + dashboard |
| 2026-10-16 | Phase 3 done: admin-chrome tokens, header, empty/search/cards/pagination, checklist + legend | Phase 4 — forms (create / edit / profile) |
| 2026-10-16 | Phase 4 done: form shells, white inputs, tips/dialogs, profile + CV library chrome | Phase 5 — public `/view` |
| 2026-10-16 | Phase 5 done: quiet `/view` header/footer/CTAs, draft banner, unavailable + PDF chrome | Phase 6 — docs + QA |
