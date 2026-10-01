# Product UI style guide

> Source of truth for authenticated and public product surfaces: `/admin`, `/login`, `/signup`, `/view`, and shared `components/ui/*`.  
> Implementation today: `app/globals.css` + Tailwind utility classes using those CSS variables.  
> Marketing homepage uses a **different** system — see [STYLE_GUIDE_MARKETING.md](STYLE_GUIDE_MARKETING.md).

---

## 1. Brand personality (product)

| Trait | How it shows up |
| ----- | ---------------- |
| Warm, not corporate | Off-white backgrounds; brown-black ink instead of cool grey SaaS |
| Calm chrome | Soft surfaces, light rings, `rounded-xl` controls |
| Status with meaning | Teal for positive / publish; warm amber for draft; red only for destructive |
| Consistent with marketing only in *care*, not in *palette* | Same product voice; do **not** pull lime/pink marketing accents into admin unless deliberately bridging |

Voice: clear labels, sentence case, action-named buttons (“Publish”, “Save”, “Delete application”).

---

## 2. Color tokens

Defined on `:root` in `app/globals.css`:

### Surfaces & text

| Token | Hex | Role |
| ----- | --- | ---- |
| `--background` | `#f6f0e9` | Page background |
| `--secondary-background` | `#fcf6ef` | Alternate section / panel |
| `--surface` | `#f8f4ef` | Inputs, cards, elevated fields |
| `--foreground` | `#2b1809` | Primary text |

### Brand actions

| Token | Hex | Role |
| ----- | --- | ---- |
| `--brand-primary` | `#2b1809` | Primary buttons |
| `--brand-primary-text` | `#ffffff` | Text on primary |
| `--brand-secondary` | `#f0e7dd` | Secondary buttons / soft chrome |
| `--brand-secondary-text` | `#2b1809` | Text on secondary |
| `--brand-accent-1` | `#0d9488` | Focus rings, accent CTAs, positive emphasis |
| `--brand-accent-2` | `#0f766e` | Accent hover / stronger teal fill |

Legacy aliases (prefer the names above in new code): `--brand-text`, `--brand-surface`, `--brand-accent`.

### Dark product sections (rare)

| Token | Hex | Role |
| ----- | --- | ---- |
| `--dark-section-bg` | `#1a1510` | Dark bands if needed |
| `--dark-section-text` | `#faf8f6` | Text on dark bands |
| `--header-mobile-menu-bg` | `#e2ddd6` | Mobile menu sheet |

### Status / feedback

| Token | Hex | Role |
| ----- | --- | ---- |
| `--status-success-bg` / `--status-success-fg` | `#d8f3ef` / `#0f766e` | Success chips |
| `--status-draft-bg` / `--status-draft-fg` | `#f3e4d4` / `#8a5a2b` | Draft |
| `--status-warning-bg` / `--status-warning-fg` | `#f8edd9` / `#7a4e1e` | Warning |
| `--status-danger-bg` / `--status-danger-fg` | `#fde8e4` / `#b42318` | Error text / soft danger |
| `--status-danger-solid` | `#b42318` | Danger button fill |

Avoid generic bright “SaaS green” outside the teal success tokens above.

---

## 3. Typography

| Role | Family | CSS variable | Where |
| ---- | ------ | ------------ | ----- |
| Body / UI / headings in product | FunnelSans | `--font-funnelsans` | `body`, most `h*` |
| Optional display (legacy / marketing-adjacent) | FaunaOne | `--font-faunaone` | Available; product currently uses FunnelSans for headings |
| Logo wordmark in product chrome | Varela Round | `--font-varelaround` | `#logo`, `#marketing-nav-link` |

Base: FunnelSans on `body` with `--foreground` on `--background`.

---

## 4. Layout & shape

| Pattern | Guidance |
| ------- | -------- |
| Corner radius | Controls and cards: `rounded-xl` (~12px). Prefer this over full pills in product UI |
| Focus | `focus-visible` rings using `--brand-accent-1` or outline with `--brand-primary` |
| Inputs | `bg-[var(--surface)]`, inset ring `ring-[var(--foreground)]/15`, focus ring teal |
| Spacing | Comfortable padding (`px-3.5 py-2.5` on fields); avoid cramped admin tables |

---

## 5. Components

### Buttons (`components/ui/Button.tsx`)

- **Primary:** `--brand-primary` fill, white text.  
- **Secondary:** `--brand-secondary` fill, primary text.  
- **Danger:** `--status-danger-solid` fill, white text.  
- Shared: `rounded-xl`, `text-sm font-semibold`, disabled opacity 50%, loading replaces label.

Accent / publish-style actions in admin may use `--brand-accent-2` solid fills (see dashboard card actions) — treat as “positive primary”, not a fourth random color.

### Links styled as buttons

`PrimaryLinkButton` / `ExternalLinkButton` should follow the same primary/secondary tokens.

### Forms

- Labels: `text-sm font-medium` in `--foreground`.  
- Errors: `--status-danger-fg` helper text; ring tint on the field.  
- Auth pages reuse `AUTH_INPUT_CLASS` / `AUTH_SUBMIT_CLASS` in `components/auth/auth-form-styles.ts` for consistency with the warm shell.

### Status chips

Pair `*-bg` + `*-fg` tokens; don’t invent one-off greens/oranges.

---

## 6. Surfaces by route

| Surface | Expectation |
| ------- | ----------- |
| `/admin` | Warm background, surface cards, teal focus, status chips for draft/published |
| `/login`, `/signup` | Logo shell + warm panel; same input/button tokens as admin |
| `/view` | Public application page — same brand tokens; keep chrome quiet so CV/video dominate |

When backlog items say “align with homepage warm palette”, they mean **this** file’s tokens — not the marketing lime/pink system.

---

## 7. Do / don’t

| Do | Don’t |
| -- | ----- |
| Use CSS variables from `globals.css` | Hard-code hex in components unless adding a new token |
| Use teal for focus and positive product actions | Copy marketing `--lime` / `--pink` into admin forms |
| Keep radius and ring patterns consistent | Mix `rounded-full` pills with `rounded-xl` arbitrarily |
| Name buttons by outcome | Generic “OK” / “Submit” when a specific verb exists |

---

## 8. Checklist for a new product screen

1. Page sits on `--background` (or deliberate `--secondary-background` band).  
2. Text uses `--foreground` / muted opacity of foreground — not raw gray utilities that fight the warm palette.  
3. Primary / secondary / danger actions use `Button` or the same token classes.  
4. Inputs match surface + ring + teal focus.  
5. Status uses the status token pairs.  
6. No dependency on `mhv-demo.css` or Switzer/Stack Sans unless the screen is intentionally marketing.
