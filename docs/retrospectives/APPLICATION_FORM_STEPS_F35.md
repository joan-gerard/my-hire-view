# Application form steps: two layouts behind a test switch (F35)

**Working design context** for before-launch PR group **F35** (`F35-119` — stepped create/edit application workflow). Companion to [BEFORE_LAUNCH_PR_ORDER.md](../product/BEFORE_LAUNCH_PR_ORDER.md) and [Backlog.md](../product/Backlog.md).

This retrospective records **why** we are evaluating two flows in parallel, and **how** the temporary layout switch works — not a second checklist.

---

## The wish

Create/edit still used one long `ApplicationForm`: company/role, candidate fields, picture, CV source, video, slug/share URL, and actions on a single scroll. That packs tip density and decisions into one wall — easy to abandon, hard to scan, and awkward to polish after the F34 product chrome pass.

F35’s product ask was explicit: **brainstorm and pick a pattern** before locking the UX:

| Pattern | Idea |
| ------- | ---- |
| **A — Wizard** | One job per screen; progress chips; Back / Continue; Save on the last step |
| **B — Sections** | One page, collapsible steps; confirm a step → it collapses and the next opens |

We did not want to guess the winner from a mock alone. We wanted to **use both** on real create/edit (draft leave, CV library, slug preview, Save & Preview) and decide with manual testing.

---

## Why a feature-flag-like switch (not two branches)

| Approach | Why we rejected / accepted it |
| -------- | ----------------------------- |
| Two long-lived git branches | Diverges business logic (CV upload, drafts, slug) and doubles bug surface |
| Env-only `NEXT_PUBLIC_…` | Needs restart to flip — painful for side-by-side manual QA |
| Full feature-flag SaaS | Overkill for a pre-launch layout experiment |
| **Query param + localStorage + optional env default** | Instant toggle, bookmarkable URLs, survives reload; remove when we pick a winner |

The switch is an **evaluation tool**, not a candidate-facing product setting. It is labeled “F35 test” in the UI and hidden in production builds unless explicitly enabled.

---

## What we implemented

### Layout resolution (priority order)

1. `?formStyle=wizard` or `?formStyle=sections`
2. `localStorage` key `mhv:application-form-style`
3. `NEXT_PUBLIC_APPLICATION_FORM_STYLE` (optional build default)
4. Hard default: **`sections`**

Helpers: `lib/utils/application-form-style.ts`  
Hook: `hooks/useApplicationFormStyle.ts`  
In-form control: `components/forms/ApplicationFormStyleSwitch.tsx`  

Show/hide the switch:

- unset → show when `NODE_ENV !== "production"`
- `NEXT_PUBLIC_SHOW_FORM_STYLE_SWITCH=1` → show (e.g. Vercel preview)
- `=0` → always hide

### Shared step map (same product in both skins)

Order matches the backlog example:

1. **Role** — company + position  
2. **About you** — candidate fields + profile picture  
3. **CV & video** — primary/tailored CV + YouTube  
4. **Share URL** — name-in-URL, slug, live preview  
5. **Review & save** — short summary + existing Save / Cancel actions  

Defined in `components/forms/application-form-steps.ts`. Both layouts render the **same field content** from `ApplicationForm` so draft persistence (F15), preview/publish path (F16), share URL preview (F19-046), and primary-CV library behavior stay one code path.

### Layout shells

- `ApplicationFormWizardLayout` — step progress, gated Continue, Save on review  
- `ApplicationFormSectionsLayout` — accordion sections, “Continue to next step”, Save on review  

Per-step Continue uses the same readiness rules as Save (company/role, CV + video, slug available, etc.) so users cannot skip past missing required inputs.

---

## How to manual-test both

1. Run the app locally (`pnpm dev`).  
2. Open **Create** or **Edit** application.  
3. Use the **Form layout (F35 test)** control, **or**  
   - `/admin/new?formStyle=wizard`  
   - `/admin/new?formStyle=sections`  
4. Walk the full journey: draft leave, CV primary/tailored, slug reset, Save & Preview.  
5. Flip the switch and repeat — note friction, clarity, and mobile feel.  
6. Record the decision here (or in the PR) when one layout wins; then remove the switch and the losing shell.

---

## Decision log (fill in after testing)

| Date | Preference | Notes |
| ---- | ---------- | ----- |
| _(pending)_ | wizard everywhere / sections everywhere / hybrid by route (create=wizard, edit=sections) / hybrid by viewport (e.g. mobile=wizard, desktop=sections) | See open questions below; prefer at most one hybrid rule if any |

