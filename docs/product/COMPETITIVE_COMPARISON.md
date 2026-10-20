# MyHireView — Competitive comparison

Living list of where MyHireView **wins** vs competitors, and where it **lags** (things competitors do that we do not, or do worse).

**Default comparison:** Unless an item says otherwise, every entry is vs **Reslink** (the primary competitor). Other vendors get their own section only when we add them.

**Impact:** How much the gap matters when choosing or sticking with a product. Rate **High / Medium / Low**, and always add a short **Impact evaluation** that justifies the rating (who cares, when it shows up, why it is or isn’t a deal-breaker).

| Rating | Meaning |
| ------ | ------- |
| **High** | Likely to change whether someone chooses MHV (or switches from Reslink). Strong pitch / serious gap. |
| **Medium** | Noticeable in day-to-day use; worth mentioning, not a deal-breaker alone. |
| **Low** | Nice-to-have or niche; small edge or small miss. |

**Layout:** One heading per item (not a wide table). Under each: **Impact**, **Impact evaluation**, **Notes**, then **Decision** (brief — e.g. keep as it is, don’t update, or a concrete product change).

**How to add items:** Keep prose short. **Notes** = what one product does and what the other lacks. **Impact evaluation** = why that rating. **Decision** = what we do about it (one line). Prefer shipped product behavior over roadmap ideas. Gaps here are observations, not backlog tickets — promote to [Backlog.md](Backlog.md) when you decide to act.

**Related:** [GO_TO_MARKET.md](GO_TO_MARKET.md) · [ACTIVATION_UX_F19.md](../retrospectives/ACTIVATION_UX_F19.md) · [USER_GUIDE.md](../engineering/USER_GUIDE.md)

---

## Reslink

### Where MHV wins

#### Edit live applications

- **Impact:** High
- **Impact evaluation:** Mistakes and updates usually show up *after* a link is shared (typo, wrong CV, new video). Draft-only edit does not help then — candidates must recreate (new URL / lost analytics) or live with the error. Day-to-day pain that can drive churn once something goes live; strong switch reason and a clear pitch vs Reslink.
- **Notes:** MHV lets candidates edit any application from the dashboard (3-dot menu → **Edit**), including after publish. Reslink allows editing **drafts only** — once live, no edit.
- **Decision:** Keep as it is — pitch as a clear win vs Reslink.

#### Primary CV library (reuse across applications)

- **Impact:** High
- **Impact evaluation:** Active job searches mean many applications. Re-uploading the same résumé each time is busywork and error-prone; a reusable primary library speeds create/edit and is a clear day-to-day reason to prefer MHV. Strong pitch vs Reslink’s upload-every-time flow (MHV still allows a tailored one-off PDF when the role needs it).
- **Notes:** MHV has a **Primary CV library** (currently **5** for every account — API/DB enforced) managed from Account settings and from New/Edit via **Manage library** — pick a primary for an app or upload tailored. A higher **Premium** cap (planned **15**) is a working pricing decision, not shipped yet. Reslink does not offer a primary CV library; users upload a CV each time.
- **Decision:** Keep as it is — pitch as a clear win vs Reslink.

#### Getting started checklist

- **Impact:** Medium
- **Impact evaluation:** Speeds first-session activation toward a shareable link, but candidates rarely pick a tool *because* of a checklist — they notice it after signup. Strong for retention of confused new users; weak as a headline differentiator.
- **Notes:** MHV shows a floating **Getting started** panel on `/admin` that guides new accounts through profile → location/link → photo → primary CV → first application → publish/share. Reslink does not show an equivalent checklist.
- **Decision:** Keep as it is.

#### Quarterly billing (vs annual)

- **Impact:** Medium
- **Impact evaluation:** Job searches usually last weeks–months, so a 3-month plan matches usage better than a year lock-in and lowers commitment anxiety at checkout. Reslink already offers monthly, so this is not unique “flexibility” — the edge is a discounted middle tier without annual prepay. Helps conversion and messaging; rarely the sole reason to switch.
- **Notes:** MHV plans **monthly + quarterly** (no annual) — working draft / `E4-116`. Reslink offers monthly and annual (no quarterly).
- **Decision:** Keep as planned (`E4-116`) — ship monthly + quarterly, no annual.

