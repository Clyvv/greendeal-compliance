# Stage 7.1 Review — Current State Before Post-Stage-7 Extension

Review-only pass. No code was changed. This documents what exists today
(Stages 0–7) and where the AGENTS.md §10a / DOMAIN.md §8a extensions
(external suppliers, public request links, data provenance) will attach.

---

## 1. Existing pages/routes

Root: `app/layout.tsx` wraps everything in `ToastProvider` + `AppShell`.
`app/page.tsx` redirects `/` → `/supplier/dashboard`. No other layout
files exist — both role sections share the one root layout, with
role-aware nav resolved from the URL path (`lib/nav-config.ts`).

### Supplier

| Route | Purpose | Key service calls |
|---|---|---|
| `/supplier/dashboard` | Metrics + recently updated products | `getSupplierProducts`, `getProductEvidence` |
| `/supplier/products` | Table of all supplier products | `getSupplierProducts`, `getProductVersions` |
| `/supplier/products/new` | 7-step create-product wizard | `ProductWizard` component → wizard actions |
| `/supplier/products/[productId]` | Product detail (version + evidence tabs) | `getSupplierProduct`, `getProductVersion(s)`, `getProductEvidence` |
| `/supplier/evidence` | **Placeholder** (empty state, no data) | none |
| `/supplier/data-requests` | Inbox of incoming requests | `getDataRequests`, `getOrganization`, `getSupplierProduct`, `getPackagingItem` |
| `/supplier/data-requests/[id]` | Review + approve/reject one request | `getDataRequest`, `getAuthorizedData`, `getOrganization`, `getSupplierProduct`, `getPackagingComponentsByProduct`, `getPackagingItem` |

### Manufacturer

| Route | Purpose | Key service calls |
|---|---|---|
| `/manufacturer/dashboard` | Metrics + placeholder tiles | `getPackagingItems`, `getPackagingComponents` |
| `/manufacturer/packaging-items` | Table of packaging items | `getPackagingItems`, `getPackagingComponents` |
| `/manufacturer/packaging-items/new` | Create packaging item (name/SKU/market/type only) | server action `createPackagingItemAction` |
| `/manufacturer/packaging-items/[id]` | Detail: readiness panel, component cards, assessment history | `getPackagingItem`, `getPackagingComponents`, `getProductEvidence/Version`, `getSupplierProduct`, `getOrganization`, `getAuthorizedData`, `getDataRequests`, `getAssessmentHistory` + `computeComponentReadiness`/`summarizeReadiness` |
| `/manufacturer/packaging-items/[id]/request/[componentId]` | Field-level data-request wizard for one component | `getPackagingComponent/Item`, `getProductEvidence/Version`, `getSupplierProduct`, `getOrganization` |
| `/manufacturer/data-requests` | Outbox of sent requests | `getDataRequests`, `getOrganization`, `getSupplierProduct`, `getPackagingItem` |
| `/manufacturer/data-requests/[id]` | Read-only view of a sent request | `getDataRequest`, `getAuthorizedData`, etc. |
| `/manufacturer/assessments` | All assessments across all items | `getPackagingItems`, `getAssessmentHistory` |
| `/manufacturer/assessments/[id]` | Single assessment results | `getAssessment`, `getPackagingItem` |
| `/manufacturer/documents` | **Placeholder** (empty state, no data) | none |

Notable: every data-backed page uses `export const dynamic = "force-dynamic"`;
request detail pages enforce org ownership (`notFound()` on mismatch);
provenance chain (Component → Supplier Product → Version → Org) is
already surfaced on packaging item detail + request flow pages.

**No route exists yet for:** adding a component to a packaging item,
external suppliers, public request links, settings, or a supplier
directory/"Suppliers" nav item.

---

## 2. Existing components

### UI primitives (`components/ui/`) — all present, match AGENTS.md §4 exactly

`Badge` (generic tone tag) · `Button` (variant/size) · `Card` (+Header/Title/Description/Content/Footer) ·
`Checkbox` · `Dialog` (portal modal) · `EmptyState` · `ErrorState` · `Input` ·
`Label` · `LoadingState` · `Select` · `StatusPill` (the fixed 7-icon set: ✓ ⚠ ⏳ ✕ 🔒 ○ ⌛ —
icons/labels match AGENTS.md §4 verbatim) · `Table` (+Header/Body/Row/Head/Cell) ·
`Tabs` · `Textarea` · `Toast`.