**Out of scope for F35:** post-launch product tour (`F31-105`), public `/view` polish (`F38-122`), monetization gates.

---

## Open question: Profile preference for form layout?

**Question (product):** After we have both layouts, can we consider adding a new preference on the profile / Account settings page so users can choose wizard **or** sections for create/edit?

That would mirror other Account settings → Preferences controls (e.g. dashboard status-indicator style) and turn the temporary F35 switch into a lasting, user-owned choice.

### Feedback (working stance)

**Do not add it during F35.** The dual layout is an **evaluation tool** aimed at picking a winner — not yet a permanent dual-UI product. Shipping a Preferences control before that decision would:

- Treat an experiment as a candidate-facing feature too early  
- Commit us to maintaining, documenting, and QA’ing **both** interaction models  
- Force new users to choose (or live with a silent default) before they have created an application  

Account settings → Preferences is a good home **if** we later decide both layouts stay. Status-indicator style is a useful precedent (browser-local, low stakes). Form layout is heavier: wizard vs sections changes the **task flow**, not just chrome, so support and docs cost more than a color/icon preference.

| Phase | Recommendation |
| ----- | -------------- |
| **Now (F35)** | Keep the in-form test switch + `?formStyle=` / localStorage. Do not expose a Profile preference yet. |
| **After we pick a winner** | Ship **one** default. Optionally remember last-used layout in `localStorage` with **no** Preferences UI (invisible continuity). |
| **Later, only if evidence says so** | If manual testing / launch feedback shows a durable split (e.g. mobile vs desktop habits, accessibility), add **Account settings → Preferences → Application form style** — same browser-local pattern as status indicators unless cross-device sync is required (then persist on the profile row). |

**Principle:** Treat a Preferences control as a last resort, only if real users ask for it after launch.

**Bottom line:** Good instinct for optional personalization; **premature as a product preference** until we know both layouts remain valuable. Decide the layout first; only promote to Preferences if we deliberately keep both — and even then, prefer the principle above over shipping the control “just in case.”

---

## Open question: Wizard on create, sections on edit?

**Question (product):** What if we did **not** pick a single layout for both routes — use the **wizard** on `/admin/new` (create) and the **sections** layout on `/admin/edit/[id]` (edit)?

Rationale in one line: create is a guided first pass; edit is “jump in and change one thing.”

### Feedback (working stance)

This is a **stronger** dual-layout story than a Profile preference, because the split is tied to **job-to-be-done**, not taste.

| Mode | Fit |
| ---- | --- |
| **Create + wizard** | Linear path, progress (“step 2 of 5”), less tip overload for first draft / Save & Preview — helps activation |
| **Edit + sections** | Open the CV step or slug step directly; accordion matches “I already know this form” |

**Why it can work**

- No user-facing “choose your UI” decision  
- Clear product rule: *new applications are guided; edits are flexible*  
- Still one shared field brain / step map (same content, different chrome) — same F35 architecture we already have  
- Manual testing can validate the split on purpose: create journey vs edit jump-to-field journey  

**Why to be careful**

- We still **own two shells forever** (docs, QA, a11y, mobile) — cost is real even without a Preferences toggle  
- Users who create, then immediately edit, get a **layout change** on the same mental form — can feel like two products unless step titles, order, and field chrome stay identical  
- Edit often needs “scan everything” (e.g. fix missing CV + tweak video); a collapsed accordion can hide problems unless we default-open the first incomplete step or allow expand-all  
- Create draft restore (F15) and leave-confirm still apply; wizard step index must restore sensibly when a draft reloads mid-flow  

**Compared to “pick one winner”**

| Outcome | When to prefer it |
| ------- | ----------------- |
| **One layout everywhere** | Both feel fine on create *and* edit after testing; simpler launch story |
| **Create = wizard, edit = sections** | Create clearly benefits from gating/progress, and edit clearly suffers if forced through Continue screens |
| **Profile preference** | Only if users disagree with *either* fixed rule (see previous open question) |

**Practical recommendation**

1. **During F35:** Keep the test switch on both routes so we can still A/B each surface. While testing, deliberately try *create-as-wizard* and *edit-as-sections* as a named hybrid candidate (not only “all wizard” vs “all sections”).  
2. **If the hybrid wins:** Encode it as the product default (`new` → wizard, `edit` → sections), drop the in-form switch, and document the rule here + in the user guide. Optionally allow `?formStyle=` override for support/debug only.  
3. **If one layout wins on both:** Ship that one; do not keep the other “just in case.”  

