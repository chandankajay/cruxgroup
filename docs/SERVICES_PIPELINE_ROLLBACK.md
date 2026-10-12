# Services pipeline DB rollback (PR #24 / CWA-39)

Use this when reverting the services lead pipeline schema before the web stack (PR #25) is deployed.

## Why rollback is fragile

1. **`LeadType.SERVICE` enum value** — Older deployed apps run a Prisma client generated without `SERVICE`. After `db push`, MongoDB documents may use `leadType: "SERVICE"` while old servers still run old clients → runtime errors on read/filter.
2. **Optional `salesPersonId`** — Making the field optional changes generated types (`string` → `string | null`). Old admin builds that assume non-null can fail TypeScript or throw at runtime when assigning leads.
3. **`onDelete: SetNull` on `Lead.salesPerson`** — Previously `Cascade` (if that was the live shape). Rollback to `Cascade` **deletes or blocks** depending on migration path; `SetNull` leaves leads with `salesPersonId: null`. Reverting the relation rule without a data pass can orphan or delete rows.

## Safe rollback order

1. **Freeze writes** — Disable service lead board actions in admin (deploy previous admin build or feature flag) so no new `SERVICE` leads are created during rollback.
2. **Deploy application code first (downgrade)** — Ship admin/web builds from **before** PR #24/#25 that do not reference `SERVICE`, `serviceStage`, or optional `salesPersonId` in queries. Until this is live, do not remove columns/enums from the database.
3. **Data audit (plan only in staging; execute in prod with backup)**  
   - Export leads where `leadType = SERVICE`.  
   - Decide: archive to JSON, re-label to `CUSTOMER`, or delete (business decision).  
   - Clear `serviceStage` / `serviceSlug` fields if downgrading code that does not understand them.
4. **Schema downgrade** — After old code is serving traffic, run a controlled `prisma db push` (or manual Mongo updates) to remove fields/enums **only if** no remaining documents use them. Regenerate Prisma client on the old app version.
5. **Verify** — Booking/equipment leads still load; admin sales board works; no Prisma errors in logs.

## Forward-only alternative

If production already has `SERVICE` leads, prefer **fix-forward** (complete PR #25, deploy web + admin together) instead of schema rollback.

## Related

- Rate limit counters (`RateLimitCounter`) ship with PR #25 — do not deploy `packages/db/rate-limit` usage until that model exists in the target database.
