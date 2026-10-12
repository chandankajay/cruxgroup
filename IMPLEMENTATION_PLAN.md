# Sales Partner Onboarding, Geographic Coverage, and Booking Tracking

## 1. Scope and current-state findings

This plan enhances the existing `apps/admin` Sales experience so a `SALES` user can:

1. Create a Partner account and Partner profile.
2. Assign the Partner to approved geographic clusters and villages.
3. View and manage Partners created by that Sales user.
4. Track bookings attributed to that Sales user and bookings involving their Partners.
5. Trigger the existing AiSensy WhatsApp integration as part of every Partner/User creation flow.

Repository findings:

- Sales currently manages `Lead` records in `apps/admin/app/sales`.
- `convertLeadAction` can link a lead to an existing `Booking` and writes `Booking.salesPersonId`.
- Partner creation currently occurs in `apps/admin/app/onboarding/actions.ts`, but only the authenticated `PARTNER` can create their own profile.
- `Partner` currently stores a base location and radius through `baseLocation`, `baseCoordinates`, `maxRadius`, and `maxServiceRadiusKm`.
- `ServiceableArea` currently stores only unique pincode/name rows; it is not a cluster/village hierarchy.
- `Booking` already has `salesPersonId`, but `Booking.partnerId` does not currently have a Prisma relation to `Partner`.
- AiSensy primitives are in `packages/lib/src/aisensy.ts`. Existing flows use `sendWhatsAppMessage`, `sendAisensyCampaign`, and the welcome-message behavior in `apps/bookings/lib/auth.ts`.
- No cluster, village, Jedcherla, Shamshabad, CSV, XLSX, or GeoJSON dataset was found in the repository scan. The source dataset must be supplied or mounted at the import boundary defined below before production seeding.
- Existing file reads display tool-added line-number markers such as `10|`; those markers are not part of the source files.

## 2. Architectural decisions

### 2.1 Geographic schema

Do not overload `ServiceableArea` or put cluster/village data in `Json`. Use normalized MongoDB collections with explicit Prisma relations:

- `GeographicCluster`: canonical cluster code, name, active status, and optional centroid/metadata.
- `GeographicVillage`: village belonging to one cluster, canonical normalized name, optional pincode and coordinates.
- `PartnerClusterCoverage`: Partner-to-cluster assignment.
- `PartnerVillageCoverage`: Partner-to-village assignment.

Separate cluster and village join models avoid nullable compound-unique-index behavior in MongoDB. A cluster assignment means the Partner covers the cluster by default; a village assignment is used for village-specific exceptions or additions. Server-side validation must prevent assignments to inactive or unknown records.

`User` does not need a geographic field. The geographic ownership belongs to the `Partner` profile. The Sales creator is represented by `Partner.createdBySalesId`, while the login identity remains `Partner.userId`.

### 2.2 Sales ownership and booking tracking

- Add `Partner.createdBySalesId` to identify the Sales owner/creator.
- Add `Lead.partnerId` to connect a converted fleet-partner lead to its created Partner.
- Add a real `Booking.partner` relation for the existing nullable `Booking.partnerId`.
- Preserve `Booking.salesPersonId` as the booking attribution field; do not replace it with a new Sales field.
- Sales queries must scope records by the authenticated Sales user on the server. Client-side filtering is not authorization.

### 2.3 AiSensy behavior

The creation workflow must persist the User/Partner transaction first, then invoke the existing server-side AiSensy helper using the approved campaign/template configuration. No Client Component may call AiSensy.

Before implementation, product/operations must confirm the Partner welcome/onboarding campaign name and template parameters. The implementation must reuse `sendAisensyCampaign` or `sendWhatsAppMessage` from `packages/lib/src/aisensy.ts`; it must not invent a second client or webhook protocol. Notification retries must be idempotent and must not create duplicate User/Partner records.

## 3. Sequential implementation stories

### Story 0 — Confirm and normalize the cluster source dataset

**Objective**

