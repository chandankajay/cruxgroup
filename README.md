# Crux Group monorepo

Heavy equipment rental marketplace (Hyderabad, Telangana). Turborepo with three Next.js apps on Vercel:

| App | Package | Vercel project | Production URL |
|-----|---------|----------------|----------------|
| Marketing web | `@crux/web` | `cruxgroup-web` | `www.cruxgroup.in` |
| Admin + Partner OS | `@crux/admin` | `crux-admin` | `admin.cruxgroup.in` |
| Customer bookings | `@crux/bookings` | `crux-bookings` | `bookings.cruxgroup.in` |

**Branch model:** trunk-based — `main` plus short-lived feature branches only (no `develop` / `qa`).

**Merge policy:** use **squash merge only** on `main` (GitHub repo setting). Deploy change detection uses `github.event.before` with fallback to `HEAD^` so turbo-affected apps match the squashed commit diff.

## Git conventions (Jira + Conventional Commits)

| Rule | Pattern / example |
|------|-------------------|
| **Branch** | `type/JIRA-ID` — `^(feat\|fix\|chore\|refactor\|perf\|docs\|test\|ci\|hotfix)/[A-Z]+-\d+$` (e.g. `feat/CWA-53`) |
| **PR title** | Conventional Commits with **Jira id as scope**: `feat(CWA-53): add salesperson admin` |
| **Breaking** | `feat(CWA-53)!: …` or a `BREAKING CHANGE:` footer in the PR body / commit message |
| **Squash merge** | Squash title on merge should match the PR title (becomes the commit on `main`) |

**CI:** `ci / conventions` on pull requests validates branch + title. **Temporary exemption:** open PRs **#23–#26** only (by PR number, not branch name) — remove from `ci.yml` after **#26** merges.

