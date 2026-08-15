# API_CONTRACT.md — Mock Service → Future REST Contract

Purpose: every function in `/lib/services` should map cleanly to a real
endpoint the Java Spring Boot backend will eventually expose. This file
is the running record of that mapping. **Update it whenever a stage adds
or changes a service function** — treat it as the de facto API spec
you'll hand to the backend team, not an afterthought.

Status column: 🟡 mock only (current) · 🟢 contract finalized · 🔵 built server-side

---

## Conventions

- Base path: `/api/v1`
- All list endpoints support `?page=&size=` (paginate from day one in the
  mock layer too, even if you just slice an array — keeps signatures honest)
- All timestamps: ISO 8601
- Auth: none yet (prototype). Real contract will add `Authorization:
  Bearer <token>` and org-scoping via the authenticated principal —
  don't hardcode `organizationId` params that a real backend would derive
  from the session; keep them explicit params for now but flag them
  `// TODO: derive from auth context` so the swap is obvious later.

---

## mockOrganizationService

| Function | Method + Path | Status |
|---|---|---|
| `getOrganizations()` | `GET /api/v1/organizations` | 🟡 |
| `getOrganization(orgId)` | `GET /api/v1/organizations/{orgId}` | 🟡 |

## mockProductService

| Function | Method + Path | Status |
|---|---|---|
| `getSupplierProducts(supplierId)` | `GET /api/v1/suppliers/{supplierId}/products` | 🟡 |
| `getSupplierProduct(productId)` | `GET /api/v1/products/{productId}` | 🟡 |
| `createSupplierProduct(supplierId, input)` | `POST /api/v1/suppliers/{supplierId}/products` | 🟡 |
| `updateProductDraft(productId, input)` | `PATCH /api/v1/products/{productId}` | 🟡 |
| `publishProduct(productId)` | `POST /api/v1/products/{productId}/publish` | 🟡 |
| `getProductVersions(productId)` | `GET /api/v1/products/{productId}/versions` | 🟡 |
| `getProductVersion(versionId)` | `GET /api/v1/product-versions/{versionId}` | 🟡 |
| `createProductVersion(productId, input)` | `POST /api/v1/products/{productId}/versions` | 🟡 |
| `getProductEvidence(productVersionId)` | `GET /api/v1/product-versions/{versionId}/evidence` | 🟡 |
| `addEvidence(productVersionId, input)` | `POST /api/v1/product-versions/{versionId}/evidence` | 🟡 |

Note: the Create Product wizard (Stage 1b) submits identification,
physical/circularity/chemical-safety/specialized-domain data, and
evidence all in one user action, so the mock's `createSupplierProduct`
bundles what this table shows as three separate calls
(createSupplierProduct + createProductVersion + addEvidence) into one —
it creates the product, its v1.0 ProductVersion, and any Evidence
records together, always as DRAFT. `publishProduct` is a separate, pure
status transition (DRAFT → PUBLISHED) and does not create a new
version. A real backend would likely keep these as distinct calls (and
`updateProductDraft`/`createProductVersion`/`addEvidence` remain
unimplemented in the mock for now — see Stage 2+).

## mockPackagingService

| Function | Method + Path | Status |
|---|---|---|
| `getPackagingItems(manufacturerId)` | `GET /api/v1/manufacturers/{manufacturerId}/packaging-items` | 🟡 |
| `getPackagingItem(itemId)` | `GET /api/v1/packaging-items/{itemId}` | 🟡 |
| `createPackagingItem(manufacturerId, input)` | `POST /api/v1/manufacturers/{manufacturerId}/packaging-items` | 🟡 |
| `getPackagingComponents(itemId)` | `GET /api/v1/packaging-items/{itemId}/components` | 🟡 |
| `addPackagingComponent(itemId, input)` | `POST /api/v1/packaging-items/{itemId}/components` | 🟡 |
| `replaceComponentProduct(componentId, newProductId)` | `PATCH /api/v1/packaging-components/{componentId}` | 🟡 |
| `getPackagingReadiness(itemId)` | `GET /api/v1/packaging-items/{itemId}/readiness` | 🟡 |

## mockRequestService

| Function | Method + Path | Status |
|---|---|---|
| `getDataRequests(orgId, role)` | `GET /api/v1/organizations/{orgId}/data-requests?role=` | 🟡 |
| `getDataRequest(requestId)` | `GET /api/v1/data-requests/{requestId}` | 🟡 |
| `createDataRequest(input)` | `POST /api/v1/data-requests` | 🟡 |
| `approveDataRequest(requestId, approvedAttributes)` | `POST /api/v1/data-requests/{requestId}/approve` | 🟡 |
| `rejectDataRequest(requestId, reason?)` | `POST /api/v1/data-requests/{requestId}/reject` | 🟡 |
| `getAuthorizedData(packagingComponentId)` | `GET /api/v1/packaging-components/{componentId}/authorized-data` | 🟡 |

## mockAssessmentService

| Function | Method + Path | Status |
|---|---|---|
| `runAssessment(packagingItemId)` | `POST /api/v1/packaging-items/{itemId}/assessments` | 🟡 |
| `getAssessment(assessmentId)` | `GET /api/v1/assessments/{assessmentId}` | 🟡 |
| `getAssessmentHistory(packagingItemId)` | `GET /api/v1/packaging-items/{itemId}/assessments` | 🟡 |
| `getCalculation(assessmentId, metric)` | `GET /api/v1/assessments/{assessmentId}/calculations/{metric}` | 🟡 |
| `getImpactAnalysis(productVersionChangeId)` | `GET /api/v1/product-versions/{versionId}/impact` | 🟡 |
| `recalculateAssessment(assessmentId)` | `POST /api/v1/assessments/{assessmentId}/recalculate` | 🟡 |

Note: `runAssessment` is synchronous in the mock (simulated delay only).
In production this is almost certainly async (job queue) — real contract
will likely be `POST .../assessments` returning `202 Accepted` + an
assessment id in `PROCESSING` status, with the client polling
`GET /assessments/{id}` or subscribing via websocket/SSE. Keep the mock's
`AssessmentStatus.PROCESSING` state in the UI now specifically so this
swap doesn't require new UI states later.

## mockDocumentService

| Function | Method + Path | Status |
|---|---|---|
| `generateDocument(assessmentId)` | `POST /api/v1/assessments/{assessmentId}/documents` | 🟡 |
| `getDocument(documentId)` | `GET /api/v1/documents/{documentId}` | 🟡 |
| `downloadDocument(documentId)` | `GET /api/v1/documents/{documentId}/download` (binary) | 🟡 |

---

## Open questions to resolve with backend team before real integration

- [ ] Pagination: cursor-based or offset-based?
- [ ] Does `getAuthorizedData` return full objects with locked fields
      masked, or only the approved subset (smaller payload, but means
      the UI can't show "🔒 not authorized" without a separate call)?
- [ ] Document generation: sync small PDF vs. async job — depends on
      real document engine performance.
- [ ] Versioning: is `ProductVersion` immutable once published (new
      version = new row) — assume yes, confirm before backend build.
- [ ] Multi-tenant scoping: will `organizationId` be derivable entirely
      from auth token, or do cross-org endpoints (e.g. manufacturer
      viewing authorized supplier data) need explicit org params either way?
