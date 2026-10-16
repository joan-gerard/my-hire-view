# Before-launch open PRs — effort & order

Planning companion to [Backlog.md](Backlog.md). Covers the **open before-launch PR groups** only: rough effort (1 = simple, 5 = major) and a recommended tackle order.

Open work and ticket details stay in the backlog; update this doc when those PRs ship or priorities change.

---

## 1. Effort rollup (open before-launch PRs)

| Effort | Count | PRs               |
| :----: | ----: | ----------------- |
| **1**  |     5 | A3, F22, F24, F32, F33 |
| **2**  |     3 | E1, E4, F23       |
| **3**  |     3 | F28, F30, L6      |
| **4**  |     5 | F21, F29, F34, F35, I2 |
| **5**  |     1 | E2                |

**17 open** (F9, F10, F11, F12, F13, F15, F16, F17, F18, F19, F20, F25, F26 shipped). **Weighted average ≈ 2.65** — many 1–3 polish items; complexity concentrates in **E2**, then **F34 / F35 / F21 / F29 / I2**. Counsel-reviewed legal copy remains as launch-gated ticket `F20-020` (not a separate open PR group).

---

## 2. Suggested phases

Order by **dependencies first, then risk/correctness, then UX polish, then near-launch Musts**.

### Phase 0 — Quick correctness wins

**F26 shipped** _(also F10, F11, F12, F18, F25)_

Optional anytime docs/assets/marketing: **F22**, **F24**, **F33** (don’t block engineering). **F32** (end-to-end manual QA) is a near-launch pass, not an anytime docs chore — see Phase 4 / sequence.

### Phase 1 — Upload / profile integrity

**F9 shipped** → **F13 shipped**

- Avatar purge races + primary-CV cap are correctness/concurrency issues
- Same mental model (uploads, R2, profile invariants)
- Better shipped **before** big UX/branding so UI isn’t rebuilt on shaky edges

### Phase 2 — Create-application UX chain + branding

**F15 shipped** → **F16 shipped** → **F19 shipped** → **F17 shipped**, then **F34** → **F35**

- Strict dependency: draft persistence / CV-mode race before preview/draft-publish
- **F19** (onboarding + Public id copy + card legend / draft action clarity) shipped while create flows were fresh — design context: [ACTIVATION_UX_F19.md](../retrospectives/ACTIVATION_UX_F19.md)
- **F17** branded `/admin`, `/view`, auth to the warm product palette (PR #56)
- **F34** restyles those surfaces to match the **marketing** brand system after the marketing rebrand lands (update [STYLE_GUIDE_PRODUCT.md](../design/STYLE_GUIDE_PRODUCT.md) in the same PR)
- **F35** rethinks the long create/edit `ApplicationForm` into a stepped flow — modal/wizard **or** one-page collapsible sections (after F34 chrome; before F32 QA)

### Phase 3 — Trust / compliance Shoulds

**F23 → F21** _(F20 PR group shipped)_

- **F20** legal draft UI shipped (`F20-019`); remaining counsel copy is ticket **`F20-020`** (launch-gated; not an open PR in the rollup)
- **F23** support entry: cheap once legal/marketing surfaces exist
- **F21** delete account after upload/profile integrity (**F9/F13**) so deletion isn’t fighting known storage bugs

### Phase 4 — Refactor prerequisites, then audits

**L6 → I2 → F28 → F32 → F29 → F30**

| Order                  | Why                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **L6** then **I2**     | Central client + single DB types; both are **F30** prereqs                            |
| **F28** a11y           | Can run anytime; finish before launch; file follow-up tickets                         |
| **F32** manual QA      | End-to-end candidate journey; after remaining user-facing work (`F34`, `F35`+); file bugs |
| **F29** security       | Prefer **after** major hardening (**F9/F13/F10/F12**, etc.) so the review isn’t stale |
| **F30** refactor audit | Last among audits — only after **L6 + I2** (`F25` shipped)                            |

### Phase 5 — Near launch only (Must + ops)

**E4 (anytime) → E1 → E2 → A3**

- **E4** swaps annual → quarterly on the working draft + `#pricing` UI (can ship early; not a lock)
- Product lock (**E1**) before Stripe/gates (**E2**) — lock **monthly + quarterly** (no annual)
- **A3** (confirm email in prod) is ops with no code — last config before public launch
- **`F20-020`** is launch-gated and stays outside the 17-PR count: counsel-reviewed Terms, Privacy, and Cookies are required before public launch, but they are not an open PR group
- Doing **E2** earlier wastes work if tiers/prices still change

---

## 3. Suggested sequence (all 17 open)

```
F34 → F35
  → F23 → F21
  → F22 / F24 / F33 / E4 (whenever; E4 before E1)
  → L6 → I2 → F28 → F32 → F29 → F30
  → E1 → E2 → A3
```

**Why this beats “easiest first”:**

1. **Dependencies** — F15→F16→F19, marketing rebrand→F34→F35, E4→E1→E2, L6/I2→F30 are real; ignore them and you thrash.
2. **Risk before paint** — API/storage races before branding.
3. **Reviews stay useful** — F28/F29/F30 after the bulk of pre-launch code, not before.
4. **Monetization last** — backlog already defers E1/E2 until launch is imminent; E4 only updates the draft.

If capacity is short: finish **F34**, then **F35** (create/edit steps), before **F32** manual QA.