Make the supplied cluster/village data importable without losing canonical names, codes, coordinates, pincode relationships, or active status.

**Exact files to create or modify**

Frontend:

- No frontend change.

Database/API:

- Create `packages/db/data/geographic-clusters.json` after the source dataset is provided and approved. If the supplied source is CSV/XLSX/GeoJSON, retain the original outside the runtime seed path and generate this normalized JSON.
- Create `packages/db/src/geographic-clusters.ts` with strict import types and normalization helpers.
- Modify `packages/db/prisma/seed.ts` to import the normalized dataset.
- Create `packages/db/scripts/validate-geographic-clusters.ts` for duplicate and referential-integrity checks.
- Create `packages/db/scripts/import-geographic-clusters.ts` only if the source requires a repeatable conversion step.
- Create `packages/db/data/README.md` documenting source provenance, version, coordinate order, and update procedure.

**Schema changes**

- None in this story. Establish the canonical input contract first.

**Acceptance criteria**

- Every row has a stable cluster code, cluster name, village name, and active status.
- Village names are normalized for search while preserving the display name.
- Duplicate cluster codes and duplicate villages within a cluster fail validation.
- Coordinates, if present, are validated as WGS84 latitude/longitude with latitude first and longitude second.
- The dataset explicitly covers the intended Jedcherla-to-Shamshabad geography or documents any gap.
- The seed/import command is repeatable and does not create duplicate rows.
- No AiSensy call is made by the import process.

**Dependency/blocker**

- This story cannot be finalized against production data until the actual cluster dataset is supplied. Do not infer villages from web search or from `ServiceableArea`.

---

### Story 1 — Add normalized geographic cluster and coverage schema

**Objective**

Represent approved clusters/villages and Partner assignments in MongoDB without inventing fields on `User` or using untyped JSON.

**Exact files to create or modify**

Frontend:

- No frontend change.

Database/API:

- Modify `packages/db/prisma/schema.prisma`.
- Modify `packages/db/prisma/seed.ts`.
- Create `packages/db/src/geographic-clusters.ts` if not completed in Story 0.
- Create `packages/db/src/geographic-coverage.ts` for shared types and server-side assignment validation.
- Create a repository-appropriate Prisma migration/schema deployment artifact for the MongoDB workflow used by this project.
- Modify `packages/db/src/index.ts` if new helpers need package exports.

**Schema changes**

Add the following models, adapting field names only after Story 0 confirms the source:

```prisma
model GeographicCluster {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  code        String   @unique
  name        String
  normalizedName String
  isActive    Boolean  @default(true)
  centroid    Json?
  villages    GeographicVillage[]
  partnerCoverage PartnerClusterCoverage[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive])
  @@index([normalizedName])
  @@map("geographic_clusters")
}

model GeographicVillage {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  clusterId     String   @db.ObjectId
  cluster       GeographicCluster @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  name          String
  normalizedName String
  pincode       String?
  coordinates   Json?
  isActive      Boolean  @default(true)
  partnerCoverage PartnerVillageCoverage[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([clusterId, normalizedName])
  @@index([clusterId, isActive])
  @@index([normalizedName])
  @@index([pincode])
  @@map("geographic_villages")
}

model PartnerClusterCoverage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  partnerId String   @db.ObjectId
  clusterId String   @db.ObjectId
  partner   Partner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  cluster   GeographicCluster @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  assignedByUserId String? @db.ObjectId
  assignedAt DateTime @default(now())

  @@unique([partnerId, clusterId])
  @@index([clusterId])
  @@map("partner_cluster_coverage")
}

model PartnerVillageCoverage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  partnerId String   @db.ObjectId
  villageId String   @db.ObjectId
  partner   Partner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  village   GeographicVillage @relation(fields: [villageId], references: [id], onDelete: Cascade)
  assignedByUserId String? @db.ObjectId
  assignedAt DateTime @default(now())

  @@unique([partnerId, villageId])
  @@index([villageId])
  @@map("partner_village_coverage")
}
```

Extend existing models:

- `User`: add `createdPartners Partner[] @relation("SalesCreatedPartners")`.
- `Partner`: add optional `createdBySalesId String? @db.ObjectId`, `createdBySales User? @relation("SalesCreatedPartners", fields: [createdBySalesId], references: [id])`, `clusterCoverage`, `villageCoverage`, and `bookings`.
- `Booking`: add `partner Partner? @relation(fields: [partnerId], references: [id])` and an index on `partnerId`.
- `Lead`: add optional `partnerId String? @db.ObjectId`, `partner Partner?`, and an index on `partnerId`.

Keep `ServiceableArea` unchanged unless the supplied data proves it is the canonical source. Do not migrate existing pincode rows automatically without a documented mapping.

**Acceptance criteria**

- Prisma validates the schema for the configured MongoDB provider.
- Existing User, Partner, Equipment, Booking, Lead, and ServiceableArea records remain readable.
- Seed data creates stable cluster/village IDs or upserts by canonical code/name.
- A Partner can have multiple cluster and village assignments.
- Duplicate assignments are rejected by the database and handled gracefully by the server.
- Inactive clusters/villages cannot be assigned.
- Existing radius-based eligibility continues to work.
- No User record receives a `clusterId`, `villageId`, or other geographic field.
- No AiSensy call is made by migration or seed code.

---

### Story 2 — Build secure geographic coverage queries and validation

**Objective**

Provide server-side, reusable queries for listing active clusters/villages and validating Partner assignments.

**Exact files to create or modify**

Frontend:

- No UI change.

Database/API:

- Create `packages/api/src/services/geographic-service.ts`.
- Create `packages/api/src/routers/geographic.ts`.
- Modify `packages/api/src/root.ts` to register the router.
- Modify `packages/db/src/geographic-coverage.ts` for shared validation if needed.
- Modify `apps/admin/lib/resource-authz.ts` to add Sales-aware authorization helpers, or create `apps/admin/lib/sales-resource-authz.ts` if keeping Sales authorization separate.

**API contract**

- `listClusters({ search?, includeInactive? })`
- `listVillages({ clusterId, search?, includeInactive? })`
- `getPartnerCoverage({ partnerId })`
- `validateCoverageSelection({ clusterIds, villageIds })`

Public tRPC procedures must not expose Partner coverage or mutate assignments. Prefer authenticated server actions for all Sales mutations; if tRPC mutations are used, add a real session-aware procedure rather than using `publicProcedure`.

**Acceptance criteria**

- Sales users can read only active cluster/village choices by default.
- Admins can optionally inspect inactive records.
- Unknown IDs, inactive records, cross-cluster village IDs, and malformed IDs return typed validation errors.
- Search is case-insensitive and uses normalized fields.
- Partner coverage queries return both cluster assignments and village assignments.
- Authorization is checked server-side for every Partner ID.
- No geographic endpoint triggers AiSensy.

---

### Story 3 — Implement the Sales Partner creation transaction

**Objective**

Allow an authenticated Sales representative to create a User with role `PARTNER`, create the associated Partner profile, store Sales ownership, and assign initial geographic coverage atomically.

**Exact files to create or modify**

Frontend:

- Create `apps/admin/app/sales/partners/page.tsx`.
- Create `apps/admin/app/sales/partners/new/page.tsx`.
- Create `apps/admin/app/sales/partners/features/partner-create-form.tsx`.
- Create `apps/admin/app/sales/partners/features/geographic-coverage-selector.tsx`.
- Create `apps/admin/app/sales/partners/schema.ts`.
- Reuse `@repo/ui` components from `packages/ui/src/form.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`, `button.tsx`, `card.tsx`, and existing map/form patterns. Do not create a new form system.

API/server actions:

- Create `apps/admin/app/sales/partners/actions.ts`.
- Create `apps/admin/app/sales/partners/data.ts` for server-side page queries if needed.
- Modify `apps/admin/app/sales/actions.ts` to link an originating `Lead` to the created Partner.
- Do not create a Next.js API route unless a browser-only integration proves necessary; the primary mutation should be a server action.

