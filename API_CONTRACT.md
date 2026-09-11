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

## Post-Stage-7 extension — new services

### mockExternalSupplierService

| Function | Method + Path | Status |
|---|---|---|
| `createExternalSupplierProduct(manufacturerId, input)` | `POST /api/v1/manufacturers/{id}/external-supplier-products` | 🟡 |
| `getExternalSupplierProduct(id)` | `GET /api/v1/external-supplier-products/{id}` | 🟡 |

### mockPublicRequestService (no auth — public-facing)

| Function | Method + Path | Status |
|---|---|---|
| `getSupplierPublicProfile(supplierSlug)` | `GET /api/v1/public/request/{supplierSlug}` | 🟡 |
| `getSupplierProductPublic(supplierSlug, productId)` | `GET /api/v1/public/request/{supplierSlug}/{productId}` | 🟡 |
| `submitPublicDataRequest(input)` | `POST /api/v1/public/request/{supplierSlug}/submit` — creates a DataRequest with origin PUBLIC_REQUEST_LINK | 🟡 |

**Real-world note:** in production this endpoint needs rate limiting,
spam/bot protection (captcha), and probably email verification of the
requester before the supplier sees it as legitimate — out of scope for
the prototype but worth flagging to the backend team now.

### mockProvenanceService

| Function | Method + Path | Status |
|---|---|---|
| `getProvenance(entityType, entityId, fieldKey)` | `GET /api/v1/provenance?entityType=&entityId=&field=` | 🟡 |

### mockRequestService — extensions

| Function | Method + Path | Status |
|---|---|---|
| `getRequestCoverage(requestId)` — compares requested fields against what the supplier already has on file | `GET /api/v1/data-requests/{id}/coverage` | 🟡 |
| `submitRequestResponse(requestId, response)` | `POST /api/v1/data-requests/{id}/response` | 🟡 |
| `claimExternalSupplierProduct(externalProductId, realSupplierId)` | `POST /api/v1/external-supplier-products/{id}/claim` | 🟡 |

---

### mockExternalSupplierService — extensions

| Function | Method + Path | Status |
|---|---|---|
| `requestInformationFromSupplier(externalProductId, email?)` — generates (or reuses) a `responseToken`, sets `responseStatus: 'SENT'`, returns simulated email content (to/from/subject/body incl. the response link) for display in a dialog | `POST /api/v1/external-supplier-products/{id}/request-information` | 🟡 |
| `getSupplierResponseData(token)` | `GET /api/v1/public/supplier-response/{token}` | 🟡 |
| `submitSupplierResponse(token, input)` — updates the ExternalSupplierProduct's fields, sets `responseStatus: 'COMPLETED'`, `sourceType: 'EXTERNAL_REQUEST_RESPONSE'`, `verificationStatus: 'SUPPLIER_APPROVED'` | `POST /api/v1/public/supplier-response/{token}/submit` | 🟡 |

Implemented in Stage 7.10, replacing Stage 7.3's `inviteSupplier`
(removed — no separate code path was kept). `requestInformationFromSupplier`
is invoked from `components/packaging/request-information-button.tsx`,
which opens a Dialog showing the exact simulated email (still no real
email is ever sent) plus a Copy Link button. `getSupplierResponseData`/
`submitSupplierResponse` back the public, unauthenticated
`/supplier-response/{token}` page (`app/supplier-response/[token]`) —
same no-auth pattern as `mockPublicRequestService`. A completed
response also feeds `lib/readiness.ts`'s `computeExternalComponentReadiness`
and `mockAssessmentService.runAssessment`, via a new
`getExternalSupplierProvidedFields` helper — see that file's comments
for why this is a distinct `SUPPLIER_RESPONSE` readiness state, not
folded into native `COMPLETE`.

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
      