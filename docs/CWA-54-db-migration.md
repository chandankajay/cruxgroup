# CWA-54: Services area distances & review-gated publishing

## Schema (`ServicesArea`)

- `roadKmFromBase`: `Float` → optional `Float?`
- `roadKmFromBaseSource`: new optional `String?` (e.g. `osrm:driving:2026-10-19`, `manual:survey:ajay`)

## Apply (dev / staging)

```bash
pnpm --filter @repo/db db:push
APP_ENV=dev SEED_ALLOWED_DB=crux_dev DATABASE_URL='mongodb://127.0.0.1:27017/crux_dev' \
  pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
```

Seed guard (refuse by default):

- `APP_ENV` must be **`dev`** or **`ci`** (unset → abort).
- `SEED_ALLOWED_DB` must match the database name parsed from `DATABASE_URL`.
- Database name **`crux_prod`** is always refused.

## Backfill

1. Run `db:push` so nullable road fields exist.
2. Run the seed on **dev** only — every `ServicesArea` **update** sets `roadKmFromBase` and `roadKmFromBaseSource` to measured values or **`null`** (clears bogus 7 km from PR #25).
3. `ServiceAreaPage`: seed sets `published: false` on all rows that are **not** a first-release pair (`farmhouse-construction` × `fatimapur-kothur` | `shadnagar` | `shamshabad`), including legacy C1 × six-service rows from #25.
4. Publishing: admin CMS sets `lastReviewed` when publishing (counts as review); `thinContent` must be false before publish.
5. Re-running the seed does **not** unpublish reviewed first-release pages. To reset fake #25 review state once:

```bash
SEED_RESET_FIRST_RELEASE_REVIEW=1 APP_ENV=dev SEED_ALLOWED_DB=crux_dev DATABASE_URL='...' \
  pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
# or: ... exec tsx scripts/seed-services-seo.ts --reset-first-release-review
```

This sets `published: false`, `thinContent: true`, and `lastReviewed: null` on the three `farmhouse-construction` launch area pages only.

### One-off (if seed not run yet)

```javascript
// Mongo / Prisma: unpublish every ServiceAreaPage outside the first-release allow-list
db.service_area_pages.updateMany(
  {
    $nor: [
      { serviceSlug: "farmhouse-construction", areaSlug: "fatimapur-kothur" },
      { serviceSlug: "farmhouse-construction", areaSlug: "shadnagar" },
      { serviceSlug: "farmhouse-construction", areaSlug: "shamshabad" },
    ],
  },
  { $set: { published: false } },
);
```

## Rollback

1. **Prefer fix-forward** — redeploy previous app only if you must; Mongo keeps extra fields (`roadKmFromBaseSource`) harmlessly.
2. To revert app behaviour without deleting data: redeploy pre-CWA-54 web/admin; old code treated `roadKmFromBase` as required — only rollback app if you also backfill a numeric road km or ship a hotfix that tolerates null.
3. **Schema downgrade** (avoid on prod): making `roadKmFromBase` required again needs a data pass to set a number or delete rows with null road km before `db push` with the old schema.

## Verify

- `pnpm --filter @repo/lib test` (distances + publish gate)
- `pnpm --filter @repo/db test` (seed guard)
- Spoke page shows straight-line km; road km only when `roadKmFromBase` + source are set.
