# CWA-54: Services area distances & review-gated publishing

## Schema (`ServicesArea`)

- `roadKmFromBase`: `Float` → optional `Float?`
- `roadKmFromBaseSource`: new optional `String?` (e.g. `osrm:driving:2026-10-19`, `manual:survey:ajay`)

## Apply (dev / staging)

```bash
pnpm --filter @repo/db db:push
pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
```

`seed-services-seo.ts` refuses `APP_ENV=prod` and production-looking `DATABASE_URL` values.

## Backfill

1. Run `db:push` so nullable road fields exist.
2. Run the seed on **dev** only — it recomputes `straightLineKmFromBase` from the C1 Fathimapur hub and clears bogus village-derived road km (leaves `roadKmFromBase` null unless `MEASURED_ROAD_KM_FROM_C1` has an entry).
3. Existing `ServiceAreaPage` rows are **not** forced to `published: true`. Only the three launch area slugs get a `farmhouse-construction` page stub (`published: false`, `thinContent: true`) if missing.
4. Publishing: set `lastReviewed`, fix `thinContent`, then `published: true` via admin CMS after CWA-29 copy is ready.

## Rollback

1. **Prefer fix-forward** — redeploy previous app only if you must; Mongo keeps extra fields (`roadKmFromBaseSource`) harmlessly.
2. To revert app behaviour without deleting data: redeploy pre-CWA-54 web/admin; old code treated `roadKmFromBase` as required — only rollback app if you also backfill a numeric road km or ship a hotfix that tolerates null.
3. **Schema downgrade** (avoid on prod): making `roadKmFromBase` required again needs a data pass to set a number or delete rows with null road km before `db push` with the old schema.

## Verify

- `pnpm --filter @repo/lib test` (C1=0, C2≈16.1, C5≈13.6 straight-line)
- Spoke page shows straight-line km; road km only when `roadKmFromBase` + source are set.