### Where Reslink wins

#### Clickable badge embedded in CV PDF

- **Impact:** High
- **Impact evaluation:** Most applications still go through ATS / email as a PDF. A one-click badge turns every résumé file into a path to the video page without relying on the candidate to paste a URL in a cover letter. Auto-stamping every copy plus badge-click insights deepen the apply-flow moat. MHV’s product assumes you share the public link; without a PDF bridge, recruiters who only open the attachment never reach the hire-view. Strong reason to prefer Reslink when PDF-first applies dominate.
- **Notes:** Reslink embeds a clickable **Reslink badge** into the résumé PDF: recruiters open the PDF → tap badge → land on the Reslink (video, history, contact). Applied to every version automatically; badge clicks show in insights. MHV has no PDF badge / auto-link injection — CV downloads are plain PDFs; the share URL is separate.
- **Decision:** Don’t update for now — revisit after launch; do not block current work.

#### Username / vanity handle as default (vs opaque public id)

- **Impact:** Medium *(strategically High for packaging / `J1-126`)*
- **Impact evaluation:** Reslink’s signup **username** looks more professional than MHV’s opaque **public id**, and Free users get branded paths without paying. Recruiters click whatever they are sent, so this is first-impression branding more than a hire-deciding gap — but Premium-only vanity (the superseded plan) risked paid buyers failing to claim a name after checkout. Tradeoff: usernames are more identifying than opaque ids (less “private link” by default).
- **Notes:** **Terminology:** Reslink **username** / **handle** ≈ MHV **public id**. Reslink auto-generates at signup, allows edit, and blocks continue if taken (*“That handle is already taken”* / *“Pick an available Reslink username to continue.”*). MHV today still ships opaque `public_id` only; **planned** work is username for all tiers (`J1-126`), not the abandoned Premium-only vanity (cancelled `J1-079`). After username ships, drop form **Name in URL** (`J5-128`). Decision context: this section + [Backlog.md](Backlog.md) (`J4-125` → `J1-126` → `J5-128`). Older vanity notes in [PUBLIC_URL_OPTION_B.md](../retrospectives/PUBLIC_URL_OPTION_B.md#future-custom-public-id-vanity-handle) and [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md) are **superseded** pending `J4-125`.
- **Decision:** MHV to copy username for all tiers at signup Reslink-style — not Premium-only vanity. Prefer signup claim (honest collisions before payment; simpler than opaque→later vanity). Accept the privacy cost (name-like URLs identify more than opaque ids); keep opaque as internal/canonical if useful and optional private-link later. Once username ships, retire create/edit **Name in URL** (None / At start / At end) — branding moves to the username segment; name-in-slug was an opaque-id collision workaround (`J5-128`). Premium branding via durable unlocks (`N0`–`N3`, analytics, caps). Backlog: `J4-125` (pricing/docs) → `J1-126` (implement) → `J5-128` (drop Name in URL).

#### Cover photo on applications

- **Impact:** Low
- **Impact evaluation:** Visual polish on the public page; optional and easy to ignore. Few candidates will leave MHV solely for a banner image when profile picture, CV, and video already carry identity.
- **Notes:** Reslink lets candidates add a cover photo that appears on applications. MHV has no cover-photo option — only profile picture (and application media such as CV / video).
- **Decision:** Don’t update.

#### Shorter share-path prefix (`/r` vs `/view`)

- **Impact:** Low
- **Impact evaluation:** Reslink’s `/r/...` saves a few characters vs MHV’s `/view/...`. Recruiters click links; path aesthetics rarely matter, and `/view` is clearer about what the URL is. Barely a Reslink win on brevity — close to a wash.
- **Notes:** Example MHV: `/view/{publicId}/{slug}` (e.g. `/view/f4592wty/volvo-producer`). Example Reslink: `/r/{username}/{slug}` (e.g. `/r/joan-gerard/joan-gg-lead-dev-volvo`).
- **Decision:** Keep `/view` — clarity over a shorter opaque prefix; optional short alias later only if link length becomes a real pain (SMS, badges).

---

## Other competitors

_None listed yet. Add a heading per product when we compare beyond Reslink._
