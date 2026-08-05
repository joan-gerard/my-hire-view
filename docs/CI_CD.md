# CI/CD Pipeline

**Canonical doc** for continuous integration and delivery architecture. Update this file whenever workflows, runners, gates, or deploy steps change.

**Related:** [TESTING.md](TESTING.md) (test suite) · [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) · [Backlog.md](Backlog.md) (`A1-002`)

> Last updated: August 5, 2026

---

## 1. Current state (summary)

| Concern | Status |
| -------- | ------ |
| **CI** | GitHub Actions runs Vitest (`pnpm test:ci`) on PRs and pushes to `main` |
| **Local pre-push** | Husky runs `pnpm test:ci` before every `git push` (same command as CI) |
| **CD / deploy** | Not in-repo — hosting (e.g. Vercel) is separate from this pipeline |
| **Lint / typecheck / build in CI** | Not yet |
| **Branch protection** | Manual GitHub settings (require CI check before merge) — optional ops step |

Shipped as **A1-002** on branch `chore/a1-ci-cd`.

---

## 2. High-level architecture

```mermaid
flowchart LR
  Dev[Developer] --> Commit[git commit]
  Commit --> PushCmd[git push]
  PushCmd --> PrePush[Husky pre-push<br/>pnpm test:ci]
  PrePush -->|fail| Stop[Push blocked]
  PrePush -->|pass| Remote[Remote update]
  Remote --> GHA[GitHub Actions]
  GHA --> CI[CI workflow<br/>.github/workflows/ci.yml]
  CI --> Install[pnpm install<br/>--frozen-lockfile]
  Install --> Test[pnpm test:ci<br/>Vitest]
  Test -->|pass| Green[Check green]
  Test -->|fail| Red[Check fails]
  Green --> Merge[Merge to main]
  Merge --> Host[Host / CD<br/>outside this repo pipeline]
```

**Design intent**

- Keep CI **fast and secret-free**: unit/API tests use mocks (no Supabase/R2 credentials required on the runner).
- **Local pre-push** mirrors CI for faster feedback; it does not replace CI (bypassable with `--no-verify`; CI still gates the shared repo).
- One workflow file for now; split later if jobs diverge (e.g. lint vs test vs e2e).
- Deploy remains outside this doc’s “in-repo pipeline” until we codify it (Vercel project settings, preview URLs, etc.).

---

## 3. Local git hooks

| Hook | Path | Command | Notes |
| ---- | ---- | ------- | ----- |
| **pre-push** | [`.husky/pre-push`](../.husky/pre-push) | `pnpm test:ci` | Blocks push if the suite fails |

**Setup:** `pnpm install` runs `prepare` → `husky`, which enables hooks for this clone. No pre-commit hook (full suite is reserved for push / CI).

**Skip (emergency only):** `git push --no-verify` — prefer fixing tests instead.

---

## 4. Workflow inventory

| Workflow | Path | Purpose |
| -------- | ---- | ------- |
| **CI** | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Install deps + run `pnpm test:ci` |

### CI workflow detail

| Field | Value |
| ----- | ----- |
| **Name** | `CI` |
| **Triggers** | `pull_request` (all branches); `push` to `main` |
| **Concurrency** | `ci-${{ github.workflow }}-${{ github.ref }}` — cancel in-progress runs on the same ref |
| **Runner** | `ubuntu-latest` |
| **Timeout** | 10 minutes |
| **Job** | `test` |

**Steps (in order)**

1. Checkout (`actions/checkout@v4`)
2. Setup pnpm (`pnpm/action-setup@v4`, version **10**)
3. Setup Node.js (`actions/setup-node@v4`, Node **22**, `cache: pnpm`)
4. `pnpm install --frozen-lockfile`
5. `pnpm test:ci` → `vitest run`

---

## 5. Tooling & versions

| Tool | Version / pin | Notes |
| ---- | ------------- | ----- |
| Node.js | 22 | Matches current local default; pin in workflow |
| pnpm | 10 | Via `pnpm/action-setup` |
| Husky | 9 | Local `pre-push` hook |
| Test runner | Vitest (`pnpm test:ci`) | See [TESTING.md](TESTING.md) |
| Package lock | `pnpm-lock.yaml` | Frozen install in CI |

---

## 6. Secrets & environment

| Need | In CI today? |
| ---- | ------------ |
| Supabase / R2 / app env vars | **No** — mocked unit suite |
| GitHub token | Default `GITHUB_TOKEN` only (checkout) |

When future jobs need secrets (e.g. integration tests, deploy tokens), document them here and store them in the GitHub repo **Settings → Secrets and variables → Actions**.

---

## 7. Quality gates (product / ops)

| Gate | Where | Notes |
| ---- | ----- | ----- |
| Local pre-push | Husky `.husky/pre-push` | Same `pnpm test:ci` as CI; fails the push on red |
| Automated tests | GitHub Actions check `CI / test` | Must stay green on PRs |
| Require check to merge | GitHub branch protection on `main` | Not encoded in YAML; configure in GitHub UI if desired |
| Manual local run | `pnpm test:ci` | Same command as hooks / CI |

---

## 8. Roadmap / not yet in pipeline

Record intended additions here so this doc stays the single architecture source (tickets still live in [Backlog.md](Backlog.md)):

| Idea | Notes |
| ---- | ----- |
| `pnpm lint` | ESLint on PR (and optionally a lighter pre-commit) |
| `pnpm build` / typecheck | Catch Next.js / TS build breaks |
| Coverage upload | Optional (`@vitest/coverage-v8` already a dep) |
| CD in-repo | Document Vercel (or other) deploy triggers, preview vs production |
| E2E | Playwright/Cypress — would need secrets / preview URL strategy |

---

## 9. Changelog

| Date | Change | Ticket / PR |
| ---- | ------ | ----------- |
| 2026-08-05 | Initial CI: GitHub Actions + `pnpm test:ci` on PR / `main` | A1-002 |
| 2026-08-05 | Husky pre-push runs `pnpm test:ci` before push | A1-002 |
