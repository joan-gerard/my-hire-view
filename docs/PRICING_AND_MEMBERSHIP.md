# Pricing & membership

**Purpose of this doc:** Working decisions on Free / Pro / Premium for MyHireView. It is **not** a second backlog — actionable engineering work lives in [Backlog.md](Backlog.md).

**Status:** Plan names, monthly and annual USD prices, numeric caps, Free primary-only, analytics split, and application-cap counting rules below are **working decisions**. Billing gates (Stripe checkout, API/UI enforcement) are **not** implemented yet — that is E2. Display currency on `/pricing` is **USD**; Stripe adaptive/local presentment can come later with checkout.

Homepage marketing FAQ copy is **placeholder** and is intentionally **not** used here as input for what tiers should offer.

**Related context:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) · [USER_GUIDE.md](USER_GUIDE.md) · launch billing items in [Backlog.md](Backlog.md) (Before launch → Must) · customer-facing tier copy in `components/public/pricing/constants.ts`

| Section | What it covers |
| ------- | -------------- |
| [§1 Product breakdown](#1-product-breakdown) | What MyHireView is and the building blocks tiers gate |
| [§2 Product principles](#2-product-principles-already-decided-in-docs) | Launch / billing rules already decided elsewhere |
| [§3 Tiers](#3-tiers--free--pro--premium) | Free · Pro · Premium matrix, enforcement, adjacent features |
| [§4 Source excerpts](#4-source-excerpts-verbatim-intent) | Verbatim intent from earlier docs |
| [§5 Still open](#5-still-open) | Remaining TBD items (checkout UX, when to build adjacent features, API gates) |
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
| **Candidate** (job seeker) | Signs up, maintains a profile and primary CV library, creates/edits applications, copies share links, checks engagement metrics |
| **Recruiter** | Opens a shared link — no account required — to view CV, video pitch, and candidate details |

### Building blocks (what “an application” includes)

These are the core concepts the tier matrix refers to. Full product behaviour: [USER_GUIDE.md](USER_GUIDE.md), [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md), [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md).

| Building block | Meaning |
| -------------- | ------- |
| **Application** | One company + role page: CV, optional video, candidate snapshot, shareable URL. Status: active / archived / deleted. |
| **Profile** | Account defaults (name, location, LinkedIn, portfolio, profile picture) used when creating applications. |
| **Primary CV library** | Résumé PDFs owned by the profile and reusable across applications. Free/Pro max **5**; Premium max **15**. |
| **Tailored CV** | A one-off PDF uploaded for a **single** application (role-specific version), in addition to the primary library. Pro/Premium only; optional per application (primary still allowed). |
| **Public link** | Shape: `/view/{publicId}/{slug}`. Default **public id** is an opaque account id (not the user’s name) — marketed as a **private shareable link**. Slug is derived from company/role (optional name-in-URL). |
| **Vanity public id** | Custom public id (e.g. `/view/joan-gerard/…`) — Premium branding unlock. |
| **Video pitch** | YouTube URL embedded on the public page (included on every plan). In-app recording/hosting is a separate future feature. |
| **Basic analytics** | Aggregate view count, CV download count, created / last viewed (View Insights). Owner self-views are excluded from counts. |

### What every plan is built on (not the paid differentiators)

Unless a row in §3 says otherwise, candidates on **any** plan are expected to use the same core loop:

- Profile + dashboard (create, edit, archive, restore, delete applications)
- Application page with CV + optional **video pitch** + candidate details
- Shareable recruiter link (no login for the viewer)
- Primary CV library (within the plan’s library size)
- At least basic analytics

**Tiers mainly differ on:** application caps, whether you can upload **tailored** CVs, public-link branding (private/opaque vs vanity), analytics depth, and primary-library size.

---

## 2. Product principles (already decided in docs)

| Principle | Source |
| --------- | ------ |
| Public launch should include **paid access**. | [Backlog.md](Backlog.md), [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Free access, if any, is a **free tier and/or trial only** — not unlimited free use of the app. | Same |
| Creating / using applications should be **gated** behind an active plan or trial. | Same |
| Billing provider direction: **Stripe (or similar)** — checkout, webhooks, Supabase subscription state. | Same |
| `/pricing` must ship **real tiers aligned with billing**, not a stub. | Same; `/pricing` shows Free/Pro/Premium from §3 (E3-014) with locked monthly/annual USD prices; checkout still E2. |

---

## 3. Tiers — Free · Pro · Premium

Working plan names: **Free**, **Pro**, **Premium**. Billing gates are not implemented yet (E2).

**Design intent:** Tailored CVs are the main paid unlock on **Pro** (core product promise: a CV that matches the role). **Premium** adds branding, unlimited scale (with a fair-use soft ceiling), and richer analytics — not “you may finally tailor a CV.”

**Billing interval:** **Monthly and annual** (USD on `/pricing`). Annual is the default toggle on `/pricing` (highlights savings). Effective monthly on annual (~$3.25 Pro / ~$4.92 Premium) is marketing copy only — billed amounts are `$39/yr` and `$59/yr`. Stripe adaptive/local currency at checkout can come later with E2.

### 3.1 Comparison matrix (at a glance)

| Dimension | Free | Pro | Premium |
| --------- | ---- | --- | ------- |
| **Positioning** | Try the product with a hard cap | Core paid unlock: tailored CVs | Branding, scale, richer insight |
| **Price (USD)** | Free | **$9/mo** or **$39/yr** | **$14/mo** or **$59/yr** |
| **Applications** | Up to **3** | Up to **15** | **Unlimited** (marketed); internal soft ceiling **100** |
| **CV workflow** | **Primary CVs only** | **Primary + tailored** (tailored optional per app) | Same as Pro |
| **Video pitch** | Included (YouTube URL) | Included | Included |
| **Primary library size** | **5** | **5** | **15** |
| **Public id** | Private/opaque link | Private/opaque link | **Custom vanity** public id |
| **Analytics** | Aggregate views/downloads (+ created / last viewed) | Basic + **per-view timestamp history** | + duration, geography, referrer, video engagement, CSV export, cross-app comparison |

### 3.2 Free — detail

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| **Up to 3 applications** | Hard cap. Count rules in §3.6. | Working decision (this doc) |
| **Primary CVs only** | Upload/use the primary library; no tailored-CV workflow. | Working decision (this doc); [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md) |
| **Video pitch** | YouTube URL on the application page. | Working decision (this doc) |
| Private/opaque public id | Default `/view/{opaquePublicId}/{slug}` — no personal name in the public id segment. | [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md) |
| Basic analytics | View count, CV download count, created / last viewed (View Insights). | [USER_GUIDE.md](USER_GUIDE.md), [DATA_FLOW.md](DATA_FLOW.md) |
| Primary library | Up to **5**. | Working decision (this doc); today’s product max |

### 3.3 Pro — detail

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| **Everything in Free** | Including video pitch and private/opaque links. | Working decision (this doc) |
| **Primary + tailored CVs** | Per-application tailored uploads in addition to the primary library. Tailored is **optional** — Pro users may still attach a primary CV only. | Working decision (this doc) |
| **Up to 15 applications** | Hard cap. Count rules in §3.6. | Working decision (this doc) |
| Analytics | Basic metrics **plus per-view timestamp history**. | Working decision (this doc) |
| Primary library | Up to **5** (same as Free — Pro’s story is tailoring, not storage). | Working decision (this doc) |
| **Price** | **$9/mo** or **$39/yr** (~$3.25/mo effective). | Working decision (this doc) |

### 3.4 Premium — detail

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| Everything in Pro | Including primary + tailored CVs and per-view history. | Working decision (this doc) |
| **Custom vanity public id** | LinkedIn-style branded public id (e.g. `/view/joan-gerard/...`). | [Backlog.md](Backlog.md) (After launch → Could), [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md#future-custom-public-id-vanity-handle) |
| **Unlimited applications** | Marketed as unlimited; internal fair-use soft ceiling **100** (protects R2 storage). Soft-ceiling UX copy TBD (§5). | Working decision (this doc) |
| **Richer analytics** | Beyond Pro: view duration, geographic origin, referrer/traffic source, video-pitch engagement (played vs page-only), CSV export, side-by-side comparison across the candidate’s own applications. | Working decision (this doc) |
| **Primary library up to 15** | Raise above Free/Pro’s 5. | Working decision (this doc); today Free/Pro still use `PRIMARY_CV_MAX_PER_USER` = 5 until Premium gating ships |
| **Price** | **$14/mo** or **$59/yr** (~$4.92/mo effective). | Working decision (this doc) |

### 3.5 Adjacent features

| Item | Placement | Notes | Sources |
| ---- | --------- | ----- | ------- |
| AI interview prep (Phases 1–2) | **Later paid add-on** — not baked into Free/Pro/Premium at launch | Different job-to-be-done; AI cost profile unknown until usage is known. | [product-ideas/ai-powered-interview-preparation.md](product-ideas/ai-powered-interview-preparation.md), [Backlog.md](Backlog.md) |
| In-app video recording + teleprompter | **Not Free** — lean **Pro and/or Premium** when built | Today’s video pitch is a YouTube URL (no hosting cost). In-app recording means we host video. Exact tier when built is TBD (§5). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |

### 3.6 Enforcement / lifecycle (working decisions)

These rules are product truth for when E2 gates ship; not implemented in API/UI yet.

| Rule | Decision |
| ---- | -------- |
| **What the application cap counts** | **All applications ever created** that still exist as rows: **active + archived** count toward the cap. **Permanently deleted** applications do **not** count (hard-delete frees a slot). Soft-archive does **not** free a slot — archive-cycling cannot bypass Free/Pro limits. |
| **At cap** | Block **creating** a new application. Do not auto-delete or auto-archive. User may upgrade, or permanently delete an existing application to free a slot (within the counting rules above). |
| **Tailored on Pro/Premium** | Optional per application; reject `cv_type: "tailored"` on Free when gated. |
| **Downgrade** | Existing applications stay accessible (view/edit/archive per product rules). New creates are blocked while count ≥ new tier’s cap. Leaving Premium: vanity public id reverts to the opaque private id. |
| **Premium soft ceiling** | Market “unlimited”; enforce a generous internal soft ceiling of **100** applications for storage fair use. Exact customer-facing messaging when approaching/hitting the ceiling is TBD (§5). |

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

## 5. Still open

Remaining TBD items (everything else in §3 is locked):

- Stripe adaptive / local-currency presentment at checkout (E2) — `/pricing` stays USD for now.
- Exact customer-facing copy when a Premium user approaches or hits the soft ceiling of 100.
- When to build in-app video recording and which of Pro / Premium gets it.
- When to ship AI interview prep as a paid add-on.
- How gating is implemented in API/UI under E2 (create cap, reject tailored on Free, vanity claim on Premium, soft ceiling).

---

## 6. How to keep this current

1. Treat this doc as the source of truth for pricing and membership decisions; tighten §5 as remaining items land.
2. Keep `/pricing` aligned with this matrix — tier copy lives in `components/public/pricing/constants.ts`.
3. When pricing or billing work ships, update [Backlog.md](Backlog.md) (remove or strike the row). Do not keep a parallel open checklist here.