**Bottom line:** Worth serious consideration — better justified than a user preference. Treat it as a **third decision option** in the log (wizard / sections / **hybrid by route**), and only keep both shells if create vs edit testing shows the split clearly earns its keep.

---

## Open question: One layout for desktop, another for mobile?

**Question (product):** What if we split by **viewport** instead of (or in addition to) route — e.g. **wizard on mobile / narrow screens**, **sections on desktop**?

Rationale in one line: phones reward one focused step; large screens can show more structure at once.

### Feedback (working stance)

The instinct matches how people use phones vs laptops, but a **viewport-based layout swap** is riskier than create-vs-edit, and easy to over-combine with other hybrids.

| Form factor | Plausible fit |
| ----------- | ------------- |
| **Mobile + wizard** | Less scroll, one job, big Continue — good for thumb flow and activation on a small screen |
| **Desktop + sections** | Accordion / multi-section scan uses width; jumping between steps feels cheaper with a mouse |

**Why it can work**

- No Profile preference; automatic by screen size  
- Same shared step map / field brain as other F35 options  
- Mobile is where long forms hurt most — if only one surface “needs” the wizard, phone is the usual candidate  

**Why to be careful (more than route hybrid)**

- **Mid-session layout changes** — rotate a tablet, undock a window, or resize the browser and the interaction model can flip while a draft is open (step index vs which accordion is open). That feels broken unless we freeze layout for the session or debounce aggressively.  
- **Breakpoint is a product decision** — `md` vs `lg`, touch vs width, “mobile” PWA on a large phone in landscape — support will get “why did my form change?” reports.  
- **Combinatorial cost** — If we also do create=wizard / edit=sections, we get four effective experiences (route × viewport). That defeats “one mental model” and explodes QA (especially ahead of `F39-123` mobile/responsive review).  
- **One responsive shell is usually enough** — Prefer tuning a single winner for small screens (sticky progress, full-width Continue, fewer side-by-side grids) over swapping the whole pattern at a media query.  
- **SSR / first paint** — Viewport is known on the client; a wrong first paint then swap causes layout flash unless we accept a default and only refine after mount (or use a coarse UA hint, which is worse).  

**Compared to other hybrids**

| Split | Stability | Best when |
| ----- | --------- | --------- |
| **By route (create / edit)** | Stable for a given page visit | Jobs differ: guided create vs surgical edit |
| **By viewport (mobile / desktop)** | Can change during one visit | One layout is *unusable* on a form factor after honest testing |
| **By Profile preference** | Stable until user changes it | Users disagree with any fixed rule |
| **Route × viewport × preference** | Chaos | Avoid |

**Practical recommendation**

1. **During F35:** Test **both** layouts at phone, tablet, and desktop widths (same checklist). Note failures per layout × breakpoint — do not assume wizard=mobile and sections=desktop without that evidence.  
2. **Default bias:** Pick **one** layout (or the create/edit hybrid) that works on mobile with responsive polish; let `F39-123` catch overflow/touch issues rather than inventing a second pattern for phones.  
3. **Only adopt viewport hybrid if** testing shows one layout is clearly painful on small screens *and* the other is clearly worse on large screens — and even then, **freeze layout for the session** (decide once on first paint / first form open) so resize/rotate does not reshuffle the UI mid-draft.  
4. **Do not stack** viewport hybrid on top of route hybrid + Profile preference unless launch data forces it.  

**Bottom line:** Useful as a **test lens** (does wizard win on mobile? do sections win on desktop?), weak as a default shipping rule. Prefer one responsive shell; treat viewport split as a last resort if a form factor fails hard — and list it in the decision log as **hybrid by viewport**, chosen only with evidence and a session-stable rule.

---

## Related

- Backlog ticket: `F35-119`  
- PR group branch intent: `feat/f35-application-form-steps`  
- Prior create-flow context: [CREATE_APP_DRAFT_AND_LEAVE.md](CREATE_APP_DRAFT_AND_LEAVE.md), [ACTIVATION_UX_F19.md](ACTIVATION_UX_F19.md)  
- Product chrome: [STYLE_GUIDE_PRODUCT.md](../design/STYLE_GUIDE_PRODUCT.md)  
- Related Preferences precedent: status indicator style under Account settings → Preferences  
- Related mobile pass: backlog `F39-123` (final mobile / responsiveness review)  
