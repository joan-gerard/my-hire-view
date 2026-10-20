# Product UI style guide

> Source of truth for authenticated and public product surfaces: `/admin`, `/login`, `/signup`, `/view`, and shared `components/ui/*`.  
> Implementation: `app/globals.css` + Tailwind utilities on those CSS variables; admin density helpers in `components/admin/admin-chrome.ts`.  
> Product chrome shares the **marketing brand system** (ink / paper / lime / pink, Switzer + Stack Sans) — see [STYLE_GUIDE_MARKETING.md](STYLE_GUIDE_MARKETING.md). Marketing layouts stay separate (`.mhv-landing` / `mhv-demo.css`); do not import marketing CSS into product.  
> Implementation history: [F34_PRODUCT_MARKETING_BRANDING.md](F34_PRODUCT_MARKETING_BRANDING.md) (`F34-118` shipped).

---

## 1. Brand personality (product)

| Trait                                             | How it shows up                                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Ink on paper                                      | Near-black text/CTAs on white or soft paper; calm, task-dense chrome                                        |
| Loud accents sparingly                            | Lime and pink for logo dots, status energy, dark-surface focus, rare fills — not default body text on light |
| Clear status language                             | Soft success / draft / warning / danger chips; dashboard dots or high-contrast glyphs                       |
| Same brand system as marketing, different density | Product stays compact and form-led; marketing stays spacious                                                |

Voice: clear labels, sentence case, action-named buttons (“Publish”, “Save”, “Delete application”).

---

## 2. Color tokens

Defined on `:root` in `app/globals.css`:

### Core brand (prefer these names in new code)

| Token         | Hex       | Role                                               |
| ------------- | --------- | -------------------------------------------------- |
| `--ink`       | `#0b0b0c` | Primary text, dark CTAs, light-surface focus       |
| `--muted`     | `#6a6e6e` | Secondary copy, link/hover emphasis                |
| `--mist`      | `#b7bcbc` | Tertiary text on dark                              |
| `--lime`      | `#9efc65` | Loud accent, logo dot, **dark-surface focus only** |
| `--pink`      | `#ffbcfc` | Fill accent — not body text on light               |
| `--pink-text` | `#c026a8` | Pink text on white/paper (WCAG AA)                 |
| `--paper`     | `#f0f0f0` | Soft surface / page wash / quiet chips             |
| `--white`     | `#ffffff` | Page background, white panels                      |

### Surfaces & legacy aliases

| Token                    | Hex       | Role                                            |
| ------------------------ | --------- | ----------------------------------------------- |
| `--background`           | `#ffffff` | Page background (`--white`)                     |
| `--secondary-background` | `#f0f0f0` | Alternate bands (`--paper`)                     |
| `--surface`              | `#f0f0f0` | Soft fields / nested wells (`--paper`)          |
| `--foreground`           | `#0b0b0c` | Primary text (`--ink`)                          |
| `--brand-primary`        | `#0b0b0c` | Primary CTA fill                                |
| `--brand-primary-text`   | `#ffffff` | Text on primary                                 |
| `--brand-secondary`      | `#f0f0f0` | Soft secondary chrome                           |
| `--brand-secondary-text` | `#0b0b0c` | Text on secondary                               |
| `--brand-accent-1`       | `#0b0b0c` | Light focus rings (ink — **not** lime on light) |
| `--brand-accent-2`       | `#6a6e6e` | Muted link / hover emphasis                     |

Also: `--brand-text`, `--brand-surface`, `--brand-accent` (legacy aliases of ink / white / paper). Prefer `--ink` / `--paper` / `--white` in new work.

### Dark product sections

| Token                     | Hex       | Role              |
| ------------------------- | --------- | ----------------- |
| `--dark-section-bg`       | `#0b0b0c` | Dark bands        |
| `--dark-section-text`     | `#ffffff` | Text on dark      |
| `--header-mobile-menu-bg` | `#f0f0f0` | Mobile menu sheet |

On dark chrome, focus may use `--lime`. Body secondary on dark may use `--mist`.

### Status / feedback

| Token                                         | Hex                   | Role                  |
| --------------------------------------------- | --------------------- | --------------------- |
| `--status-success-bg` / `--status-success-fg` | `#e8fad9` / `#0b0b0c` | Soft lime wash + ink  |
| `--status-draft-bg` / `--status-draft-fg`     | `#f0f0f0` / `#6a6e6e` | Paper + muted         |
| `--status-warning-bg` / `--status-warning-fg` | `#fff0fe` / `#c026a8` | Soft pink + pink-text |
| `--status-danger-bg` / `--status-danger-fg`   | `#fde8e4` / `#b42318` | Error / soft danger   |
| `--status-danger-solid`                       | `#b42318`             | Danger button fill    |

### Dashboard status markers

Account preference (Account settings → **Preferences**): colorful dots (default) or high-contrast wash + ink glyphs.

| Token                   | Hex                 | Role                              |
| ----------------------- | ------------------- | --------------------------------- |
| `--status-dot-draft`    | `#fcdc65`           | Colorful draft                    |
| `--status-dot-active`   | `#6ed4fc`           | Colorful active (not viewed)      |
| `--status-dot-viewed`   | `#9efc65`           | Colorful active (viewed)          |
| `--status-dot-archived` | `#c5c9c9`           | Colorful archived                 |
| `--status-wash-*`       | (see `globals.css`) | High-contrast washes under glyphs |

Do **not** reintroduce teal as a brand accent. Red stays for destructive only.

---