Database:

- Use the schema from Story 1.
- Reuse phone normalization from `apps/admin/lib/phone.ts` and existing validation conventions.

**Transaction behavior**

1. `requireSalesSession()` must pass.
2. Normalize and validate phone, company name, address, radius, and coverage IDs.
3. Reject an existing User with a conflicting role or existing Partner profile according to the product duplicate policy.
4. Create or update the User with `role: PARTNER`.
5. Create the Partner with `createdBySalesId` set to the authenticated Sales user.
6. Create cluster/village coverage rows inside the same Prisma transaction.
7. If a lead ID is supplied, verify that it belongs to the Sales user and update it with `partnerId` and `CONVERTED` status.
8. Commit the transaction before sending AiSensy.

**Acceptance criteria**

- A Sales user can create a Partner only through the authenticated server action.
- An ADMIN can view the created Partner; another SALES user cannot mutate or claim it without an explicit admin policy.
- The User and Partner are never partially created when database validation fails.
- Initial cluster/village assignments are saved atomically.
- Duplicate phone numbers, duplicate Partner profiles, duplicate coverage, invalid IDs, and inactive locations return actionable errors.
- The form uses existing React/Tailwind components and handles pending, success, validation, and failure states.
- The client never chooses `createdBySalesId`, role, or authorization scope.
- The action invokes the AiSensy workflow required by Story 4 after successful persistence.

---

### Story 4 — Add the mandatory Partner/User AiSensy onboarding notification

**Objective**

Guarantee that every Sales-created Partner/User triggers the existing server-side AiSensy WhatsApp function exactly once per successful onboarding notification attempt.

**Exact files to create or modify**

Frontend:

- Modify `apps/admin/app/sales/partners/features/partner-create-form.tsx` to display notification status returned by the server action.
- Modify `apps/admin/app/sales/partners/features/partner-detail-content.tsx` in Story 5 if a retry control is added.

API/server/integration:

- Modify `packages/lib/src/aisensy.ts` only if a named Partner onboarding wrapper is needed around the existing `sendAisensyCampaign`/`sendWhatsAppMessage`.
- Modify `packages/lib/src/index.ts` if the wrapper is exported.
- Create `apps/admin/lib/partner-onboarding-notification.ts` for the server-only orchestration and idempotency policy.
- Modify `apps/admin/app/sales/partners/actions.ts` to call the orchestration after the transaction.
- Inspect and, if appropriate, reuse `apps/bookings/lib/auth.ts` welcome-message conventions and `packages/api/src/services/aisensy-service.ts` compatibility exports.
- Add or update environment-variable documentation in `apps/admin/.env.example` or the repository's existing environment documentation location.

**Schema changes**

Use existing `User.welcomeNoteSentAt` only if product confirms it represents the Partner onboarding campaign. Otherwise add explicit notification state to `Partner`, preferably:

- `partnerWelcomeSentAt DateTime?`
- `partnerWelcomeLastAttemptAt DateTime?`
- `partnerWelcomeFailureReason String?`

Do not reuse a generic timestamp with different semantics without documenting the behavior.

**AiSensy acceptance criteria**

- The implementation uses `sendAisensyCampaign` or `sendWhatsAppMessage` from `packages/lib/src/aisensy.ts`.
- It does not call AiSensy from a Client Component.
- It normalizes the destination using the existing helper.
- The approved campaign/template name and parameter order are documented and tested.
- A successful database transaction followed by a successful AiSensy call records sent state.
- Missing `AISENSY_API_KEY` follows the repository's existing development behavior and is visible in logs without leaking secrets.
- A failed AiSensy call does not create a second User/Partner on retry.
- Duplicate form submissions do not send duplicate onboarding messages when sent state already exists.
- Logs mask phone numbers and never expose API keys, OTPs, or complete payloads.
- The UI clearly distinguishes “Partner saved, WhatsApp pending/failed” from “Partner and WhatsApp completed.”

