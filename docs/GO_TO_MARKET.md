# MyHireView — Go-to-market strategy

**Purpose of this doc:** How people **discover** MyHireView, **hear about it**, and become **paid users**. It is **not** a second engineering backlog — shipping work still lives in [Backlog.md](Backlog.md).

**Status:** Pre-launch. The product loop works; public paid access is not live yet (pricing lock **E1**, Stripe/gates **E2**). This plan is for a solo founder who may later collaborate with specialists.

**Related:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) · [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md) · [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md) · [copy/copy.md](copy/copy.md) · [USER_GUIDE.md](USER_GUIDE.md)

| Section | What it covers |
| ------- | -------------- |
| [§1 Who pays](#1-who-pays-and-why) | Buyer, viral viewer, why they upgrade |
| [§2 Discovery loop](#2-the-discovery-loop) | The path from stranger to paid user |
| [§3 Positioning](#3-positioning-working) | Working message until interviews sharpen it |
| [§4 What to do](#4-what-to-do-by-phase) | Actions by phase (now → launch → 90 days → scale) |
| [§5 Channel playbook](#5-channel-playbook) | Where job seekers actually find tools like this |
| [§6 Assets](#6-assets-you-need) | Proof, pages, and emails that make channels work |
| [§7 Collaborate](#7-when-to-collaborate-and-who-to-search-for) | Roles, search terms, briefs, and what you need from each person |
| [§8 Keep vs delegate](#8-what-you-keep-vs-delegate) | Founder-only work vs hire/contract |
| [§9 Keep current](#9-how-to-keep-this-current) | When to update this doc |

---

## 1. Who pays and why

MyHireView has **two audiences**. Only one pays.

| Role | What they do | Do they pay? |
| ---- | ------------ | ------------ |
| **Candidate** (job seeker) | Signs up, builds application pages, shares links, checks views | **Yes** — Free / Pro / Premium |
| **Recruiter** | Opens `/view/{publicId}/{slug}` with no account | **No** — they are a **distribution surface** |

**Working ICP (until interviews prove otherwise):** people **actively searching** for a job who already customize applications (tailored CV, LinkedIn outreach, maybe a video) and feel PDFs disappear into ATS inboxes. Waitlist fields already segment this: job search status, primary goal, career stage. After launch, keep collecting the same signals from signed-in users (Epic **O** in [Backlog.md](Backlog.md)).

**Why someone pays (working draft, [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md)):**

- **Free** is a taste (hard cap of 3 applications, primary CVs only) — not unlimited use.
- **Pro (~$9/mo or $39/yr)** is the core paid plan: **tailored CVs** + more application slots. This is the plan to optimize for.
- **Premium** is for people who want branding, scale, and richer analytics.

Do **not** launch with unlimited free use of the app. Discovery that only produces free users who never hit a cap is not a business.

---

## 2. The discovery loop

Every channel should feed this loop. If an activity cannot be mapped here, it is optional.

```
Stranger hears about MyHireView
        → lands on / or /pricing (or a public /view demo)
        → waitlist (now) or signup (at launch)
        → first application + shareable link   ← “aha”
        → recruiter opens the page (views / CV download)
        → hits a limit or wants tailored CVs
        → Pro / Premium
        → shares again (product-led loop)
```

**Aha moment to optimize for:** the candidate copies a real link and sees that a recruiter (or a friend playing recruiter) opened it. Feature tours are not the aha.

**Two discovery paths:**

1. **Direct** — candidate finds the marketing site (search, LinkedIn, community, partner, email).
2. **Indirect** — recruiter (or another candidate) sees a public application page and asks “what is this?” That only works if public pages look polished and obviously “made with MyHireView” without looking spammy.

Engineering that supports this loop (onboarding checklist, public-view polish, billing gates) is already tracked in the backlog (`F17`, `F19`, `E1`, `E2`, `J3`). Optional post-launch product tour: `F31`. This doc is about the **non-engineering** work that fills the top of the funnel.

---

## 3. Positioning (working)

Use this until customer interviews produce better words. Draft copy already exists in [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md) and [copy/copy.md](copy/copy.md).

**Category:** A shareable application page (CV + optional video + contact) for one job at a time — not a personal website, not an ATS, not a generic Linktree.

**Working one-liner:** Your job application deserves more than a PDF. One link that shows your CV, your voice, and whether they even opened it.

**Contrast:**

| They do today | MyHireView |
| ------------- | ---------- |
| Same PDF to every portal | One page per role, optional tailored CV |
| No idea if anyone looked | View / download insight |
| Personality stuck in cover letters | Optional video pitch recruiters can watch without logging in |

**Do not lead with** “SaaS dashboard,” “analytics platform,” or a feature list. Lead with the job: *stand out and know if they looked*.

Lock this message **before** spending on ads or a large content push. Weak copy wastes every channel in §5.

---

## 4. What to do, by phase

### Phase 0 — Now (pre-launch, unpaid)

Goal: **a list of the right people** and **proof the product is worth sharing**, not a viral launch.

1. **Talk to 15–20 job seekers** (active search preferred). Ask how they apply today, what they send besides a PDF, whether they would pay to tailor CVs or see who viewed a link. Use waitlist segments (`Actively searching`, “Stand out to recruiters”) as the first outreach list.
2. **Export and mine the waitlist** (email, first name, job search status, primary goal, career stage). Count who is “Actively searching” vs. “Career planning.” Those ratios tell you who to email first at launch.
3. **Write a 3–5 email waitlist sequence** (welcome, problem, demo, launch-soon, launch). Do not wait until E2 is done to draft this.
4. **Build proof assets:** one real public application (your own or a volunteer’s) + real screenshots (`F24-043`). Recruiters and candidates believe a live `/view` page more than SVG mockups.
5. **Start showing up where they already are** — mostly LinkedIn and 1–2 job-search communities. Help first; mention the waitlist second. Aim for a weekly habit, not a campaign.
6. **Finish trust basics before asking for money:** legal pages (`F20-019`), support entry (`F23-022`), branding on `/admin` and `/view` (`F17`).
7. **Decide the launch offer** (working idea in the landing brief: early waitlist gets **3 months of Pro**). Do not promise it in email until E1/E2 can honor it.

**Done when:** you can say, in one sentence, who pays, why, and you have at least one public page you are proud to send.

### Phase 1 — Launch week

Goal: convert the waitlist and create a **first spike** of signups. A spike is not a strategy; it is a starting cohort.

1. **Ship paid access** (E1 lock + E2 checkout). Free stays capped.
2. **Email the waitlist** in waves (actively searching first). Link to signup + pricing, not only the homepage.
3. **Founder announcement:** LinkedIn post + personal network + any community where you already participate. Include a screenshot or public demo link.
4. **Optional one-day platforms:** Product Hunt, “indie launch” newsletters, “tools for job seekers” roundups. Useful once; do not depend on them.
5. **Watch the funnel daily for two weeks:** waitlist → signup → first application → first share → paid. Interview anyone who signed up but did not create an application.

**Done when:** waitlist is invited, checkout works, and you know the drop-off step (usually: no first application, or no share).

### Phase 2 — First 90 days after launch

Goal: **repeatable organic discovery**, not more launch-day tactics.

Do these in order. Stop doubling down on a channel that cannot produce a paid user.

| Priority | Work | Why |
| -------- | ---- | --- |
| 1 | Fix activation (onboarding → first shared link) | Paid users never appear if free users never share |
| 2 | LinkedIn as the home channel | Candidates and recruiters already live there; public pages are visually shareable |
| 3 | Partnerships | Career coaches, bootcamps, universities, outplacement — they already have your buyer |
| 4 | SEO / content (`J3` `/blog` and `/how-it-works`) | Compounding; slow. Start with 5–10 pages that match real searches (see §5) |
| 5 | Collect proof | Testimonials, “I got the interview,” before/after of a PDF vs. a MyHireView page |

Skip paid ads in this phase unless a channel is already converting and you know **what a Pro subscriber is worth** (see Phase 3).

**Done when:** you can name 1–2 channels that produced paying users more than once, and you have a short list of what did nothing.

### Phase 3 — Scale what already converts

Goal: spend money only on a **known** message and funnel.

- Paid search / social only after: clear offer, working checkout, and a rough **LTV > 3× CAC** guess (even if LTV is “Pro annual $39” at first).
- More content volume, affiliates, or a contractor for distribution — not a new positioning experiment every week.

---

## 5. Channel playbook

Ranked for a **B2C job-seeker tool** with a shareable public page. “Do this” means founder-led unless §7 says otherwise.

### 5.1 LinkedIn (primary social)

**Why:** Your buyer job-searches here. Recruiters browse here. A public application page is a natural post.

**Do:**

- Post as the founder (face + product), 2–4 times per week at first.
- Formats that work: PDF vs. MyHireView screenshot, 60-second pitch tips, “what I send instead of a cover letter,” a recruiter’s 6-second scan problem.
- Comment on hiring / job-search threads with useful advice; link only when asked or in your profile.
- Put the waitlist or app URL in the profile featured section.

**Do not:** company-page-only posting with no personal account; hard-sell every post.

### 5.2 Waitlist and email (owned channel)

**Why:** You already collect email + name + search status + goal + career stage. This is the only list you fully own.

**Do:**

- Welcome email immediately after signup (even pre-launch).
- Occasional progress emails so the list does not go cold.
- Launch + onboarding + “you used 3 of 3 applications” / trial-ending emails after E2.

**Need:** a real email provider (Resend, Loops, Postmark, etc.) — not only storing rows in `waitlist_signups`.

### 5.3 Communities (selective)

**Why:** Job seekers ask “how do I stand out?” in public forums every day.

**Where to look:** Reddit (job-search / career / resumes — follow each sub’s self-promo rules), Discords, Slack groups, bootcamp alumni, local career meetups.

**Do:** answer questions; offer a free review of someone’s application page; disclose when you built the tool.

**Do not:** spam waitlist links. One ban costs more than a week of posts.

### 5.4 Partnerships (highest leverage after activation)

**Why:** One coach or bootcamp can send 20–200 of the right users.

**Who:** career coaches, résumé writers, coding / UX bootcamps, university career centers, outplacement firms.

**Offer them:** a demo link, a unique signup or discount code, optionally a revenue share later. They care that the tool makes *their* clients look good.

### 5.5 SEO and content (slow, compounding)

**Why:** People search for alternatives to a PDF resume, video résumés, and “how to follow up after applying.”

**First pages to write** (when `J3` is worth the time — after the message is stable):

- How to share a résumé with a recruiter (link vs. attachment)
- Video pitch script (60–90 seconds) — you already recommend this length
- How to tell if a recruiter opened your application
- MyHireView vs. sending a PDF / vs. a personal website

`/how-it-works` should be deeper than the homepage, not a duplicate (`J3-081`). `/blog` should ship real posts, not an empty route (`J3-082`).

### 5.6 Product-led (every shared link)

**Why:** Each `/view` page is a demo. This is unique to this product.

**Do:**

- Make the public page look like something a candidate would *want* to show.
- Optional discreet “Made with MyHireView” on public pages (keep it tasteful; recruiters should not feel advertised at).
- Teach users to paste the link in LinkedIn messages and application forms, not only email.

### 5.7 Launch platforms and PR (one-off)

Product Hunt, indie newsletters, career blogs, “best tools for job seekers” lists.

**Use:** launch week + when you ship a story (e.g. “see when they viewed your CV”). Not a weekly channel.

### 5.8 Paid ads (later)

Google Search, LinkedIn Ads, Meta. **Phase 3 only.** You need a landing page that already converts organic traffic, or you will pay to learn copy you could have learned for free in interviews.

---

## 6. Assets you need

Channels fail without these. Most are writing and proof, not new product features.

| Asset | Why |
| ----- | --- |
| **Live demo `/view` page** | The product *is* the ad |
| **Real screenshots** of dashboard + public view | Landing page still uses SVG placeholders (`F24-043`) |
| **One-liner + 3-sentence pitch** | Profile bios, emails, partner intros |
| **Waitlist / launch email sequence** | Converts the list you already have |
| **Pricing page aligned with billing** | `/pricing` exists; E1 must lock it before you sell |
| **Onboarding path to first share** | Activation (`F19-044`) |
| **2–3 testimonials** | After the first users; even first-name + role is enough |
| **Legal + support** | People hesitate to pay a new tool with no Terms or a way to ask for help |

---

## 7. When to collaborate, and who to search for

You do not need a marketing department at launch. Bring someone in when **you are the bottleneck** (message is unclear, you cannot write volume, or a channel is working and you cannot staff it).

**How to hire well:** write a one-page brief (what MyHireView is, who pays, the loop in §2, current assets, what “done” looks like, budget/time). Pay for a **small paid trial** (one landing rewrite, five LinkedIn posts, one SEO outline) before a retainer.

**Where to look:** freelance marketplaces, Indie Hackers / Microconf / local founder groups, referrals from other indie SaaS founders, career-coach networks (for domain partners). Prefer people who have shipped **self-serve B2C or prosumer SaaS**, not only B2B enterprise lead-gen.

Below: **search terms**, **what you need from them**, and **what you must provide**. Titles overlap; hire for the *job*, not the LinkedIn title.

### 7.1 Positioning and conversion copy

**When:** landing, pricing, and emails feel generic, or interviews say “I still don’t get it.”

| | |
| --- | --- |
| **Search for** | `SaaS conversion copywriter`, `positioning consultant`, `product marketing freelance B2C`, `landing page copywriter SaaS`, `messaging workshop founder` |
| **Your need** | A sharp one-liner, homepage/pricing narrative, and waitlist/launch emails that match how job seekers talk |
| **You provide** | Interview notes, waitlist FAQ, demo URL, competitor list (PDF / personal site / video-resume tools), draft copy in `docs/copy/` |
| **Done looks like** | New headline + subhead + pricing angle you can A/B; you can explain the product in 15 seconds |
| **Engagement** | Fixed project (1–3 weeks), not a long retainer |

### 7.2 Early-stage growth / GTM advisor

**When:** you want a second brain on *which* channels to try, not someone to post for you.

| | |
| --- | --- |
| **Search for** | `indie SaaS growth advisor`, `early-stage GTM advisor`, `product-led growth consultant B2C`, `pre-seed go-to-market coach` |
| **Your need** | A 90-day channel plan, metrics to watch, and pushback on ads-too-early |
| **You provide** | This doc, funnel numbers (even if small), time for a weekly 30-min call |
| **Done looks like** | Prioritized experiments with a kill criterion each |
| **Engagement** | Advisory (monthly) or a short paid sprint |

Avoid “growth hackers” who only sell paid ads or TikTok without looking at your ICP.

### 7.3 SEO and content strategy

**When:** the message is stable and you are ready for `J3` (blog / how-it-works), not before.

| | |
| --- | --- |
| **Search for** | `SaaS SEO consultant`, `programmatic SEO` (probably overkill), `content strategist career / HR tech`, `freelance SEO writer job search` |
| **Your need** | Keyword map for job-seeker intent, outline for 5–10 first articles, on-page structure for `/how-it-works` |
| **You provide** | Positioning, product screenshots, what you will *not* write (ATS advice you cannot back, fake “3x engagement” claims until you have data) |
| **Done looks like** | A content calendar and briefs you or a writer can execute |
| **Engagement** | Strategy sprint first; writers on a per-article rate after |

The landing FAQ currently claims video pitches get “3x more engagement.” Do not put that in SEO or ads until you can measure it.

### 7.4 Email / lifecycle

**When:** you have (or are about to have) Stripe + signup, and you need sequences you will not write yourself.

| | |
| --- | --- |
| **Search for** | `lifecycle email freelancer SaaS`, `onboarding email sequence`, `customer.io / Loops / Resend setup`, `trial-to-paid email copy` |
| **Your need** | Waitlist nurture, launch, onboarding, and upgrade-at-cap emails; tool setup |
| **You provide** | Events you can send (signup, first application, cap reached) — some of this is engineering |
| **Done looks like** | Sequences live, with plain-language measurement (open is weak; “created first app” / “upgraded” is the point) |
| **Engagement** | Project to set up + copy; retain only if volume justifies it |

### 7.5 LinkedIn / social (coach or ghostwriter)

**When:** you will post as yourself but freeze on what to write, **or** you can talk but not ship posts consistently.

| | |
| --- | --- |
| **Search for** | `LinkedIn ghostwriter founder SaaS`, `LinkedIn content coach`, `personal brand consultant B2B` (many of them; pick someone OK with **B2C career** topics) |
| **Your need** | A posting cadence and drafts in your voice; optionally a content system |
| **You provide** | Stories from building the product, user interviews, permission to use anonymized examples |
| **Done looks like** | You publish for 4+ weeks without skipping; comments from job seekers, not only other founders |
| **Engagement** | Coach (you write) is cheaper and better for trust; ghostwriter if time is the only blocker |

Do not outsource the **account**. Job seekers buy from a person who is in the market with them.

### 7.6 Partnerships / business development

**When:** you have a demo you are proud of and can offer a partner code or live walkthrough.

| | |
| --- | --- |
| **Search for** | `partnerships manager freelance SaaS`, `bootcamp partnership`, `career coach affiliate program`, `university career services outreach` — or skip the hire and **do intros yourself** at first |
| **Your need** | 5–10 conversations with coaches/bootcamps; a one-pager they can forward |
| **You provide** | Demo, pricing, what the partner’s client gets, what you will not do (you are not a résumé-writing service) |
| **Done looks like** | Recurring referrals, even if small |
| **Engagement** | Founder-led until one partner type clearly works; then a part-time BD contractor |

The **career coach** themselves is also a collaborator: they are a **domain partner**, not a marketer. Search `career coach partnership`, `résumé writer affiliate`, `outplacement tools`.

### 7.7 Launch / Product Hunt (optional)

**When:** launch week only, if you want a packaged hunt and you lack the time.

| | |
| --- | --- |
| **Search for** | `Product Hunt launch consultant`, `PH hunter`, `indie launch newsletter pitch` |
| **Your need** | Hunt copy, hunter intro, first-day comment plan |
| **You provide** | Demo, maker story, assets from §6 |
| **Done looks like** | A clean launch day; treat traffic as a cohort to interview, not as “we made it” |
| **Engagement** | One-off |

### 7.8 Paid acquisition (Phase 3)

**When:** organic conversion to Pro is proven.

| | |
| --- | --- |
| **Search for** | `Google Ads SaaS freelancer`, `LinkedIn Ads B2C`, `performance marketer demand gen` — specify **job seekers / career** or they will run B2B lead-gen playbooks |
| **Your need** | Campaigns with a conversion pixel to **paid subscriber**, not only signup |
| **You provide** | Landing that already converts, budget cap, weekly kill switch |
| **Done looks like** | CAC you can compare to Pro $39/year or $9/month |
| **Engagement** | Small test budget first; fire if they cannot explain the funnel |

### 7.9 What *not* to hire first

| Role | Why wait |
| ----- | -------- |
| Full-time CMO / Head of Growth | No budget or channel-market fit yet |
| Brand agency | You already have a visual identity; you need distribution and message |
| PR agency | Worth a try *after* a story (users, data); retainers burn cash pre-launch |
| “We’ll get you viral on TikTok” | Possible later; not the first place *paying* job seekers look for this tool |

---

## 8. What you keep vs delegate

**Keep (founder):**

- Customer interviews and reading waitlist segments
- Final call on positioning and price (E1)
- Posting as yourself on LinkedIn
- First partner conversations
- Looking at the funnel weekly (signup → first app → paid)

**Safe to delegate once the brief is clear:**

- Copy drafts (you still approve)
- SEO outlines and article drafts
- Email tool setup
- Thumbnail / screenshot production
- Ads *after* the offer works

**Never fully delegate:** talking to users, or the public face of the product, until the company is much larger.

---

## 9. How to keep this current

1. After **~15 interviews**, update §1 (who pays) and §3 (positioning) with their words.
2. After **launch week**, record which channels produced signups vs. paid users in a short note at the bottom or in a retrospective — do not turn this file into a changelog of every post.
3. When **E1/E2** ship, replace “waitlist” language in emails/assets with signup + checkout; keep the loop in §2.
4. Engineering tasks stay in [Backlog.md](Backlog.md) (`E1`, `E2`, `F17`, `F19`, `F20`, `F23`, `F24`, `J3`). If GTM uncovers a *product* gap (e.g. referral codes, “made with” footer), add a backlog ticket — do not grow a second checklist here.
5. Pricing and caps remain in [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md); this doc only describes how to **sell** those tiers.
