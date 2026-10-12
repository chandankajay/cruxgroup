# Services pipeline DB rollback (PR #24 / CWA-39)

**Prefer fix-forward:** If production already has `SERVICE` leads or the new admin/web stack is partially deployed, complete PR #25 and deploy **web + admin together** instead of rolling schema back.

Use the steps below only when you must run **older application code** against a database that already received the PR #24 schema changes.

## Why rollback is fragile

1. **`LeadType.SERVICE` enum value** — Older deployed apps use a Prisma client generated without `SERVICE`. After `db push`, MongoDB documents may use `leadType: "SERVICE"` while old servers still run old clients → runtime errors on read/filter.
2. **Optional `salesPersonId`** — Making the field optional changes generated types (`string` → `string | null`). Old admin builds that assume non-null can fail at compile time or runtime.
3. **`onDelete: SetNull` on `Lead.salesPerson`** — Reverting to `Cascade` without a data pass can delete or block rows; `SetNull` leaves leads with `salesPersonId: null`.
4. **Mongo + `prisma db push`** — Push adds fields and enum values; it does **not** remove fields or enum values from existing documents. “Schema downgrade” requires a deliberate data migration or manual Mongo updates, not push alone.

## Safe rollback order

1. **Freeze writes** — Disable service lead board actions and the public quote path (deploy previous admin/web build or feature flag) so no new `SERVICE` leads are created during rollback.
2. **Back up** — Export `Lead`, `LeadActivity`, and related collections (or full DB snapshot) before mutating data.
3. **Move `SERVICE` leads out** — For each lead with `leadType = SERVICE`:
   - Re-label to `CUSTOMER` / `FLEET_PARTNER`, archive to JSON, or delete (business decision).
   - Clear `serviceStage`, `serviceSlug`, and other service-only fields if downgrading code that does not understand them.
   - **Leads with no salesperson:** assign `salesPersonId` to a valid `User` with `role: SALES`, or delete/archive the lead — old code may not tolerate null assignees.
4. **Deploy old application code** — Ship admin/web builds from **before** PR #24/#25 that do not query `SERVICE`, `serviceStage`, or optional `salesPersonId`. Do not rely on schema “removal” via `db push`.
5. **Verify** — Booking/equipment leads still load; legacy sales board works; no Prisma errors in logs.

## Related

- Rate limit counters (`RateLimitCounter`) ship with PR #25 — do not deploy `packages/db/rate-limit` usage until that model exists in the target database.