---

### Story 5 — Build the Sales Partner list and detail pages

**Objective**

Give Sales users a durable view of the Partners they created, their coverage, onboarding state, and equipment summary.

**Exact files to create or modify**

Frontend:

- Create `apps/admin/app/sales/partners/features/partners-page-content.tsx`.
- Create `apps/admin/app/sales/partners/[id]/page.tsx`.
- Create `apps/admin/app/sales/partners/[id]/features/partner-detail-content.tsx`.
- Create `apps/admin/app/sales/partners/[id]/features/partner-coverage-panel.tsx`.
- Modify `apps/admin/app/components/admin-sidebar.tsx` or the existing Sales navigation component to add Sales Partner routes.
- Reuse `@repo/ui` table, badge, card, input, select, button, and toast patterns.

API/server:

- Add `fetchMyPartners`, `fetchSalesPartnerDetail`, and `updatePartnerCoverageAction` to `apps/admin/app/sales/partners/actions.ts`.
- Add read/update methods to `packages/api/src/services/partner-service.ts` only if the existing service layer is the chosen shared path.
- Do not use the current public `partnerRouter` mutations for Sales writes without adding session authorization; the current `publicProcedure` is not sufficient for this feature.

**Acceptance criteria**

- A Sales user sees only Partners they created or are explicitly authorized to manage.
- Detail pages show User contact, Partner status, KYC status, base location/radius, cluster assignments, village assignments, and equipment count.
- Coverage edits validate active records server-side and replace assignments atomically.
- Existing admin Partner pages continue to work.
- Empty, loading, stale, unauthorized, and not-found states are handled.
- No AiSensy notification is sent for a read-only page load or a coverage-only edit.
- If the feature includes “resend onboarding WhatsApp,” it uses the Story 4 idempotent server-only workflow.

---

### Story 6 — Add booking tracking for Sales-owned Partners and attributed bookings

**Objective**

Let Sales reps track bookings tied to their own Sales attribution and Partners they created, without exposing unrelated bookings.

**Exact files to create or modify**

Frontend:

- Create `apps/admin/app/sales/bookings/page.tsx`.
- Create `apps/admin/app/sales/bookings/features/sales-bookings-page-content.tsx`.
- Reuse `apps/admin/app/bookings/features/bookings-table.tsx` and `apps/admin/app/bookings/features/site-detail-modal.tsx` where compatible.
- Modify `apps/admin/app/sales/features/sales-performance-content.tsx` to add booking counts and links.
- Modify `apps/admin/app/components/admin-sidebar.tsx` or the existing Sales navigation component.

API/server:

- Add `fetchMyBookings` and `fetchMyBookingStats` to `apps/admin/app/sales/actions.ts`, or create `apps/admin/app/sales/bookings/actions.ts` if separation is clearer.
- Modify `packages/api/src/services/booking-service.ts` only if a shared query is needed; otherwise query Prisma in the authenticated Sales server action.
- Modify `apps/admin/app/bookings/actions.ts` only if shared booking row types need to include Partner/cluster data.
- Add server-side filters for `salesPersonId = session.userId` and/or `equipment.partner.createdBySalesId = session.userId`, with an explicit product rule for whether both sets are shown.

**Schema changes**

- Use existing `Booking.salesPersonId` and its index.
- Use the new `Booking.partner` relation and index from Story 1.
- Do not duplicate Sales ownership onto every booking if it can be resolved safely through existing relations.

**Acceptance criteria**

- Sales can see bookings attributed to them.
- Sales can see bookings for Partners they created if the approved product policy includes that view.
- Other Sales users' bookings and Partners are not exposed by changing client query parameters.
- Filters for status, date range, Partner, cluster, and village are applied server-side.
- Booking rows show customer, Partner, equipment, site, status, created date, and Sales attribution.
- Existing Admin and Partner booking views remain unchanged.
- Booking tracking does not trigger AiSensy; existing booking notification behavior remains owned by the booking workflow.

---

### Story 7 — Connect lead conversion to Partner creation

