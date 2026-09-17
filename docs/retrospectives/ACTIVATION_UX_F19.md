# Activation UX: legend, Public id clarity, and Getting started (F19)

**Shipped design context** for before-launch PR group **F19** (`F19-047` legend, `F19-046` Public id / share URL copy, `F19-044` Getting started checklist) and the small follow-ons that kept the empty dashboard aligned with that story (clearer empty state; hide legend/search until the first application exists).

This retrospective is not a second checklist — see [Backlog.md](../Backlog.md) PR group F19 (shipped). Activation framing: [GO_TO_MARKET.md](../GO_TO_MARKET.md) (aha = first shared link, not a feature tour).

---

## The problem we were solving

After signup and profile work, candidates still hit a **trust and clarity gap** before the aha:

1. **Dashboard glyphs were opaque** — draft / active / viewed / archived / CV missing looked intentional, but nothing explained them, and draft actions (Publish vs Preview vs Copy Link) were easy to misread after F16.
2. **Share URLs looked magical** — `/view/{publicId}/{slug}` appeared on cards and forms without a plain-language account for the opaque segment (not their name, not vanity yet).
3. **First-session progress was invisible** — the Getting started checklist asks for a photo, a primary CV, a first draft, and publish/share so new users move toward a shareable link. Those are **activation nudges**, not hard requirements for a live page: a published application needs a CV (**primary or tailored**) and a **YouTube URL**; showing a profile picture is optional.
4. **An empty Applications list felt dead** — a single muted sentence next to search and a legend button competed with the real next step: create.

None of that blocks a power user. All of it costs **buy-in** for someone who signed up because they want recruiters to *see* them.

---

## Product bets (what we optimized for)

| Bet | Why |
|-----|-----|
| **Explain in place, don’t invent a new product surface** | Legend as a modal from the dashboard; Public id on Profile + URL preview on create/edit; checklist as a floating panel — not a wizard that traps them. |
| **Checklist nudges toward the aha, not feature completeness** | Steps end at **Publish & share**. Optional tour stays post-launch (`F31-105`). |
| **Respect autonomy** | Skip / Skip all / Dismiss; sticky “done once” in-browser so deleting the only app doesn’t reopen guilt; prefs scoped by account key so recreate ≠ inherit. |
| **Don’t tax the API or the empty room** | Bootstrap checklist from the admin layout; refetch on mutation notify only; hide search/legend until there is something to search or decode. |

---

## What we shipped (by ticket)

### F19-047 — “What do these icons mean?”

- Dashboard button opens a **modal** legend: status icons (draft, active not viewed, active viewed, archived) plus **CV missing**, plus short draft-action clarity (Publish / Preview / Publish to share vs Copy Link).
- Shared display map so card badges and legend stay one source of truth.
- A11y hardening: heading focus on open, body scroll lock, single-path dismiss, focus rings.

**Buy-in effect:** Status stops feeling like a private code. Draft vs live becomes teachable without leaving the list.

### F19-046 — Public id + share link preview

- Profile **Account** shows Public id with helper copy and an example path shape.
- Create/edit show a **live share URL preview** under the slug so the opaque id is concrete before first publish.
- Avoided a redundant profile fetch where the page already had the row.

**Buy-in effect:** The weird middle segment of the URL is *their* account token, not a bug or a secret name field — trust before they paste a link into LinkedIn.

### F19-044 — Getting started checklist

- Floating panel on all `/admin` routes: create profile → location or link → photo → primary CV → first draft → publish/share.
- Titles only (no long blurbs); progress ticks live via mutation notify.
- Minimize / expand, Skip / Skip all, stay visible until **Dismiss**; prefs in one `localStorage` blob scoped by account key (with legacy multi-key migration).
- Server bootstrap from layout (no four `/api` GETs on first paint); client refetch only when something that can change a step succeeds.
- Hardened races: refresh bootstrap into state; ignore stale loads after dismiss; disclosure control stays mounted for keyboard/`aria-controls`.

