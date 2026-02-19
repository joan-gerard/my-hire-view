# PR #7 — Update landing page

Commit-by-commit detail for PR #7 (improve-marketing-pahe): commits `cb07f75` through `3a90e55`, plus merge. Doc-only commits (e.g. BUILD_SUMMARY updates, rebrand) are omitted. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 62. Add pre-launch landing page with waitlist, new sections, and brand theme

**Commit:** `cb07f75`  
**Intent:** Create a comprehensive pre-launch "Coming Soon" landing page with waitlist functionality, marketing sections, and brand theme implementation per LANDING_PAGE_BRIEF.md.

**Created:**

- **API:** `app/api/waitlist/route.ts` — POST endpoint for waitlist signups with validation and duplicate email handling (409)
- **Components:** 
  - `components/public/EmailCaptureForm.tsx` — email capture form with name, email, job search status dropdown, success state, and early bird incentive messaging
  - `components/public/FAQSection.tsx` — FAQ section with common questions about launch, pricing, and features
  - `components/public/FinalCTASection.tsx` — final call-to-action section with email form integration
  - `components/public/Footer.tsx` — footer component (re-export of ViewPageFooter)
  - `components/public/HowItWorksSection.tsx` — three-step process section with timeline visualization
  - `components/public/LandingHero.tsx` — hero section with headline, value proposition, CTA button, and hero comparison image
  - `components/public/ProblemSection.tsx` — problem statement section highlighting pain points with traditional resumes
  - `components/public/SocialProofSection.tsx` — social proof section with waitlist count and community avatars
  - `components/public/SolutionSection.tsx` — solution section with three-column feature grid (Video Pitch, Smart Analytics, Shareable Links)
- **Lib:** `lib/landing-animations.ts` — shared Framer Motion animation configs (fadeUp, staggerContainer, staggerItem, headerEntrance)
- **DB:** `supabase/migrations/018_waitlist_signups.sql` — waitlist_signups table with email, first_name, job_search_status, created_at
- **Docs:** `docs/LANDING_PAGE_BRIEF.md` — comprehensive landing page brief with structure, copy, design guidelines, and implementation details
- **Fonts:** FunnelSans and VendSans font families (Bold, BoldItalic, ExtraBold, ExtraBoldItalic, Italic, Light, LightItalic, Medium, MediumItalic, Regular, SemiBold, SemiBoldItalic variants)
- **Images:** 
  - `public/images/hero-comparison.svg` — side-by-side comparison of traditional resume vs MyHireView
  - `public/images/how-it-works.svg` — three-step timeline visualization
  - `public/images/solution-preview.svg` — app window mockup
  - `public/images/waitlist-avatars.svg` — community avatars for social proof

**Updated:**

- `app/page.tsx` — complete rewrite to compose all landing page sections in order (MarketingHeader, LandingHero, EmailCaptureForm, ProblemSection, SolutionSection, HowItWorksSection, SocialProofSection, FAQSection, FinalCTASection, Footer)
- `app/globals.css` — brand theme CSS variables: `--brand-primary` (#2e75b6), `--brand-text` (white), `--brand-accent` (#1e3a5f), `--brand-surface` (#1e293b), `--background` (#0f172a); dark theme styling; custom font-face declarations for FunnelSans and VendSans
- `components/admin/AdminHeader.tsx` — updated branding references
- `components/public/MarketingHeader.tsx` — enhanced header with improved styling and navigation
- `docs/ARCHITECTURE.md` — updated to document landing page structure and waitlist API

**Design & UX:**
- Dark theme throughout with professional blue primary color
- Framer Motion animations: header entrance on load, staggered hero content, scroll-triggered fade-up for sections, staggered children for interactive elements
- Mobile-responsive layout with generous white space
- Brand-consistent typography using custom fonts (FunnelSans, VendSans)
- SVG images for crisp scaling and dark-theme compatibility

---

## 63. update brand-primary and minor updates to LandingHero

**Commit:** `87a31da`  
**Intent:** Adjust brand primary color and refine LandingHero component styling and layout.

**Updated:**

- `app/globals.css` — updated `--brand-primary` color value
- `app/page.tsx` — minor adjustments to page structure and section ordering
- `components/public/LandingHero.tsx` — refined styling, spacing, and layout improvements for better visual hierarchy

---

## 64. Fix MarketingHeader to stay visible on scroll

**Commit:** `3a90e55`  
**Intent:** Ensure MarketingHeader remains visible when scrolling the landing page by fixing positioning/sticky behavior.

**Updated:**

- `app/page.tsx` — adjusted layout to support sticky header
- `components/public/MarketingHeader.tsx` — fixed positioning to stay visible on scroll (sticky/fixed positioning)

---

## 65. Merge pull request #7 — improve-marketing-pahe

**Commit:** `3541c00`  
**Intent:** Merge the "Update landing page" branch into main.

**Scope:** All changes from commits 62–64: pre-launch landing page with waitlist API and signup form, comprehensive marketing sections (Hero, Problem, Solution, How It Works, Social Proof, FAQ, Final CTA), brand theme implementation with custom fonts and dark theme, Framer Motion animations throughout, brand primary color updates, LandingHero refinements, MarketingHeader sticky positioning fix. Merge only.

---
