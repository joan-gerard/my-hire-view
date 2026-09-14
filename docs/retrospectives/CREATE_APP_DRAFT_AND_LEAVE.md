# Create-application local draft and intentional leave

**Actionable work** lives in [Backlog.md](../Backlog.md) (`F15-045`, `F15-049`). This retrospective is design/context only — not a second checklist.

How we landed on **keep a browser draft for accidents**, but **discard it when the user deliberately leaves** `/admin/new` (Back or in-app navigation), after confirming.

Manual checks: [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](../manual-testing/MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md). User-facing copy: [USER_GUIDE.md](../USER_GUIDE.md).

---

## The first instinct

Ticket **F15-045** started as: don’t lose create-application progress on refresh or navigation. The natural reading was **persist the form for every leave path** — refresh, Back, Dashboard/Profile links, closing the tab — and restore whenever the user returned to `/admin/new`.

### Why that felt right

| Reason | Rationale at the time |
|--------|------------------------|
| Accidents happen | A mis-click or accidental Back should not wipe a half-built application |
| Refresh is common | Tweaking layout, recovering from a hiccup, or reloading after an error should restore fields |
| “Autosave” mental model | Users increasingly expect unfinished forms to come back until they submit or explicitly clear |
| Cheap to implement | `localStorage` keyed by signed-in user, short TTL, clear on successful create |

Under that model, **leaving and coming back** always meant “pick up where I left off.” Discarding was only for successful Save (or expiry / blank form).

---

## What UX pushed back on

Treating **every** navigation the same conflates two different intents:

1. **I didn’t mean to leave** — refresh, tab close, crash, or an accidental gesture. Restoring the draft is a kindness.
2. **I meant to leave** — browser Back, or clicking Dashboard / Profile / another admin link. The user is choosing a different task. Restoring a stale create form the next time they open **New Application** feels like the product ignored that choice (“why is last week’s half-filled company still here?”).

We also didn’t want a silent discard on intentional leave: progress is still valuable until the user confirms they are done with it.

So the product rule became:

> **Save the draft for unintended interruption. On deliberate leave, ask once; if they confirm, discard so the next create starts clean.**

Refresh and tab close stay **unblocked** on purpose — the browser’s `beforeunload` tax is poor UX, and the draft already covers those cases.

---

## What we do now

| Event | Draft behaviour |
|-------|-----------------|
| Typing / changing leave-relevant fields | Debounced write to `localStorage` (per auth `user.id`, ~7-day TTL) |
| Refresh / reload | Draft kept → restored on next `/admin/new` |
| Tab close / crash | Draft kept → restored later |
| Successful create | Draft cleared |
| Failed create | Draft kept |
| Clear form back to “blank” (no real progress) | No prompt; draft not kept as meaningful progress |
| Back or same-origin admin link **while there is progress** | Confirm dialog; **Stay** keeps page + draft; **Leave** runs discard then navigates |
| Untouched form (profile prefills only) | No prompt; nothing meaningful to discard |

Confirm copy (create flow): leaving discards this draft; **Yes, I'm sure** / **No, stay on this page**.

Implementation sketch:

- Persist/restore/clear: `lib/utils/create-application-draft.ts` (wired from `/admin/new` via `ApplicationForm`).
- What counts as “progress” for the prompt: leave-relevant snapshot helpers in `lib/utils/leave-confirm.ts` (ignores auto slug / automatic CV defaults alone).
- Intercept Back + same-origin links, dialog, discard-on-confirm: `hooks/useLeaveConfirm.ts` (history sentinel so Back can be confirmed without immediately leaving).

Related: **F15-049** (CV mode while the primary library loads) is orthogonal correctness on the same form; it does not change the leave/discard policy.

---

## Alternatives we considered

| Option | Why we didn’t ship it |
|--------|------------------------|
| Always keep draft, never prompt | Intentional leave feels sticky; next New Application is surprising |
| Always keep draft, prompt only as “are you sure?” without discard | Confirm without discard trains users that Leave doesn’t mean Leave |
| Block refresh / tab close too (`beforeunload`) | Annoying; draft already covers accidents |
| Server-side draft application (`status = draft`) for this | Heavier; overlaps **F16-050** preview/publish flows; local draft is enough for pre-submit create |

---

## Engineering notes (follow-ons)

Once discard-on-confirm was the rule, leave navigation had to be correct:

- Single history sentinel (no stacked guards when progress flickers).
- Long-lived `popstate` listener so sentinel-removal events are consumed even if `enabled` toggled off mid-flight.
- Confirmed link leave: drop sentinel, then `replace` only after history is off the guard (avoid bouncing back to `/admin/new`).

Those are implementation hardening around the UX decision above, not a change to the product rule.

---

## Related docs

| Doc | Role |
|-----|------|
| [USER_GUIDE.md](../USER_GUIDE.md) | What candidates see |
| [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](../manual-testing/MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md) | Manual verification |
| [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) | Server `status = draft` / archive (different from this browser draft) |
| [Backlog.md](../Backlog.md) | `F15-045`, `F15-049`, `F16-050` |
