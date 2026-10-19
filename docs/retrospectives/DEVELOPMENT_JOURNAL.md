# Development journal

Running log of product thinking, implementation decisions, feedback, and completed work. Unlike topic retrospectives (one file per subject), this is a **diary**: append newest entries at the top.

Related deep-dives stay in their own retrospectives when a topic grows large enough (e.g. [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md), [CREATE_APP_DRAFT_AND_LEAVE.md](CREATE_APP_DRAFT_AND_LEAVE.md)).

---

## 2026-10-19 — F35 dual layouts, open questions, incomplete drafts deferred

### Context

Continued before-launch work from [BEFORE_LAUNCH_PR_ORDER.md](../product/BEFORE_LAUNCH_PR_ORDER.md). After F34 branding, next user-facing pair is **F35** (stepped create/edit) and **F38** (`/view` polish). Trello cards for F35/F38 moved to In Progress.

### F35 — what we built today

- **Wish:** Stop using one long create/edit form; evaluate two patterns before locking UX.
- **Patterns:** (A) wizard — one step per screen; (B) sections — accordion on one page.
- **Approach:** Shared step map + field brain; two layout shells; **test switch** (`?formStyle=` → localStorage → env → default `sections`) instead of two git branches or a permanent Preferences control.
- **Step map:** Role → About you → CV & video → Share URL → Review & save.
- **Fixes while hardening for manual QA:** radio semantics on the switch; skip no-op layout re-clicks; focus rings; accordion `aria-controls`; `aria-disabled` Continue so blocked reasons are reachable; dedicated style-change event (not synthetic `popstate`, which tripped leave-confirm); Enter must not save until Review; submit errors navigate to the owning step; error-step order prefers earlier steps; sections may collapse **all** panels.
- **Working doc:** [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md) (lives on `feat/f35-application-form-steps` until that PR lands) — includes manual-test checklist and open questions.

### Product open questions (logged, not shipped)

| Question | Working stance |
| -------- | -------------- |
| Profile preference for wizard vs sections? | Last resort, only if real users ask after launch |
| Wizard on create, sections on edit? | Stronger than a preference; third decision option after testing |
| Different layout by viewport (mobile/desktop)? | Good test lens; weak default — prefer one responsive shell; avoid stacking hybrids |

### Incomplete server drafts (plan parked — separate PR)

**Ask:** Allow saving a draft even when required fields are empty; apps must not go live without all required fields.

**Decision today:** Do **not** implement on the F35 branch. Layout evaluation and Save/publish rules are different risks; mixing them thrashs review and manual testing.

**Parked as:** before-launch ticket **`F40-124`** / PR group **F40** — plan: [INCOMPLETE_DRAFT_SAVES.md](../product/INCOMPLETE_DRAFT_SAVES.md).

**Rules to implement later:** draft create/update may be incomplete; Publish / `status → active` server-gated on completeness; active edits stay strict.

**Related idea not in F40:** leave-confirm third option (“keep draft and leave”) — localStorage already autosaves; that would be “leave but keep” vs discard, not a new Save. Out of scope for F40.

### Also noted

Competitive comparison doc edits (editable live apps vs Reslink; PDF badge gap) were discussed separately from F35 and should stay out of the F35 layout commit when possible.

### Next

1. Finish F35 manual testing → pick layout (or hybrid) → remove test switch.  
2. F38 `/view` polish when ready.  
3. Revisit **F40** incomplete draft saves in its own PR after F35 Save UX is settled.
