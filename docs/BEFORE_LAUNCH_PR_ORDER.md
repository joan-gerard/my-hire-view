# Before-launch open PRs — effort & order

Planning companion to [Backlog.md](Backlog.md). Covers the **open before-launch PR groups** only: rough effort (1 = simple, 5 = major) and a recommended tackle order.

Open work and ticket details stay in the backlog; update this doc when those PRs ship or priorities change.

---

## 1. Effort rollup (open before-launch PRs)

| Effort | Count | PRs |
| :----: | ----: | --- |
| **1** | 6 | A3, F11, F18, F22, F24, F25 |
| **2** | 6 | E1, F10, F12, F20, F23, F26 |
| **3** | 7 | F9, F13, F15, F19, F28, F30, L6 |
| **4** | 5 | F16, F17, F21, F29, I2 |
| **5** | 1 | E2 |

**Weighted average ≈ 2.6** — many 1–3 polish items; complexity concentrates in **E2**, then **F16 / F17 / F21 / F29 / I2**.

---

## 2. Suggested phases

Order by **dependencies first, then risk/correctness, then UX polish, then near-launch Musts**.

### Phase 0 — Quick correctness wins

**F25 → F11 → F18 → F10 → F12 → F26**

- Small diffs, low review load, clear “done”
- Fixes real bugs (list search 500, double cancel, draft count, public DTO leak risk, Auth name drift)
- **F25** early also clears a **F30** prerequisite

Optional anytime docs/assets: **F22**, **F24** (don’t block engineering).

### Phase 1 — Upload / profile integrity

**F9 → F13**

- Avatar purge races + primary-CV cap are correctness/concurrency issues
- Same mental model (uploads, R2, profile invariants)
- Better shipped **before** big UX/branding so UI isn’t rebuilt on shaky edges

### Phase 2 — Create-application UX chain

**F15 → F16**, then **F19**, then **F17**

- Strict dependency: draft persistence / CV-mode race before preview/draft-publish
- **F19** (onboarding + Public id copy + legend) while create flows are fresh
- **F17** branding after those flows stabilize (avoid restyling half-finished UI twice)

### Phase 3 — Trust / compliance Shoulds

**F20 → F23 → F21**

- **F20** legal pages: already linked from footer/waitlist with no pages
- **F23** support entry: cheap once legal/marketing surfaces exist
- **F21** delete account after upload/profile integrity (**F9/F13**) so deletion isn’t fighting known storage bugs

### Phase 4 — Refactor prerequisites, then audits

**L6 → I2 → F28 → F29 → F30**

| Order | Why |
| ----- | --- |
| **L6** then **I2** | Central client + single DB types; both are **F30** prereqs |
| **F28** a11y | Can run anytime; finish before launch; file follow-up tickets |
| **F29** security | Prefer **after** major hardening (**F9/F13/F10/F12**, etc.) so the review isn’t stale |
| **F30** refactor audit | Last among audits — only after **F25 + L6 + I2** |

### Phase 5 — Near launch only (Must + ops)

**E1 → E2 → A3**

- Product lock (**E1**) before Stripe/gates (**E2**)
- **A3** (confirm email in prod) is ops with no code — last config before public launch
- Doing **E2** earlier wastes work if tiers/prices still change

---

## 3. Suggested sequence (all 25)

```
F25 → F11 → F18 → F10 → F12 → F26
  → F9 → F13
  → F15 → F16 → F19 → F17
  → F20 → F23 → F21
  → F22 / F24 (whenever)
  → L6 → I2 → F28 → F29 → F30
  → E1 → E2 → A3
```

**Why this beats “easiest first” or “F17 first”:**

1. **Dependencies** — F15→F16, E1→E2, F25/L6/I2→F30 are real; ignore them and you thrash.
2. **Risk before paint** — API/storage races before branding/onboarding.
3. **Reviews stay useful** — F28/F29/F30 after the bulk of pre-launch code, not before.
4. **Monetization last** — backlog already defers E1/E2 until launch is imminent.

If capacity is short: start **F25 + F11 + F18 + F10**, then **F9**.