### Feature components

- **layout/**: `AppShell`, `Header` (branding + RoleSwitcher), `Sidebar` (role-aware nav), `RoleSwitcher`.
- **products/**: `ProductWizard` (7-step state machine), `ProductDetailsView` (tabs shell),
  `WizardStepIndicator`; `wizard-steps/step-1..7-*` (one per DOMAIN.md field section);
  `detail-sections/identification|physical|circularity|chemical-safety|specialized-domain|evidence|version-history-section` + shared `detail-field.tsx` helpers.
- **packaging/**: `PackagingComponentCard` (role/source/authorization/data-availability + action buttons),
  `PackagingReadinessPanel` (per-component readiness rows + overall % + gate for Run Assessment).
- **requests/**: `DataRequestFlow` (manufacturer create request, 2-step),
  `DataRequestApprovalFlow` (supplier approve/reject, per-field checkboxes),
  `DataRequestManufacturerView` (read-only mirror for requester).
- **assessments/**: `AssessmentResultsView`, `AssessmentHistoryTable`, `RunAssessmentButton`
  (scripted "Processing…" narration before redirect).
- **providers/**: `ToastProvider` + `useToast()`.

No gaps against the Stage 0 primitive spec. Feature components are cleanly
scoped per stage and reused correctly (e.g. `StatusPill` used everywhere
instead of ad hoc badges).

---

## 3. Existing data model vs DOMAIN.md

**Result: zero field-level drift.** Every type currently implemented in
`lib/types/*.ts` (16 types across `organization.ts`, `field-status.ts`,
`product.ts`, `evidence.ts`, `packaging.ts`, `data-request.ts`,
`data-approval.ts`, `assessment.ts`, barrelled through `index.ts`) matches
DOMAIN.md §3 exactly — same field names, order, optionality, and literal
union values. A few unions are extracted into named aliases
(`OrganizationType`, `PackagingComponentAuthorizationStatus`,
`PackagingComponentDataAvailability`) — additive, not drift.

**Types in DOMAIN.md §3 that do not exist in code at all:**
- `ProductionBatch` — not implemented anywhere.
- `ComplianceCalculation` — not implemented (no calculation breakdown UI/data yet — the "provenance + math" part of AGENTS.md's workflow description is not yet built).
- `ComplianceDocument` — not implemented (matches the empty `/manufacturer/documents` placeholder page and stub `mockDocumentService`).

**Not yet present (expected — belongs to §8a, not §3):** `DataRequest.origin`,
`ExternalSupplierProduct`, `DataProvenance`, `RequestResponse`,
`RequestOrigin`, `DataSourceType`, `VerificationStatus`.

**Minor doc self-inconsistency (not code drift):** DOMAIN.md §2's informal
Evidence sketch uses `productVersion: string`; the canonical §3 TS spec
(which the code follows) uses `productVersionId: string` + `id`. Code is
correct; just flagging the doc discrepancy for future editors of DOMAIN.md.

---

## 4. Existing services vs API_CONTRACT.md

| Service | Implemented | Documented-but-missing | Undocumented (in code, not in contract) |
|---|---|---|---|
| `mockProductService` | getSupplierProducts, getSupplierProduct, getProductVersions, getProductVersion, getProductEvidence, createSupplierProduct, publishProduct | updateProductDraft, createProductVersion, addEvidence | — |
| `mockPackagingService` | getPackagingItems, getPackagingItem, getPackagingComponents, createPackagingItem, updateComponentAuthorizationStatus | **addPackagingComponent**, replaceComponentProduct, getPackagingReadiness | getPackagingComponent, getPackagingComponentsByProduct, updateComponentAuthorizationStatus |
| `mockRequestService` | getDataRequests, getDataRequest, createDataRequest, approveDataRequest, rejectDataRequest, getAuthorizedData | — | — |
| `mockAssessmentService` | runAssessment, getAssessment, getAssessmentHistory | getCalculation, getImpactAnalysis, recalculateAssessment | — |
| `mockDocumentService` | *(stub only, `export {}`)* | generateDocument, getDocument, downloadDocument | — |
| `mockOrganizationService` | getOrganizations, getOrganization | — | **entire service undocumented in API_CONTRACT.md** |

Behavioral notes:
- `createSupplierProduct` bundles product + v1.0 version + evidence creation in one call (documented in code as deliberate wizard-UX shortcut; the three finer-grained contract endpoints remain unimplemented).
- `createDataRequest` always produces `PENDING`, never `DRAFT` — `DRAFT` is a defined enum value with no code path that produces it.
- `rejectDataRequest(reason?)` accepts but drops `reason` (no field to store it in `DataRequest`/`DataApproval`).
- `runAssessment` correctly simulates the `PROCESSING` → `COMPLETE`/`REQUIRES_REVIEW` transition via delay, matching the contract's note; `FAILED` is unreachable (no simulated failure path).
- `getPackagingReadiness` is not exposed as a service call — equivalent logic lives as a plain sync utility (`lib/readiness.ts`) invoked internally, not the standalone endpoint the contract implies.
- All Post-Stage-7 services (`mockExternalSupplierService`, `mockPublicRequestService`, `mockProvenanceService`, and the `mockRequestService` extensions) documented in API_CONTRACT.md have **no files yet** — greenfield.

---

## 5. Existing workflows end-to-end — what currently works

Confirmed working, in order:
1. **Supplier product creation/publishing** — 7-step wizard → draft or
   publish (gated on completeness threshold). Full CRUD read paths work;
   `updateProductDraft`/new version/evidence-only endpoints are not
   separately implemented (bundled into creation).
2. **Manufacturer packaging item creation** — works, but **only creates
   the shell** (name/SKU/market/type). **There is no UI/service path to
   add a component to an item after creation** — `addPackagingComponent`
   is unimplemented. New items are created with `componentIds: []`
   permanently in this prototype; only the seeded Coca-Cola item has
   components.
3. **Selective data request flow** — works: manufacturer picks a
   component, requests specific field-sections + evidence docs via
   `DataRequestFlow`, `createDataRequest` fires, component flips to
   `PENDING` via `updateComponentAuthorizationStatus`.
4. **Supplier approval (incl. partial-field approval)** — works: the
   approval UI defaults all fields checked but supports unchecking a
   subset before approving; `approveDataRequest` correctly filters to
   only fields that were actually requested.
5. **Readiness view** — works: `lib/readiness.ts` computes per-component
   status (COMPLETE/PARTIAL/NOT_READY) from real authorization state
   against `REQUIRED_PPWR_FIELDS` (Circularity + Chemical Safety fields)
   + an Evidence requirement; `summarizeReadiness` rolls this up.
6. **PPWR assessment simulation** — works: `runAssessment` computes 6
   section findings (Material Composition, Recycled Content,
   Recyclability, Chemical Safety, Required Evidence, Data Completeness)
   from real authorized data (not hardcoded), with explicitly
   illustrative thresholds (e.g. 30% min recycled content — commented as
   demo-only, not legal). Overall result: FAIL→NON_COMPLIANT,
   MISSING/WARNING→INCOMPLETE ("Requires Review" label), else COMPLIANT.

### Seeded Coca-Cola 500ml packaging item — current state

- Components: **Bottle** (PET Bottle 500ml v1.0, PET Solutions GmbH),
  **Label** (Coca-Cola Label 500ml v1.0, LabelTech GmbH), **Cap** (PP Cap
  28mm v1.0, PolyCap GmbH).
- **All three components: `authorizationStatus: "AUTHORIZED"`,
  `dataAvailability: "COMPLETE"`.**
- 3 seeded `DataRequest`s (dr-1/2/3), all **`status: "APPROVED"`**, all
  dated 2026-08-12.
- 3 seeded `DataApproval`s — **approvedAttributes === requestedAttributes
  exactly for all three (no partial-approval scenario is seeded)**,
  decided 2026-08-14.
- **`assessments` mock array is empty — zero seeded assessments.** No
  `PPWR-xxxx` id exists at rest. The first assessment is only created
  when a user clicks "Run PPWR Assessment" in the running app; history
  accumulates in-session (never overwritten), not persisted across
  restarts.
- Given full authorization, readiness would compute 100%/fully complete,
  and a run right now would very likely yield COMPLIANT (no red-flag
  chemical data, PET Bottle recycled content 35% ≥ the demo 30%
  threshold) — but this is not materialized as seed data, only as a
  live computation.

---

## 6. Where new work will attach

**a) "Add Component Source" hook point** — There is currently **no
existing "add packaging component" flow at all** to extend (confirmed:
`addPackagingComponent` is unimplemented; `createPackagingItem` always
produces `componentIds: []` with no follow-up step). This means the
three-way source choice (Greendeal supplier product / External Supplier
Product / manufacturer-provided data) isn't retrofitting an existing
flow — **it will need to be built as the first version of that flow**,
most naturally as a step on `/manufacturer/packaging-items/[id]`
(an "Add Component" action) backed by a new `addPackagingComponent`
service function, with the source-type choice as its first decision
point. `replaceComponentProduct` (for version/product changes) is
likewise still unimplemented and will need the same source-awareness.

**b) Provenance badge/indicator placement** — Natural attachment points,
based on where supplier-sourced data is already rendered:
- `PackagingComponentCard` (components/packaging/) — already shows
  role/source/authorization/data-availability; a provenance badge
  (source + verification status) belongs right next to the existing
  "Source: X, Supplier Y" line.
- Product detail-sections (`components/products/detail-sections/*`) —
  each field-group section already renders per-field status; would need
  a provenance indicator wherever `ExternalSupplierProduct`/manufacturer-
  entered data can appear (today these sections assume real
  `SupplierProduct`/`ProductVersion` data only).
- `AssessmentResultsView` / calculation views — **no calculation view
  exists yet** (`ComplianceCalculation` type isn't implemented at all,
  confirmed in §3). Provenance on calculation inputs has no UI to attach
  to yet; this is new surface area, not an extension of existing UI.
- Data request approval/manufacturer-view components — would need
  provenance context once `origin` (GREENDEAL vs PUBLIC_REQUEST_LINK)
  varies per request.

**c) Extending `DataRequest` with `origin`** — Can be done **in place, as
an additive optional-with-default field**, without a compatibility shim:
- `createDataRequest` is the only construction path in code (one place
  to default `origin: 'GREENDEAL'`).
- Existing consumers (`getDataRequests`, approval/rejection flows,
  `data-request-approval-flow.tsx`, `data-request-manufacturer-view.tsx`)
  only read `requestingOrgId`/`supplierOrgId`/`requestedAttributes`/
  `status` — none branch on absence of `origin`, so adding it won't break
  Stage 4/5 rendering.
- The harder part is **not** the type addition but the `requester` object
  DOMAIN.md §8a describes for `PUBLIC_REQUEST_LINK` submissions (no real
  `requestingOrgId`) — that's a genuinely new optional shape on
  `DataRequest`, and every place that currently assumes
  `requestingOrgId` resolves to a real `Organization` via
  `getOrganization()` (both data-request list/detail pages, on both
  supplier and manufacturer sides) will need a conditional path for the
  "external requester" case. This is the one spot most likely to need
  careful handling rather than a pure additive field.

**d) Nav item mapping (AGENTS.md §10a suggests Request Links, Settings,
Suppliers)** — None of these three exist yet in `lib/nav-config.ts`:
- **Suppliers** — no nav item, no route, no supplier-directory page
  exists on the manufacturer side today (manufacturer never lists/
  browses suppliers directly, only reaches them via packaging
  components/data requests).
- **Request Links** — no nav item, no route; this is entirely new
  (needed for the public request link + external supplier invite UI).
- **Settings** — no nav item, no route; entirely new (would host e.g. a
  supplier's public-slug configuration).

  Current nav (`SUPPLIER_NAV` / `MANUFACTURER_NAV` in `lib/nav-config.ts`)
  is exactly the AGENTS.md §9 baseline (Supplier: Dashboard/Products/
  Data Requests/Evidence; Manufacturer: Dashboard/Packaging Items/Data
  Requests/Assessments/Documents) — nothing has drifted from spec, and
  nothing pre-built toward §10a exists to reuse.

---

## Summary of what could break if not careful

1. **`DataRequest.requestingOrgId` is assumed non-null/resolvable
   everywhere it's read.** Public-link requests without a real org will
   need every such read site updated together, or a lookup helper that
   safely no-ops for external requesters.
2. **No calculation view/type exists yet** — provenance-on-calculation-
   inputs is new ground, not a retrofit; don't assume existing UI to hang it off.
3. **Component creation is a genuine gap**, not a partially-built flow —
   "Add Component Source" needs its own new service function
   (`addPackagingComponent`) and route/UI before source-type selection
   can be layered on top.
4. **`mockOrganizationService` has zero API_CONTRACT.md coverage** — if a
   provenance/external-supplier feature starts calling it more heavily,
   the contract doc should be updated at the same time (per its own
   "update whenever a stage changes a service function" rule).
</content>
