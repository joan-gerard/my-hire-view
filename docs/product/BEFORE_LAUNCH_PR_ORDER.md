# Before-launch open PRs — effort & order

Planning companion to [Backlog.md](Backlog.md). Covers the **open before-launch PR groups** only: rough effort (1 = simple, 5 = major) and a recommended tackle order.

Open work and ticket details stay in the backlog; update this doc when those PRs ship or priorities change.

---

## 1. Effort rollup (open before-launch PRs)

| Effort | Count | PRs               |
| :----: | ----: | ----------------- |
| **1**  |     6 | A3, F22, F24, F32, F33, J4 |
| **2**  |     4 | E1, E4, F23, F39  |
| **3**  |     7 | F28, F30, F38, F40, F41, J5, L6 |
| **4**  |     5 | F21, F29, F35, I2, J1 |
| **5**  |     1 | E2                |

**23 open** (F9, F10, F11, F12, F13, F15, F16, F17, F18, F19, F20, F25, F26, F34 shipped; **J4** + **J1** + **J5** from the competitive username decision). **Weighted average ≈ 2.61** — many 1–3 polish items; complexity concentrates in **E2**, then **F35 / F21 / F29 / I2 / J1**. Counsel-reviewed legal copy remains as launch-gated ticket `F20-020` (not a separate open PR group). **F40** (incomplete draft saves) and **F41** (create final-step preview + Publish / Save as draft) are planned after F35 — see [INCOMPLETE_DRAFT_SAVES.md](INCOMPLETE_DRAFT_SAVES.md) and backlog `F41-127`. **J5** (`J5-128`) replaces Name in URL with company/role slug order after **J1**.

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

**F15 shipped** → **F16 shipped** → **F19 shipped** → **F17 shipped** → **F34 shipped**, then **F35** / **F38**

- Strict dependency: draft persistence / CV-mode race before preview/draft-publish
- **F19** (onboarding + Public id copy + card legend / draft action clarity) shipped while create flows were fresh — design context: [ACTIVATION_UX_F19.md](../retrospectives/ACTIVATION_UX_F19.md)
- **F17** branded `/admin`, `/view`, auth to the warm product palette (PR #56)
- **F34** restyled those surfaces to the **marketing** brand system and rewrote [STYLE_GUIDE_PRODUCT.md](../design/STYLE_GUIDE_PRODUCT.md) (working plan: [F34_PRODUCT_MARKETING_BRANDING.md](../design/F34_PRODUCT_MARKETING_BRANDING.md))
- **F35** rethinks the long create/edit `ApplicationForm` into a stepped flow — modal/wizard **or** one-page collapsible sections (after F34 chrome; before F32 QA)
- **F40** / **F41** follow the F35 layout pick when possible (incomplete drafts + create final-step preview/publish — do not mix into the dual-layout test)
- **F38** polishes public `/view` to the same F34 quality bar as admin/Account settings (F34 only lightly touched `/view`)

### Phase 3 — Trust / compliance Shoulds

**F23 → F21** _(F20 PR group shipped)_

- **F20** legal draft UI shipped (`F20-019`); remaining counsel copy is ticket **`F20-020`** (launch-gated; not an open PR in the rollup)
- **F23** support entry: cheap once legal/marketing surfaces exist
- **F21** delete account after upload/profile integrity (**F9/F13**) so deletion isn’t fighting known storage bugs

### Phase 4 — Refactor prerequisites, then audits

**L6 → I2 → F28 → F39 → F32 → F29 → F30**

| Order                  | Why                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **L6** then **I2**     | Central client + single DB types; both are **F30** prereqs                            |
| **F28** a11y           | Can run anytime; finish before launch; file follow-up tickets                         |
| **F39** mobile/responsive | Phone / tablet / desktop pass after major UI (`F35`, `F38`); file fix tickets       |
| **F32** manual QA      | End-to-end candidate journey; after remaining user-facing work (`F35`, `F38`, `F39`+); file bugs |
| **F29** security       | Prefer **after** major hardening (**F9/F13/F10/F12**, etc.) so the review isn’t stale |
| **F30** refactor audit | Last among audits — only after **L6 + I2** (`F25` shipped)                            |

### Phase 5 — Near launch only (Must + ops)

**E4 / J4 (anytime) → J1 (prefer before E1) → J5 (after J1) → E1 → E2 → A3**

- **E4** swaps annual → quarterly on the working draft + `#pricing` UI (can ship early; not a lock)
- **J4** (`J4-125`) drops Premium-only vanity from pricing docs/copy — username for all tiers ([COMPETITIVE_COMPARISON.md](COMPETITIVE_COMPARISON.md)); can ship early with E4
- **J1** (`J1-126`) implements Reslink-style username at signup for all tiers — prefer after J4; before E1 lock when possible (supersedes cancelled Premium vanity `J1-079`)
- **J5** (`J5-128`) replaces create/edit **Name in URL** with **company-role** / **role-company** slug order after username brands `/view/{username}/…` — prefer after J1
- Product lock (**E1**) before Stripe/gates (**E2**) — lock **monthly + quarterly** (no annual) and **username-for-all** (not Premium vanity)
- **A3** (confirm email in prod) is ops with no code — last config before public launch
- **`F20-020`** is launch-gated and stays outside the open-PR count: counsel-reviewed Terms, Privacy, and Cookies are required before public launch, but they are not an open PR group
- Doing **E2** earlier wastes work if tiers/prices still change

---

## 3. Suggested sequence (open before-launch PRs)

```
F35 / F38
  → F40 (after F35 layout pick when possible)
  → F41 (after F35; with F40 when publish completeness matters)
  → F23 → F21
  → F22 / F24 / F33 / E4 / J4 (whenever; E4 + J4 before E1)
  → J1 (prefer after J4; before E1 when possible) → J5 (company/role slug order after J1)
  → L6 → I2 → F28 → F39 → F32 → F29 → F30
  → E1 → E2 → A3
```

**Why this beats “easiest first”:**

1. **Dependencies** — F15→F16→F19, marketing rebrand→F34→F35/F38, E4/J4→E1→E2, J4→J1→J5, L6/I2→F30 are real; ignore them and you thrash. Prefer F40 / F41 after F35 layout pick when possible (soft ordering, not a hard gate — see sequence above).
2. **Risk before paint** — API/storage races before branding.
3. **Reviews stay useful** — F28/F39/F29/F30 after the bulk of pre-launch code, not before.
4. **Monetization last** — backlog already defers E1/E2 until launch is imminent; E4/J4 only update the draft.

If capacity is short: finish **F35** (create/edit steps) and **F38** (`/view` polish) before **F39** / **F32** QA. Do not mix **F40** incomplete draft saves or **F41** create preview/publish into the F35 dual-layout test.
