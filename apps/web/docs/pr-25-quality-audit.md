# PR #25 — Playwright axe & Lighthouse

**Run date:** 2026-10-12 (cloud agent, round 3)

## Preview target

Latest GitHub deployment status for **Preview – cruxgroup-web** (deployment `7013910130`):

`https://cruxgroup-navmla5l8-ajay-chandans-projects.vercel.app`

(Branch ref at deploy time: `30ac2b3`; newer green deploy `4TTs3V43KZAZTiSLnBqxyKWK1oht` on PR #25 — same Vercel project, likely same protection.)

## Blocker: Vercel deployment protection

Unauthenticated `curl` and Playwright against the preview URL receive **HTTP 302 → `vercel.com/login`** (Vercel SSO/deployment protection). The agent has **no Vercel bypass token** or team login, so:

- **axe** — not executed against live preview HTML.
- **Lighthouse** — not executed against live preview HTML.
- **quote-submit e2e** — not executed against preview (requires `PLAYWRIGHT_BASE_URL` + reachable app + `DATABASE_URL` on Vercel).

### What would unblock

1. Temporarily disable deployment protection for preview, **or**
2. Provide `VERCEL_AUTOMATION_BYPASS_SECRET` / protection bypass for CI, **or**
3. Run locally with `PLAYWRIGHT_BASE_URL` after protection is off.

## Commands (when preview is reachable)

```bash
export PLAYWRIGHT_BASE_URL="https://<cruxgroup-web-preview>.vercel.app"
pnpm --filter @crux/web exec playwright test
PLAYWRIGHT_BASE_URL="$PLAYWRIGHT_BASE_URL" pnpm --filter @crux/web audit:lighthouse
```

## Local / CI (no `PLAYWRIGHT_E2E` in app code)

- `playwright.config.ts` **does not** start `webServer` when `PLAYWRIGHT_BASE_URL` is set.
- Local `webServer` uses `DATABASE_URL` (Mongo required for layout `SiteConfig` and quote persistence).
- `e2e/support.ts` skips suites if `/en/services/request-quote` returns 5xx.
- **quote-submit** runs only when `PLAYWRIGHT_BASE_URL` is set (intended: Vercel preview with DB).

## Monorepo CI (agent, same day)

`pnpm turbo run lint check-types test build` — green before push (no extra Vercel deploy triggered).