**Objective**

Make the existing Sales lead pipeline the entry point for Partner onboarding without losing lead history or booking attribution.

**Exact files to create or modify**

Frontend:

- Modify `apps/admin/app/sales/features/lead-detail-content.tsx`.
- Modify `apps/admin/app/sales/features/leads-page-content.tsx` if the list needs Partner/conversion indicators.
- Add a link from a converted lead to `apps/admin/app/sales/partners/[id]`.

API/server:

- Modify `apps/admin/app/sales/actions.ts`.
- Reuse `convertLeadAction` but extend it to accept a Partner ID only after verifying the Partner belongs to the current Sales user or the current operation created it.
- Add a dedicated `createPartnerFromLeadAction` in `apps/admin/app/sales/partners/actions.ts` if the operation must create the Partner and update the Lead in one transaction.

**Schema changes**

- Use `Lead.partnerId` from Story 1.
- Preserve `Lead.bookingId`; a lead may have both a created Partner and an attributed booking.

**Acceptance criteria**

- A `FLEET_PARTNER` lead can create exactly one Partner profile.
- The Lead remains searchable with status `CONVERTED`, linked Partner ID, and existing notes.
- Repeating conversion returns the existing Partner rather than creating a duplicate User/Partner.
- If the lead flow creates the Partner, the transaction includes coverage assignment and Sales ownership.
- The same AiSensy checks from Story 4 pass for this alternate creation entry point.
- Customer leads continue to use the existing booking conversion flow.

---

### Story 8 — Integrate cluster-aware booking eligibility without breaking radius rules

**Objective**

Use geographic coverage as an additional eligibility signal while retaining the current Partner base-radius behavior.

**Exact files to create or modify**

Frontend:

- Modify `apps/admin/app/partners/features/service-area-map.tsx` only if displaying assigned cluster/village overlays or labels is approved.
- Modify `apps/admin/app/sales/partners/[id]/features/partner-coverage-panel.tsx`.
- Modify booking site/location selectors only after the server contract is defined; likely files include `apps/bookings/app/components/booking/site-address-picker-google.tsx` and the relevant booking drawer.

API/server:

- Modify `packages/api/src/services/partner-geo.ts`.
- Modify `packages/api/src/services/booking-service.ts`.
- Modify `packages/lib/src/partner-booking-notification.ts` if eligible-partner filtering must include cluster/village coverage.
- Create `packages/db/src/geographic-matching.ts` for shared point-to-village/cluster matching if the dataset provides boundaries or centroids.

**Schema/data requirements**

- If the cluster dataset contains polygons, define the approved representation and query/index strategy before implementation.
- If it contains only names/pincodes/centroids, document that matching is a deterministic pincode or nearest-centroid rule and is not a boundary query.
- Never silently treat a village name string as a geographic match.

**Acceptance criteria**

- Existing radius checks continue to reject sites outside a Partner's configured range.
- Cluster/village checks are deterministic and documented.
- Coverage rules do not expose inactive or unauthorized locations.
- Partner notifications are sent only to eligible Partners under the combined rules.
- Existing booking creation, transport-fee calculation, and Partner notification tests continue to pass.
- No AiSensy onboarding message is sent by matching or booking eligibility code.

---

### Story 9 — Reporting, observability, and operational recovery

**Objective**

Make the Sales epic supportable in production with metrics, auditability, and recovery paths.

**Exact files to create or modify**

Frontend:

- Modify `apps/admin/app/sales/features/sales-performance-content.tsx`.
- Modify `apps/admin/app/sales/partners/[id]/features/partner-detail-content.tsx`.
- Create `apps/admin/app/sales/partners/features/partner-onboarding-status.tsx` if notification status is displayed in more than one place.

API/server:

- Modify `apps/admin/app/sales/actions.ts`.
- Modify `apps/admin/app/sales/partners/actions.ts`.
- Modify `apps/admin/lib/partner-onboarding-notification.ts`.
- Add structured logging using the repository's existing logging convention.