**Local commits:** [Husky](https://typicode.github.io/husky/) runs **commitlint** on `commit-msg` (same types + `scope` = Jira id). Run `pnpm install` once to enable the hook.

### Releases (semver)

After a successful **production promote**, `promote-production.yml` runs **semantic-release** (dry-run) on the **manifest `release_sha`**, then `gh release create vX.Y.Z --target <release_sha>` so a newer `main` tip does not affect versioning (`contents: write` on that job only).

**Why semantic-release (not release-please):** promote is already a gated, post-prod step; we want an automatic tag + release from squash commits on `main`, not an ongoing “release PR” branch.

**Backfill `v1.0.0` (current production baseline)** — do once before relying on automated bumps:

1. Find the commit on `main` that matches what is live in production (e.g. last promoted deploy SHA).
2. `git tag v1.0.0 <sha>` and `git push origin v1.0.0`.
3. `gh release create v1.0.0 --title v1.0.0 --notes "Production baseline before automated semver."`
4. Later promotes will release `v1.1.0` / `v1.0.1` / `v2.0.0` from squash commits (`feat` → minor, `fix` → patch, `!` / `BREAKING CHANGE` → major).

## Local development

```bash
pnpm install
pnpm db:generate
pnpm dev
```

Ports: bookings `3000`, admin `3001`, web `3002`.

Set `APP_ENV=dev` in `.env.local` (see [.env.example](./.env.example)).

## CI/CD (GitHub Actions)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`ci.yml`](./.github/workflows/ci.yml) | PRs and pushes to `main` | PR conventions + lint, typecheck, test, build (Mongo). **No Vercel.** |
| [`deploy.yml`](./.github/workflows/deploy.yml) | Push to `main`, `workflow_dispatch` | Dev **and** prod **separate** prebuilt builds per affected app; dev deploy + `promote-manifest` artifact. Queues: `db-push-dev` and per-app `deploy-dev-{web,admin,bookings}` (both `cancel-in-progress: false` so overlapping runs do not cancel a newer deploy after a slow db-push). Dev alias runs only when `origin/main` still equals the workflow commit; otherwise the Preview deploy completes but alias is skipped. Prod prebuilds are not serialized (`promote-production` queue handles prod). |
| [`promote-production.yml`](./.github/workflows/promote-production.yml) | After successful `deploy`, `workflow_dispatch` | Approved **prod** `db push` (if schema changed) + `vercel promote` of prod URLs from manifest. Queue: `promote-production` (does not block dev deploys). |

Vercel Git auto-builds are disabled (`vercel.json` → `"git": { "deploymentEnabled": false }`).

### Why two builds per app

`APP_ENV`, `NEXT_PUBLIC_*`, `robots.ts`, and middleware headers must not be baked from a single Preview build. For each affected app on `main`:

1. **Dev (Vercel Preview — no custom Vercel environments):** `vercel pull --environment=preview` → `vercel build` → `vercel deploy --prebuilt --archive=tgz` → if `origin/main` is still this commit, `vercel alias set <url> <dev-host> --scope <org>` (else skip alias so dev host is not repointed by a stale run)
2. **Prod artifact (no traffic yet):** `vercel pull --environment=production` → `vercel build --prod` → `vercel deploy --prebuilt --prod --skip-domain --archive=tgz`

After **`production`** environment approval, `promote-production.yml` runs `vercel promote <url>` (no rebuild).

**Rollback:** approving a **stale** `promote-production` run (or `workflow_dispatch` with an old `run_id`) promotes that run’s prebuilt URLs — production rolls back to that commit’s artifacts. Only approve the promote tied to the latest successful `deploy` on `main`.

CLI runs from the **repository root** (no `--cwd`). Each Vercel project’s **Root Directory** stays `apps/<app>` in the dashboard; passing `--cwd apps/<app>` doubles the path.

Non-credentialed command reference: `./scripts/vercel-deploy-dry-run.sh web dev`

### Dev URLs

| App | Dev hostname |
|-----|----------------|
| Web | `dev.cruxgroup.in` |
| Admin | `dev-admin.cruxgroup.in` |
| Bookings | `dev-bookings.cruxgroup.in` |

### Double database approval (schema changes)

When `packages/db/prisma/schema.prisma` changes on `main`:

1. **`deploy.yml` → `db-push-dev`** (`development` environment, `DATABASE_URL` = dev Atlas) runs **before** dev deploy.
2. **`promote-production.yml` → `db-push-prod`** (`production` environment, Ajay approves) runs **before** promote.

No schema change → both db-push jobs are skipped.

### First-run checklist (after variables + secrets exist)

1. Confirm repo **Variables** (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_*`), GitHub environments **`development`**, **`production-build`**, and **`production`**, squash-merge on `main`. On Vercel, Ajay configures **Preview** vs **Production** env vars separately (`APP_ENV=dev` on Preview, `APP_ENV=prod` on Production) — dev deploys target **Preview** only.
2. **One manual credentialed smoke** (proves root + Root Directory wiring; CI cannot do this for you): from repo root, `export VERCEL_ORG_ID=… VERCEL_PROJECT_ID=… VERCEL_TOKEN=…` for **web**, then `vercel pull --yes --environment=preview` and `vercel build` (do not use `--cwd`). Compare with `./scripts/vercel-deploy-dry-run.sh web dev`.
3. Run **Actions → deploy → Run workflow** on `main` with `apps=web`.
4. Confirm dev alias serves behind Vercel auth; response headers include `X-Robots-Tag` on dev; `robots.txt` disallows when `APP_ENV=dev`.
5. When `deploy` succeeds, confirm **`promote-production`** starts; approve **production** only for that run; verify `vercel promote` on the prebuilt prod URL.

---

## Manual setup (Ajay)

### GitHub

**Repository variables** (Settings → Secrets and variables → Actions → Variables). Caller jobs pass these into `_deploy-app` as inputs (`vars.*`); they are **not** available on jobs that only use `environment:` without inheriting secrets from a parent that lacks variables in scope — deploy/promote call sites pass them explicitly.

| Variable | Notes |
|----------|--------|
| `VERCEL_ORG_ID` | Vercel team id |
| `VERCEL_PROJECT_ID_WEB` / `_ADMIN` / `_BOOKINGS` | One per Vercel project |

**Environment secrets only** (never repo-level; never on PR / `ci.yml`):

| Secret | Environment | Notes |
|--------|-------------|--------|
| `VERCEL_TOKEN` | `development`, **`production-build`**, `production` | Same token; scoped per environment |
| `DATABASE_URL` | `development`, `production` | Dev vs prod Atlas |

**Environments**

| Name | Branch | Reviewer | Purpose |
|------|--------|----------|---------|
| `development` | `main` | none | Dev deploy + dev `db push` |
| **`production-build`** | `main` | none | Prod prebuild (`vercel build --prod`); holds `VERCEL_TOKEN` only |
| `production` | `main` | **Ajay** | Prod `db push` + `vercel promote` |

`promote-production` **prepare** uses `production-build` (token for Vercel API checks); promote jobs use `production` for approval; **semantic-release** runs after successful promotes.

**Repo settings:** squash merge only on `main`; branch protection requires **`ci / quality`**.

### Vercel (×3 projects)

- Root Directory: `apps/web` | `apps/admin` | `apps/bookings`
- **Preview** (dev aliases via CI): `APP_ENV=dev`, dev `DATABASE_URL`, test Razorpay, `AISENSY_TEST_ALLOWLIST` — no custom Vercel “environments”; use built-in Preview
- **Production:** `APP_ENV=prod`, live Razorpay, prod `DATABASE_URL` (Ajay maintains Preview vs Production splits in the dashboard)
- Domains: prod + dev subdomains listed above

### Atlas, GoDaddy, Google OAuth

See prior sections in this README (unchanged): `crux-dev` / `crux-prod` Atlas projects, CNAMEs for dev hosts, non-prod OAuth redirects.

---

## Environment model (`APP_ENV`)

Validated at Node startup in `instrumentation.ts` (`dev` | `prod` | `ci`):

| Value | Meaning |
|-------|---------|
| `dev` | Vercel Preview / dev aliases |
| `prod` | Vercel Production |
| `ci` | GitHub Actions CI |

- `robots.ts` is **`force-dynamic`** (reads `APP_ENV` at request time).
- `X-Robots-Tag: noindex` is set on the **edge** only: web `middleware.ts`; admin/bookings `proxy.ts` (Next.js 16 — proxy replaces middleware for auth + headers).
- Razorpay key mode is validated at startup, not per payment call.
- AiSensy: outside `prod`, sends only to `AISENSY_TEST_ALLOWLIST`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm lint` / `check-types` / `test` / `build` | Turbo pipeline |
| `./scripts/vercel-deploy-dry-run.sh <app> <dev\|prod-build\|promote>` | Print root-level CLI commands (no token) |

## Packages

See [APP_CONTEXT.md](./APP_CONTEXT.md).
