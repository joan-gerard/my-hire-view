# Landing Page Brief

This brief outlines the structure and copy for a pre-launch “Coming Soon” landing page designed to capture early interest and build an email list before the official MyHireView launch.

Channels, launch phases, and specialist briefs (beyond this page’s structure): [GO_TO_MARKET.md](GO_TO_MARKET.md).

## Page Structure

### 1. Hero Section

Logo & Headline:
“Your Job Application Deserves More Than a PDF”

Subheadline:
“MyHireView transforms your resume into a dynamic, trackable experience with video pitches, analytics, and shareable links that make recruiters take notice. Launching soon.”

Visual Element:
Hero image or animation showing a side-by-side comparison: traditional resume vs. MyHireView application page with video player, CV viewer, and analytics dashboard preview.

### 2. Email Capture Form

Pre-headline:
“Be the first to stand out”

Form Fields:

- Email address (required)
- First name (optional, for personalization)
- Current job search status (dropdown: Actively searching, Casually looking, Career planning, Other)

CTA Button:
“Get Early Access” (Large, prominent button in brand color)

Post-signup Message:
“You’re on the list! Check your email for exclusive updates and be among the first to try MyHireView when we launch.”

Early Bird Incentive:
“Early signups get 3 months of Pro free when we launch!” (displayed prominently above or below the form)

### 3. The Problem Section

Headline:
“Still Sending the Same Old Resume?”

Copy:
“Your resume gets lost in a sea of PDFs. Recruiters spend 6 seconds scanning it. You have no idea if anyone even opened it. And there’s no way to show your personality, passion, or communication skills that matter most for the job.”

Visual:
Icons or illustrations showing: inbox overflow, stopwatch at 6 seconds, question mark (no visibility), flat document icon

### 4. The Solution Section

Headline:
“Introducing MyHireView: Your Application, Elevated”

Three-Column Feature Grid:

Column 1: Video Pitch

- Icon: Video camera
- Copy: “Let recruiters see and hear you. Upload a 60-90 second video pitch to showcase your communication skills and personality.”

Column 2: Smart Analytics

- Icon: Chart/graph
- Copy: “Know when recruiters view your application. Track engagement and follow up at the perfect time.”

Column 3: Shareable Links

- Icon: Link chain
- Copy: “Create custom applications for each role with unique, professional URLs. No login required for recruiters.”

### 5. How It Works

Headline:
“Stand Out in Three Simple Steps”

Step-by-Step Process (horizontal timeline or numbered cards):

- Create Your Application – Upload your CV, record a video pitch, and add your portfolio link.
- Share Your Link – Send your custom URL to recruiters via email, LinkedIn, or job applications.
- Track & Follow Up – See when recruiters view your application and follow up strategically.

### 6. Social Proof Placeholder

Headline:
“Join 500+ Job Seekers on the Waitlist” (update number dynamically)

Optional Beta Testimonials (if available):
Short quotes from early testers with their name, role, and photo.

### 7. FAQ Section

**Layout:** Two-column on large screens: decorative image on the left; on the right, an “FAQ” badge above the headline, then the Q&A list. Badge and headline are left-aligned. **Behaviour:** Accordion — only the questions are visible by default, each with a chevron on the right; clicking a question toggles the answer underneath with a short animation.

Headline:
“Common Questions”

Q: When will MyHireView launch?
A: We’re launching in Q2 2026. Early signups will be notified first and receive exclusive launch benefits.

Q: Will MyHireView be free?
A: Yes! We’ll have a free tier that lets you create applications with core features. Premium plans with advanced analytics and unlimited applications will also be available.

Q: Do recruiters need to create an account to view my application?
A: No! Recruiters can view your application with just a link – no login required. This makes it effortless for them to engage with your content.

Q: What if I don’t want to record a video?
A: Video is optional but highly recommended. Our data shows applications with video pitches get 3x more engagement.

Q: Can I create different applications for different jobs?
A: Yes. You can create custom applications for each role, each with its own shareable link. Tailor your CV, video pitch, and portfolio link so recruiters see the most relevant version of you.

Q: What analytics will I see?
A: You'll see when recruiters open your application, how they engage with it, and basic view metrics. Premium plans include advanced analytics so you can follow up at the right time.

Q: Is my application and data secure?
A: Yes. We take security seriously. Your data is stored securely, and you control who can access your application via the links you share. You can update or revoke access when needed.

Q: Can I update my application after sharing the link?
A: Yes. You can edit your CV, video, and details at any time. The same link will always show your latest version, so you don't need to resend it to recruiters.

Q: How long should my video pitch be?
A: We recommend 60–90 seconds. That's enough to introduce yourself, highlight why you're a fit, and show your communication skills without overwhelming recruiters.

### 8. Final CTA Section

Headline:
“Ready to Transform Your Job Search?”

Copy:
“Join the waitlist now and be among the first to create applications that actually get noticed.”

Button:
“Get Early Access” (repeats email capture form)

### 9. Footer

Reuse the ViewPageFooter component but rename it Footer. Styling is aligned with the rest of the landing page: same horizontal padding and max-width container (`px-4 md:px-6 lg:px-10 2xl:px-12`, `max-w-[1700px]`), light typography and border tokens, and a scroll-triggered fade-up animation (from `lib/landing-animations.ts`) for consistency with other sections.

## Design Guidelines

### Visual Style

- Color Scheme: Professional blue (#2E75B6) as primary, dark background (#0f172a), white text (#ffffff), dark blue accent (#1e3a5f) for section contrast, surface (#1e293b) for cards/inputs
- Typography: Clean, modern sans-serif (Inter, Poppins, or similar). Large, readable headlines.
- Imagery: Product mockups, diverse professional photos, iconography for features
- Layout: Single-page scroll, generous white space, mobile-responsive

---

## Implementation

The section list above is the original coming-soon brief. It is **not** the live page.

- **Page:** `app/(home)/` serves `/`. `layout.tsx` self-hosts Switzer and Stack Sans Headline via `next/font` (no CDN stylesheets) and loads `mhv-demo.css`. `page.tsx` renders `MhvLanding` (`mhv-landing.tsx` composes section modules from `components/marketing/`; copy helpers in `lib/marketing/`): header, hero, story, principles, how-it-works, in-page `#pricing`, FAQ, and footer. Login and Get started go to `/login`. There is no `MarketingHeader` and no `/pricing` route.
- **Copy still shared:** FAQ items in `components/public/faq/constants.ts`, how-it-works steps in `components/public/how-it-works/constants.ts`, tier cards in `components/public/pricing/constants.ts`.
- **API:** `POST /api/waitlist` still validates and stores signups in `waitlist_signups` (migration `018_waitlist_signups.sql`). Duplicate emails return 409. The homepage does not render that form.
- **Videos:** How-it-works step videos are served from R2 (`marketing/*.mp4`); see [PDF_AND_R2.md](PDF_AND_R2.md). Hero stills for this page live under `public/demo/`.
