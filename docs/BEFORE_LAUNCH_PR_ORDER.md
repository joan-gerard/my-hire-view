# Before-launch open PRs — effort & order

Planning companion to [Backlog.md](Backlog.md). Covers the **open before-launch PR groups** only: rough effort (1 = simple, 5 = major) and a recommended tackle order.

Open work and ticket details stay in the backlog; update this doc when those PRs ship or priorities change.

---

## 1. Effort rollup (open before-launch PRs)

| Effort | Count | PRs               |
| :----: | ----: | ----------------- |
| **1**  |     3 | A3, F22, F24      |
| **2**  |     3 | E1, F20, F23      |
| **3**  |     3 | F28, F30, L6      |
| **4**  |     4 | F17, F21, F29, I2 |
| **5**  |     1 | E2                |

**14 open** (F9, F10, F11, F12, F13, F15, F16, F18, F19, F25, F26 shipped). **Weighted average ≈ 2.79** — many 1–3 polish items; complexity concentrates in **E2**, then **F17 / F21 / F29 / I2**.

---

## 2. Suggested phases

Order by **dependencies first, then risk/correctness, then UX polish, then near-launch Musts**.

### Phase 0 — Quick correctness wins

**F26 shipped** _(also F10, F11, F12, F18, F25)_

Optional anytime docs/assets: **F22**, **F24** (don’t block engineering).

### Phase 1 — Upload / profile integrity

**F9 shipped** → **F13 shipped**

- Avatar purge races + primary-CV cap are correctness/concurrency issues
- Same mental model (uploads, R2, profile invariants)
- Better shipped **before** big UX/branding so UI isn’t rebuilt on shaky edges

### Phase 2 — Create-application UX chain

**F15 shipped** → **F16 shipped** → **F19 shipped**, then **F17**

- Strict dependency: draft persistence / CV-mode race before preview/draft-publish
- **F19** (onboarding + Public id copy + card legend / draft action clarity) shipped while create flows were fresh
- **F17** branding after those flows stabilize (avoid restyling half-finished UI twice; includes dashboard card visual skin)

### Phase 3 — Trust / compliance Shoulds

**F20 → F23 → F21**

- **F20** legal pages: already linked from footer/waitlist with no pages
- **F23** support entry: cheap once legal/marketing surfaces exist
- **F21** delete account after upload/profile integrity (**F9/F13**) so deletion isn’t fighting known storage bugs

### Phase 4 — Refactor prerequisites, then audits

**L6 → I2 → F28 → F29 → F30**

| Order                  | Why                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **L6** then **I2**     | Central client + single DB types; both are **F30** prereqs                            |
| **F28** a11y           | Can run anytime; finish before launch; file follow-up tickets                         |
| **F29** security       | Prefer **after** major hardening (**F9/F13/F10/F12**, etc.) so the review isn’t stale |
| **F30** refactor audit | Last among audits — only after **L6 + I2** (`F25` shipped)                            |

### Phase 5 — Near launch only (Must + ops)

**E1 → E2 → A3**

- Product lock (**E1**) before Stripe/gates (**E2**)
- **A3** (confirm email in prod) is ops with no code — last config before public launch
- Doing **E2** earlier wastes work if tiers/prices still change

---

## 3. Suggested sequence (all 14 open)

```
F17
  → F20 → F23 → F21
  → F22 / F24 (whenever)
  → L6 → I2 → F28 → F29 → F30
  → E1 → E2 → A3
```

**Why this beats “easiest first”:**

1. **Dependencies** — F15→F16→F19, E1→E2, L6/I2→F30 are real; ignore them and you thrash.
2. **Risk before paint** — API/storage races before branding.
3. **Reviews stay useful** — F28/F29/F30 after the bulk of pre-launch code, not before.
4. **Monetization last** — backlog already defers E1/E2 until launch is imminent.

If capacity is short: start **F17**.
