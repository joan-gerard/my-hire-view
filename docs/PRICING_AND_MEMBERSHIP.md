# Pricing & membership

**Purpose of this doc:** Working decisions on Free / Pro / Premium for MyHireView, plus open questions for feedback. It is **not** a second backlog — actionable engineering work lives in [Backlog.md](Backlog.md).

**Status:** Plan names and the tier matrix below are **working decisions**. Price points and several numeric caps are still open (see §5). Nothing here is implemented as a billing gate yet.

Homepage marketing FAQ copy is **placeholder** and is intentionally **not** used here as input for what tiers should offer.

**Related context:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) · [USER_GUIDE.md](USER_GUIDE.md) · launch billing items in [Backlog.md](Backlog.md) (Before launch → Must)

| Section | What it covers |
| ------- | -------------- |
| [§1 Product breakdown](#1-product-breakdown) | What MyHireView is and the building blocks tiers gate |
| [§2 Product principles](#2-product-principles-already-decided-in-docs) | Launch / billing rules already decided elsewhere |
| [§3 Tiers](#3-tiers--free--pro--premium) | Free · Pro · Premium matrix, per-tier detail, adjacent features |
| [§4 Source excerpts](#4-source-excerpts-verbatim-intent) | Verbatim intent from earlier docs |
| [§5 Still undefined](#5-still-undefined-to-decide-when-designing-tiers) | Open caps, prices, and gating questions (feedback targets) |
| [§6 How to keep this current](#6-how-to-keep-this-current) | Maintenance rules for this doc and `/pricing` |

---

## 1. Product breakdown

### What MyHireView is

**MyHireView** helps **job seekers** create a **dedicated landing page per job application** — CV (PDF), video pitch (YouTube URL), and contact info — shared via a public link that **recruiters can open without logging in**.

There are two product surfaces:

| Surface | Who | Role |
| ------- | --- | ---- |
| **Marketing** (`/`, `/pricing`) | Visitors | Explain the product, waitlist / launch interest, plan overview |
| **Product** (`/admin`, public `/view/…`) | Candidates + recruiters | Create and manage applications; recruiters view shared pages |

### Who uses it

| Role | What they do |
| ---- | ------------ |
| **Candidate** (job seeker) | Signs up, maintains a profile and primary CV library, creates/edits applications, copies share links, checks basic engagement metrics |
| **Recruiter** | Opens a shared link — no account required — to view CV, video pitch, and candidate details |

### Building blocks (what “an application” includes)

These are the core concepts the tier matrix refers to. Full product behaviour: [USER_GUIDE.md](USER_GUIDE.md), [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md), [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md).

| Building block | Meaning |
| -------------- | ------- |
| **Application** | One company + role page: CV, optional video, candidate snapshot, shareable URL. Status: active / archived / deleted. |
| **Profile** | Account defaults (name, location, LinkedIn, portfolio, profile picture) used when creating applications. |
| **Primary CV library** | Up to **5** résumé PDFs owned by the profile and reusable across applications. Product max today: `PRIMARY_CV_MAX_PER_USER` = 5. |
| **Tailored CV** | A one-off PDF uploaded for a **single** application (role-specific version), in addition to the primary library. |
| **Public link** | Shape: `/view/{publicId}/{slug}`. Default **public id** is an opaque account id (not the user’s name). Slug is derived from company/role (optional name-in-URL). |
| **Vanity public id** | Optional custom public id (e.g. `/view/joan-gerard/…`) — planned as a Premium-style branding unlock. |
| **Video pitch** | YouTube URL embedded on the public page (upload-not-in-product today). |
| **Basic analytics** | As shipped today: view count, CV download count, created / last viewed (View Insights). Owner self-views are excluded from counts. |

### What every plan is built on (not the paid differentiators)

Unless a row in §3 says otherwise, candidates on **any** plan are expected to use the same core loop:

- Profile + dashboard (create, edit, archive, restore, delete applications)
- Application page with CV + optional video + candidate details
- Shareable recruiter link (no login for the viewer)
- Primary CV library (within the product’s library size rules)
- Basic analytics (as shipped today)

**Tiers mainly differ on:** how many applications you can have, whether you can upload **tailored** CVs, public-link branding (opaque vs vanity), analytics depth, and (optionally) primary-library size.

---

## 2. Product principles (already decided in docs)

| Principle | Source |
| --------- | ------ |
| Public launch should include **paid access**. | [Backlog.md](Backlog.md), [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Free access, if any, is a **free tier and/or trial only** — not unlimited free use of the app. | Same |
| Creating / using applications should be **gated** behind an active plan or trial. | Same |
| Billing provider direction: **Stripe (or similar)** — checkout, webhooks, Supabase subscription state. | Same |
| `/pricing` must ship **real tiers aligned with billing**, not a stub. | Same; `/pricing` now shows draft Free/Pro/Premium from §3 (E3-014). Prices/caps still TBA until E1/E2 finalize. |

---

## 3. Tiers — Free · Pro · Premium

Working plan names: **Free**, **Pro**, **Premium**. Nothing below is implemented as a billing gate yet.

**Design intent:** Tailored CVs are the main paid unlock on **Pro** (core product promise: a CV that matches the role). **Premium** adds branding, higher/unlimited scale, and richer analytics — not “you may finally tailor a CV.”

### 3.1 Comparison matrix (at a glance)

| Dimension | Free | Pro | Premium |
| --------- | ---- | --- | ------- |
| **Positioning** | Try the product with a hard cap | Core paid unlock: tailored CVs | Branding, scale, richer insight |
| **Applications** | Up to **3** (hard cap) | **Higher** than Free — exact number TBD (above 3; at or below Premium) | **Higher or unlimited** — exact cap TBD (above Pro, or unlimited) |
| **CV workflow** | **Primary CVs only** (default). Optional later: very tight tailored allowance (e.g. 1) — undecided; assume primary-only until then | **Primary + tailored** per application | Same as Pro (everything in Pro) |
| **Primary library size** | Today’s global max (**5**) | Today’s global max (**5**) | May **raise** above 5 — exact number TBD (optional differentiator) |
| **Public id** | Opaque (`/view/{opaquePublicId}/{slug}`) | Opaque (same as Free unless Premium vanity is claimed) | **Custom vanity** public id (e.g. `/view/joan-gerard/…`) |
| **Analytics** | Basic (views, CV downloads, created / last viewed) | At least basic; richer metrics reserved for Premium unless we later move some to Pro | **Richer** than today’s view + download counts (events / dashboards / exports TBD) |
| **Price** | Free (no card required — marketing framing) | TBA | TBA |

### 3.2 Free — detail

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| **Up to 3 applications** | Hard cap. | Working decision (this doc) |
| **Primary CVs only** (default) | Upload/use the primary library; no full tailored-CV workflow. Optionally allow a **very tight** tailored allowance later (e.g. 1) — default assumption is **primary-only** until that is decided. | Working decision (this doc); primary/tailored model in [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md) |
| Opaque public id | Default `/view/{opaquePublicId}/{slug}`. | [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md) |
| Basic analytics (as shipped today) | View count, CV download count, created / last viewed (View Insights). | [USER_GUIDE.md](USER_GUIDE.md), [DATA_FLOW.md](DATA_FLOW.md) |

### 3.3 Pro — detail

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| **Primary + tailored CVs** | Real paid unlock: per-application tailored uploads in addition to the primary library. | Working decision (this doc) |
| **Higher application cap** than Free | Exact number TBD (above 3; at or below Premium). | Working decision (this doc) |
| Opaque public id | Same as Free unless Premium vanity is claimed. | — |
| Analytics | At least today’s basic metrics; richer analytics reserved for Premium unless we later move some to Pro. | Working decision (this doc) |

### 3.4 Premium — detail

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| Everything in Pro | Including primary + tailored CVs. | Working decision (this doc) |
| **Custom vanity public id** | LinkedIn-style branded public id (e.g. `/view/joan-gerard/...`). | [Backlog.md](Backlog.md) (After launch → Could), [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md#future-custom-public-id-vanity-handle) |
| **Higher or unlimited applications** | Exact cap TBD (above Pro, or unlimited). | Working decision (this doc) |
| **Richer analytics** | Beyond today’s view + download counts (events / dashboards / exports TBD). | Working decision (this doc) |
| **Larger primary library** (optional) | Today’s product max is **5** primaries; Premium may raise that. Exact number TBD. | [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md), API `PRIMARY_CV_MAX_PER_USER` |

### 3.5 Adjacent (not tiered yet)

These ideas exist in product docs / backlog but are **not** assigned to Free, Pro, or Premium.

| Item | Notes | Sources |
| ---- | ----- | ------- |
| AI interview prep (Phases 1–2) | Product idea / backlog Could — **not** assigned to Free, Pro, or Premium. | [product-ideas/ai-powered-interview-preparation.md](product-ideas/ai-powered-interview-preparation.md), [Backlog.md](Backlog.md) |
| In-app video recording + teleprompter | Pre-launch nice-to-have — **not** assigned to a tier. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |

---

## 4. Source excerpts (verbatim intent)

### Launch / billing direction

> Define plans (paid + optional free tier / trial), per-tier limits, price points. Do **not** launch with unlimited free app access.

> Stripe (or similar): checkout, webhooks, Supabase subscription state; gate creating/using applications behind an active plan or trial.

> Ship real tiers on `/pricing` aligned with billing — not a stub.

— [Backlog.md](Backlog.md); same substance in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

### Vanity public id as premium

> A planned enhancement (potentially **premium**): Let users choose a custom **public id** … Natural fit for a paid tier (custom branding).

— [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md)

---

## 5. Still undefined (to decide when designing tiers)

Use this list as the main **feedback checklist** — each item is still open.

### Pricing

- Price points and billing interval (monthly / annual).

### Caps & allowances

- Exact Pro application cap; Premium higher vs unlimited.
- Free: stay **primary-only**, or allow a very tight tailored allowance (e.g. 1).
- Exact Premium primary-library size (today’s global max is 5).

### Feature depth

- What “richer analytics” includes (events, dashboards, exports, etc.).
- Whether future features (AI prep, in-app recording) are Free, Pro, Premium, or separate add-ons.

### Enforcement

- How gating is enforced in API/UI (application create cap, reject `cv_type: "tailored"` on Free, vanity claim on Premium, etc.).

---

## 6. How to keep this current

1. As remaining caps and prices land, tighten §3 / §5 and treat this doc as the source of truth for pricing.
2. Keep `/pricing` (and any other marketing surfaces) aligned with this matrix — tier copy lives in `components/public/pricing/constants.ts`.
3. When pricing or billing work ships, update [Backlog.md](Backlog.md) (remove or strike the row). Do not keep a parallel open checklist here.