Database:

- Add notification audit fields/model only if Story 4 determines `User.welcomeNoteSentAt` is insufficient.
- Add indexes for the final Sales queries after measuring query plans; do not add speculative indexes.

**Acceptance criteria**

- Sales dashboard reports created Partners, active coverage, booking count, confirmed/completed bookings, and failed onboarding notifications.
- An authorized user can retry a failed AiSensy onboarding notification without creating a duplicate Partner.
- Retry behavior is idempotent and auditable.
- Logs include correlation identifiers and masked phone numbers.
- Unauthorized access, duplicate creation, invalid geographic assignment, and AiSensy failure are observable in tests/logs.

---

### Story 10 — Test, migrate, and release safely

**Objective**

Release the feature without corrupting existing Partner, User, Lead, Booking, or ServiceableArea data.

**Exact files to create or modify**

Tests:

- Create `packages/db/src/__tests__/geographic-coverage.test.ts`.
- Create `packages/api/src/services/__tests__/geographic-service.test.ts`.
- Create `apps/admin/app/sales/partners/__tests__/actions.test.ts`.
- Create `apps/admin/app/sales/__tests__/sales-bookings.test.ts`.
- Create or extend `packages/lib/src/__tests__/aisensy.test.ts`.
- Add Playwright/browser tests under the repository's existing test directory if one exists; otherwise document the chosen location.

Documentation/operations:

- Create or modify `packages/db/data/README.md`.
- Create or modify `apps/admin/.env.example`.
- Create `SALES_PARTNER_ONBOARDING_RUNBOOK.md` at the repository root if operations needs a deployment/runbook document.

**Acceptance criteria**

- TypeScript, lint, formatting, Prisma validation, unit tests, and integration tests pass.
- A Sales user can create a Partner, assign valid coverage, receive the approved AiSensy trigger, and see the Partner in their list.
- Invalid cluster/village IDs and inactive records are rejected.
- Another Sales user cannot access or mutate the Partner through direct URL/action calls.
- Duplicate phone and duplicate submission cases are safe.
- AiSensy success, missing credentials, timeout, and failure paths are tested without logging secrets.
- Lead conversion remains backward compatible.
- Existing Admin Partner, Partner onboarding, booking, radius, and notification flows pass regression tests.
- Deployment order is documented:
  1. Deploy schema-compatible code.
  2. Import/seed geographic data.
  3. Verify counts and duplicate checks.
  4. Enable Sales routes.
  5. Enable the approved AiSensy campaign configuration.
  6. Run a controlled end-to-end onboarding test.

## 4. Required product decisions before development starts

1. Provide the authoritative cluster/village dataset and its source/provenance.
2. Confirm whether Partner coverage is cluster-wide, village-specific, or both.
3. Confirm whether Sales can view all bookings for created Partners or only bookings attributed through `Booking.salesPersonId`.
4. Confirm whether one phone number may be converted from an existing `USER` into `PARTNER`, or whether the flow must reject it.
5. Confirm the exact AiSensy campaign name, template parameters, and whether the Partner onboarding message is distinct from the existing generic welcome message.
6. Decide whether AiSensy failure should return “saved but notification failed” or fail the UI operation while retaining the persisted Partner.
7. Confirm whether cluster matching uses pincode, village identity, centroids, or polygon boundaries.
8. Confirm whether Sales may edit coverage after creation or only assign it during onboarding.

## 5. Recommended implementation order

Implement in this order:

1. Story 0 — dataset contract and validation.
2. Story 1 — Prisma/MongoDB schema and seed.
3. Story 2 — secure geographic queries.
4. Story 3 — Sales Partner creation transaction.
5. Story 4 — mandatory AiSensy onboarding notification.
6. Story 5 — Partner list/detail UI.
7. Story 6 — Sales booking tracking.
8. Story 7 — lead conversion integration.
9. Story 8 — cluster-aware booking eligibility.
10. Story 9 — reporting and recovery.
11. Story 10 — regression testing and release.