## 3. Typography

Wired via root `app/layout.tsx` importing `app/(home)/fonts.ts` (do not edit marketing CSS for product fonts).

| Role          | Family              | CSS variable                 | Where                          |
| ------------- | ------------------- | ---------------------------- | ------------------------------ |
| Body / UI     | Stack Sans Headline | `--font-stack-sans-headline` | `body`, Tailwind `--font-sans` |
| Headings      | Switzer             | `--font-switzer`             | `h1`–`h6`, `font-heading`      |
| Logo wordmark | Switzer             | `--font-switzer`             | `#logo`, product `Logo`        |

Local FunnelSans / FaunaOne / Varela Round `@font-face` rules remain for leftovers — **do not** use them for new product UI.

---

## 4. Layout & shape

| Pattern          | Guidance                                                                                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page wash        | Admin: soft `--paper` page; content in white bordered panels (`ADMIN_PANEL_CLASS`)                                                                                                                                                                                               |
| Primary CTAs     | Pill (`rounded-full` / ~100px) — ink fill + white text                                                                                                                                                                                                                           |
| Dense controls   | Inputs, secondary/danger buttons, fieldsets: `rounded-xl`                                                                                                                                                                                                                        |
| Panels / dialogs | In-flow panels (`ADMIN_PANEL_CLASS`): `rounded-2xl` (16px). Floating dialogs/modals: larger radius (`rounded-[28px]` ≈ 28px). Soft shadow (`shadow-lg` / similar) for **floating** surfaces: menus, confirm/status dialogs, library/picture modals — not for in-flow page panels |
| Focus            | Light surfaces: ink outline / `--brand-accent-1`. Dark surfaces: lime when appropriate                                                                                                                                                                                           |
| Inputs           | Prefer **white** fields on paper panels; ink focus ring — not lime on light                                                                                                                                                                                                      |
| Logo             | Wordmark + small lime (or pink) circular accent dot                                                                                                                                                                                                                              |

Shared admin class strings: `components/admin/admin-chrome.ts` (`ADMIN_PRIMARY_CLASS`, `ADMIN_SECONDARY_CLASS`, `ADMIN_PANEL_CLASS`, …).

---

## 5. Components

### Buttons (`components/ui/Button.tsx`)

- **Primary:** ink pill, white text.
- **Secondary:** white + ink border, `rounded-xl`.
- **Danger:** `--status-danger-solid`, `rounded-xl` (not a pill).
- Loading: spinner + `loadingLabel`, light pulse, `aria-busy`.

Loud accent CTAs (e.g. Create application) may use lime fill + ink text (`ADMIN_ACCENT_PRIMARY_CLASS`) — reserve for one primary create action, not every button.

### Links styled as buttons

- `PrimaryLinkButton` — ink pill (same family as primary `Button`).
- `ExternalLinkButton` — `portfolio` variant is ink pill; **`linkedin` variant intentionally uses LinkedIn blue** (`#0A66C2` / hover `#004182`) so the control stays recognizable — do not restyle it to ink.

### Forms

- Labels: `text-sm font-medium` in `--ink`.
- Helper / muted: `--muted`.
- Errors: `--status-danger-fg`; ring tint on the field.
- Auth: `components/auth/auth-form-styles.ts` + Reslink-inspired shells (white card / split ink panel).

### Status chips & dialogs

Pair `*-bg` + `*-fg` tokens. Confirm / library modals use paper/white + ink; destructive confirm may use danger button + warning wash for copy.

---

## 6. Surfaces by route

| Surface              | Expectation                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `/admin`             | Paper page wash, white panels, ink nav + pills, lime Create CTA, status dots/glyphs                  |
| `/login`, `/signup`  | White/ink auth shells, Switzer headings, pill submit; soft pink/lime atmosphere OK on auth only      |
| `/view`              | Quiet paper/ink chrome so CV / video stay primary; draft banner uses pink-text warning + ink Publish |
| Marketing `/`, legal | **Frozen for product work** — `.mhv-landing` / marketing components; see marketing guide             |

Product and marketing share tokens and fonts; they do **not** share layout CSS. Never pull `mhv-demo.css` into admin.

---

## 7. Do / don’t

| Do                                                                     | Don’t                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Use CSS variables from `globals.css` (`--ink`, `--paper`, `--lime`, …) | Hard-code marketing hex in many components                       |
| Use lime/pink for accents, logo dots, status energy, dark focus        | Use lime as a focus ring on white/paper (~fails contrast)        |
| Use `--pink-text` for pink **copy** on light                           | Use bright `--pink` as body text on light                        |
| Keep primary CTAs ink pills; dense fields `rounded-xl`                 | Make every control a pill, or mix radii without reason           |
| Name buttons by outcome                                                | Generic “OK” / “Submit” when a specific verb exists              |
| Fork or scope if a change would restyle marketing                      | Edit `components/marketing/*` or `mhv-demo.css` to “fix” product |

---

## 8. Checklist for a new product screen

1. Page sits on `--background` / `--white`, or deliberate `--paper` wash with white panels.
2. Text uses `--ink` / `--muted` — not warm-brown or teal leftovers.
3. Primary / secondary / danger actions use `Button` or `admin-chrome` classes.
4. Inputs are white (or paper) with **ink** focus on light surfaces.
5. Status uses the status token pairs (or dashboard dot/wash tokens).
6. Lime/pink appear as intentional accents — not a full-page wash on dense forms.
7. No dependency on `mhv-demo.css` unless the screen is intentionally marketing.