**Buy-in effect:** A continuous “you’re making progress toward a shareable link” signal without forcing a tutorial or blocking the UI.

Data flow: [DATA_FLOW_ONBOARDING_CHECKLIST.md](../DATA_FLOW_ONBOARDING_CHECKLIST.md).

### Follow-ons on the same activation thread

| Change | Why it belongs here |
|--------|---------------------|
| Stronger **dashboard empty state** (headline, why, **New application** CTA; search miss + Clear search) | Empty list is the first impression; it should sell the aha, not apologize. |
| **Hide legend + search until first application** (keep them when searching / fetching after clear) | Chrome that only makes sense with a list should not compete with create. |

---

## Alternatives we considered (and didn’t ship in F19)

| Option | Why not (yet) |
|--------|----------------|
| Full-screen onboarding wizard | High friction; conflicts with “edit profile while creating an app”; tour is `F31`. |
| Persist checklist skips/dismiss in Supabase | Cross-device nice-to-have; browser prefs enough for launch; revisit if analytics or multi-device matter. |
| Permanently non-dismissible checklist | Felt pushy; Skip/Dismiss keep goodwill once they know the path. |
| Vanity public ids / Option D opaque-only URLs | Product/ infra later (`J2`); F19 only explains today’s token. |
| Restyle card chrome / brand colors | Visual skin stays `F17-017`; F19 owns meaning, not paint. |

---

## What we learned

1. **Clarity compounds activation** — Legend + URL preview + checklist attack three different “I don’t get it” moments that all sit *before* the first shared link.
2. **Nudge ≠ trap** — A floating checklist with skip/dismiss retained buy-in better than a blocking wizard would have for this product.
3. **Empty states are product surfaces** — Treating “no applications” as leftover copy wasted the moment we most need a CTA.
4. **Layout chrome has a threshold** — Search and legend are tools for a list; showing them on zero apps was noise.
5. **Client prefs need an account key** — Same email after delete/recreate must not inherit another life’s checklist; `public_id` / `user:{id}` scoping was required once sticky completion existed.
6. **Bootstrap vs refetch** — First paint should not burn rate-limited `/api` GETs that pages already overlap; mutations still need a cheap invalidate path.

---

## Engineering notes (implementation, not product)

- Shared status display: `lib/utils/application-status-display.ts` + legend/modal components.
- Checklist: `lib/utils/onboarding-checklist*.ts`, `load-onboarding-checklist-snapshot.ts`, `components/admin/OnboardingChecklist.tsx` in `app/admin/layout.tsx`.
- Notify after profile / CV / application mutations so ticks update without full reload.
- CV-missing tooltip/legend: edit and select/upload a CV (not “restore” a deleted object).

---

## Related docs

| Doc | Role |
|-----|------|
| [USER_GUIDE.md](../USER_GUIDE.md) | Candidate-facing Getting started, legend, Public id |
| [GO_TO_MARKET.md](../GO_TO_MARKET.md) | Activation / aha = first shared link |
| [DATA_FLOW_ONBOARDING_CHECKLIST.md](../DATA_FLOW_ONBOARDING_CHECKLIST.md) | Checklist load / prefs / notify |
| [MANUAL_TEST_ONBOARDING_CHECKLIST.md](../manual-testing/MANUAL_TEST_ONBOARDING_CHECKLIST.md) | Checklist manual checks |
| [MANUAL_TEST_APPLICATION_STATUS_LEGEND.md](../manual-testing/MANUAL_TEST_APPLICATION_STATUS_LEGEND.md) | Legend manual checks |
| [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) | Why opaque `public_id` exists |
| [Backlog.md](../Backlog.md) | `F19-044` / `046` / `047` shipped; `F31-105` tour later; `F17-017` brand skin |
| [BEFORE_LAUNCH_PR_ORDER.md](../BEFORE_LAUNCH_PR_ORDER.md) | F19 in the create-UX chain after F15/F16 |
