# Pricing & membership — existing mentions

Living inventory of pricing and membership decisions plus earlier product notes. Plan names and the tier matrix in §2 are **working decisions**; price points and several numeric caps are still open.

Homepage marketing FAQ copy is **placeholder** and is intentionally **not** used here as input for what tiers should offer.

**Related work:** [Backlog.md](Backlog.md) (Before launch → Must: Pricing & membership tiers, Payment / membership system, Pricing page) · [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

---

## 1. Product principles (already decided in docs)

| Principle | Source |
| --------- | ------ |
| Public launch should include **paid access**. | [Backlog.md](Backlog.md), [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Free access, if any, is a **free tier and/or trial only** — not unlimited free use of the app. | Same |
| Creating / using applications should be **gated** behind an active plan or trial. | Same |
| Billing provider direction: **Stripe (or similar)** — checkout, webhooks, Supabase subscription state. | Same |
| `/pricing` must ship **real tiers aligned with billing**, not a stub. | Same; page today says “Content coming soon.” (`app/(marketing)/pricing/page.tsx`) |

---

## 2. Tiers — Free · Pro · Premium

Working plan names: **Free**, **Pro**, **Premium**. Nothing below is implemented as a billing gate yet.

**Design intent:** Tailored CVs are the main paid unlock on **Pro** (core product promise: a CV that matches the role). **Premium** adds branding, higher/unlimited scale, and richer analytics — not “you may finally tailor a CV.”

### Free

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| **Up to 3 applications** | Hard cap. | Working decision (this doc) |
| **Primary CVs only** (default) | Upload/use the primary library; no full tailored-CV workflow. Optionally allow a **very tight** tailored allowance later (e.g. 1) — default assumption is **primary-only** until that is decided. | Working decision (this doc); primary/tailored model in [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md) |
| Opaque public id | Default `/view/{opaquePublicId}/{slug}`. | [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md) |
| Basic analytics (as shipped today) | View count, CV download count, created / last viewed (View Insights). | [USER_GUIDE.md](USER_GUIDE.md), [DATA_FLOW.md](DATA_FLOW.md) |

### Pro

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| **Primary + tailored CVs** | Real paid unlock: per-application tailored uploads in addition to the primary library. | Working decision (this doc) |
| **Higher application cap** than Free | Exact number TBD (above 3; at or below Premium). | Working decision (this doc) |
| Opaque public id | Same as Free unless Premium vanity is claimed. | — |
| Analytics | At least today’s basic metrics; richer analytics reserved for Premium unless we later move some to Pro. | Working decision (this doc) |

### Premium

| Capability | Notes | Sources |
| ---------- | ----- | ------- |
| Everything in Pro | Including primary + tailored CVs. | Working decision (this doc) |
| **Custom vanity public id** | LinkedIn-style branded public id (e.g. `/view/joan-gerard/...`). | [Backlog.md](Backlog.md) (After launch → Could), [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md#future-custom-public-id-vanity-handle) |
| **Higher or unlimited applications** | Exact cap TBD (above Pro, or unlimited). | Working decision (this doc) |
| **Richer analytics** | Beyond today’s view + download counts (events / dashboards / exports TBD). | Working decision (this doc) |
| **Larger primary library** (optional) | Today’s product max is **5** primaries; Premium may raise that. Exact number TBD. | [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md), API `PRIMARY_CV_MAX_PER_USER` |

### Adjacent (not tiered yet)

| Item | Notes | Sources |
| ---- | ----- | ------- |
| AI interview prep (Phases 1–2) | Product idea / backlog Could — **not** assigned to Free, Pro, or Premium. | [product-ideas/ai-powered-interview-preparation.md](product-ideas/ai-powered-interview-preparation.md), [Backlog.md](Backlog.md) |
| In-app video recording + teleprompter | Pre-launch nice-to-have — **not** assigned to a tier. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |

---

## 3. Source excerpts (verbatim intent)

### Launch / billing direction

> Define plans (paid + optional free tier / trial), per-tier limits, price points. Do **not** launch with unlimited free app access.

> Stripe (or similar): checkout, webhooks, Supabase subscription state; gate creating/using applications behind an active plan or trial.

> Ship real tiers on `/pricing` aligned with billing — not a stub.

— [Backlog.md](Backlog.md); same substance in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

### Vanity public id as premium

> A planned enhancement (potentially **premium**): Let users choose a custom **public id** … Natural fit for a paid tier (custom branding).

— [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md)

---

## 4. Still undefined (to decide when designing tiers)

- Price points and billing interval (monthly / annual).
- Exact Pro application cap; Premium higher vs unlimited.
- Free: stay **primary-only**, or allow a very tight tailored allowance (e.g. 1).
- Exact Premium primary-library size (today’s global max is 5).
- What “richer analytics” includes (events, dashboards, exports, etc.).
- Whether future features (AI prep, in-app recording) are Free, Pro, Premium, or separate add-ons.
- How gating is enforced in API/UI (application create cap, reject `cv_type: "tailored"` on Free, vanity claim on Premium, etc.).

---

## 5. How to keep this current

1. As remaining caps and prices land, tighten §2 / §4 and treat this doc as the source of truth for pricing.
2. Keep `/pricing` (and any other marketing surfaces) aligned with that matrix once it exists.
3. Sync [Backlog.md](Backlog.md) when pricing or billing work ships.
|
