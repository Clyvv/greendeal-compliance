import type {
  DataApproval,
  DataRequest,
  Evidence,
  ProductVersion,
  SupplierProduct,
} from "@/lib/types";
import {
  dataApprovals,
  dataRequests,
  evidence,
  organizations,
  packagingComponents,
  productVersions,
  supplierProducts,
} from "@/lib/mock-data";
import { MOCK_TODAY } from "@/lib/constants";
import { PUBLIC_REQUEST_EVIDENCE_LABEL } from "@/lib/requests/fields";

function today(): string {
  return MOCK_TODAY.toISOString().slice(0, 10);
}

let requestSequence = dataRequests.length + 1;

function generateDataRequestId(): string {
  const id = `dr-${requestSequence}`;
  requestSequence += 1;
  return id;
}

let approvalSequence = dataApprovals.length + 1;

function generateDataApprovalId(): string {
  const id = `da-${approvalSequence}`;
  approvalSequence += 1;
  return id;
}

// Maps to: GET /api/v1/organizations/{orgId}/data-requests?role=
// TODO: derive orgId from auth context once real auth exists.
// `role` disambiguates which side of the request `orgId` is standing
// in for — a manufacturer wants requests it sent (MANUFACTURER), a
// supplier wants requests it received (SUPPLIER). Deliberately mirrors
// Organization["type"] rather than a directional REQUESTING/SUPPLIER
// pair, since that's the distinction callers actually have on hand
// (CURRENT_MANUFACTURER_ORG_ID / CURRENT_SUPPLIER_ORG_ID). Used by both
// the supplier inbox (Stage 5) and the manufacturer's own Data
// Requests list (Stage 5 corrective addition) — both sides filter
// correctly here, nothing further to fix.
export async function getDataRequests(
  orgId: string,
  role: "MANUFACTURER" | "SUPPLIER"
): Promise<DataRequest[]> {
  return dataRequests.filter((request) =>
    role === "MANUFACTURER"
      ? request.requestingOrgId === orgId
      : request.supplierOrgId === orgId
  );
}

// Maps to: GET /api/v1/data-requests/{requestId}
export async function getDataRequest(
  requestId: string
): Promise<DataRequest | undefined> {
  return dataRequests.find((request) => request.id === requestId);
}

export interface CreateDataRequestInput {
  requestingOrgId: string;
  supplierOrgId: string;
  supplierProductId: string;
  packagingItemId: string;
  requestedAttributes: string[];
  purpose: string;
}

// Maps to: POST /api/v1/data-requests
// Always created as PENDING — this stage's flow submits directly from
// the Request Summary screen, so the DRAFT status (saved but not yet
// sent) isn't exercised here. Note this function only creates the
// DataRequest record itself; updating the related PackagingComponent's
// authorizationStatus is a separate call (see
// mockPackagingService.updateComponentAuthorizationStatus) kept out of
// this service so mockRequestService doesn't reach into packaging data.
export async function createDataRequest(
  input: CreateDataRequestInput
): Promise<DataRequest> {
  const request: DataRequest = {
    id: generateDataRequestId(),
    requestingOrgId: input.requestingOrgId,
    supplierOrgId: input.supplierOrgId,
    supplierProductId: input.supplierProductId,
    packagingItemId: input.packagingItemId,
    requestedAttributes: input.requestedAttributes,
    purpose: input.purpose,
    requestDate: today(),
    status: "PENDING",
    // Every request created through this flow is the native
    // Greendeal-to-Greendeal scenario (AGENTS.md §10a scenario 1). As
    // of Stage 7.5 there's a second construction path —
    // mockPublicRequestService.submitPublicDataRequest, origin
    // PUBLIC_REQUEST_LINK — which builds its own DataRequest directly
    // (different required inputs: a `requester` object instead of
    // requestingOrgId, no packagingItemId) rather than reusing this
    // function's input shape.
    origin: "GREENDEAL",
  };
  dataRequests.push(request);
  return request;
}

// Maps to: POST /api/v1/data-requests/{requestId}/approve
// Approval is scoped to requested attributes only (AGENTS.md §7) — the
// caller may pass whatever it wants, but anything not actually present
// in the original requestedAttributes is filtered out here rather than
// trusted, so a client bug can never grant access to a field that was
// never asked for. Creates the DataApproval record and flips the
// DataRequest to APPROVED; it does NOT touch the related
// PackagingComponent's authorizationStatus — that's a separate call
// (see mockPackagingService.updateComponentAuthorizationStatus, wired
// up from lib/requests/actions.ts) for the same reason Stage 4 kept
// createDataRequest from reaching into packaging data directly.
export async function approveDataRequest(
  requestId: string,
  approvedAttributes: string[]
): Promise<DataApproval> {
  const request = dataRequests.find((item) => item.id === requestId);
  if (!request) {
    throw new Error(`Unknown data request: ${requestId}`);
  }
  if (request.status !== "PENDING") {
    throw new Error(
      `Data request ${requestId} has already been resolved (${request.status}).`
    );
  }

  const approvedSubset = approvedAttributes.filter((attribute) =>
    request.requestedAttributes.includes(attribute)
  );

  request.status = "APPROVED";

  const approval: DataApproval = {
    id: generateDataApprovalId(),
    dataRequestId: requestId,
    approvedAttributes: approvedSubset,
    decidedAt: today(),
    // TODO: derive from the authenticated user once real auth exists —
    // the org is all the prototype can stand in for today.
    decidedBy: request.supplierOrgId,
  };
  dataApprovals.push(approval);
  return approval;
}

// Maps to: GET /api/v1/data-requests/{requestId} (a real API would
// likely fold this into that response as a nested resource, rather
// than a separate call — added here as its own function since the
// mock's DataRequest/DataApproval are separate arrays).
// Stage 7.6 — a direct dataRequestId -> DataApproval lookup,
// independent of any PackagingComponent. getAuthorizedData's
// component-based aggregation (above) is the right source of truth
// for "what can this packaging component's data-consumer see" (Stage
// 6), but a PUBLIC_REQUEST_LINK request has no packaging component at
// all to route through (Stage 7.5 — packagingItemId is unset), so
// redisplaying "what was approved for THIS request" on the Supplier
// Data Request detail page needs this instead, for both origins.
export async function getApprovalForRequest(
  requestId: string
): Promise<DataApproval | undefined> {
  return dataApprovals.find((approval) => approval.dataRequestId === requestId);
}

// Maps to: POST /api/v1/data-requests/{requestId}/reject
// A full rejection needs no partial-approval state (AGENTS.md §7 —
// this stage's prompt), so no DataApproval record is created here.
// `reason` isn't part of the DataRequest/DataApproval shape in
// DOMAIN.md §3 today, so it's accepted (for a future audit-trail
// field / notification copy) but not persisted anywhere yet.
export async function rejectDataRequest(
  requestId: string,
  reason?: string
): Promise<DataRequest> {
  const request = dataRequests.find((item) => item.id === requestId);
  if (!request) {
    throw new Error(`Unknown data request: ${requestId}`);
  }
  if (request.status !== "PENDING") {
    throw new Error(
      `Data request ${requestId} has already been resolved (${request.status}).`
    );
  }
  void reason;
  request.status = "REJECTED";
  return request;
}

export interface AuthorizedData {
  packagingComponentId: string;
  // Optional as of Stage 7.3 — undefined for a PackagingComponent
  // backed by an ExternalSupplierProduct instead of a real
  // SupplierProduct (no data request is possible against it yet).
  supplierProductId?: string;
  /** Only ever the fields explicitly approved for this component —
   * across every APPROVED DataRequest raised against it. Anything
   * requested but not (yet) approved is deliberately absent here; the
   * caller renders 🔒 Not authorized for those, it never gets a value
   * to leak (AGENTS.md §7). */
  authorizedAttributes: string[];
}

// Maps to: GET /api/v1/packaging-components/{componentId}/authorized-data
// The one place a manufacturer-side screen is allowed to learn which
// specific fields it has real access to for a component. Cross-
// references packagingComponents here (rather than staying purely
// DataRequest-scoped) because a DataRequest doesn't store a
// componentId directly (DOMAIN.md §3) — the same join a real backend
// would do server-side. Stage 6 builds the UI that actually renders
// field values using this; this stage only wires the function itself
// and the authorization state it depends on.
export async function getAuthorizedData(
  packagingComponentId: string
): Promise<AuthorizedData | undefined> {
  const component = packagingComponents.find(
    (item) => item.id === packagingComponentId
  );
  if (!component) return undefined;

  const approvedRequestIds = dataRequests
    .filter(
      (request) =>
        request.packagingItemId === component.packagingItemId &&
        request.supplierProductId === component.supplierProductId &&
        request.status === "APPROVED"
    )
    .map((request) => request.id);

  const authorizedAttributes = new Set<string>();
  for (const approval of dataApprovals) {
    if (approvedRequestIds.includes(approval.dataRequestId)) {
      approval.approvedAttributes.forEach((attribute) =>
        authorizedAttributes.add(attribute)
      );
    }
  }

  return {
    packagingComponentId,
    supplierProductId: component.supplierProductId,
    authorizedAttributes: [...authorizedAttributes],
  };
}

export type CoverageStatus = "AVAILABLE" | "MISSING";

export interface RequestCoverageResult {
  requestId: string;
  /** One entry per request.requestedAttributes, in that same order —
   * field label -> whether the supplier already has that data on
   * file, independent of whether it's been approved for sharing yet
   * (this is "do I have it", not "have I agreed to share it"). */
  coverage: Record<string, CoverageStatus>;
  availableCount: number;
  totalCount: number;
}

// Original requirements doc §8 — an illustrative, simplified heuristic
// for "is this field on file at all", same spirit as
// lib/assessment-findings.ts's disclaimer: this checks presence of a
// value, never judges whether that value is good/compliant/complete
// enough. NOT_APPLICABLE counts as available — the supplier explicitly
// answered "doesn't apply", which is a real, on-file answer, not a
// gap (AGENTS.md §8: NOT_APPLICABLE and NOT_PROVIDED are meaningfully
// different, never collapsed). Only NOT_PROVIDED (or an absent
// version entirely) counts as missing. Numeric circularity/physical
// fields (Total Recycled Content, Net Weight, ...) have no FieldStatus
// of their own in the domain model (DOMAIN.md §3 — always plain
// numbers) — once a ProductVersion exists at all, they're always
// "on file" (even a genuine 0% is a real, filled-in answer).
function isFieldOnFile(
  field: string,
  product: SupplierProduct | undefined,
  version: ProductVersion | undefined,
  evidenceItems: Evidence[]
): boolean {
  switch (field) {
    case "GTIN":
      return Boolean(product?.gtin);
    case "Country of Origin":
      return Boolean(product?.countryOfOrigin);
    case "Material Composition":
      return Boolean(version?.physical.specificMaterial);
    case "Net Weight":
    case "Total Recycled Content":
    case "PCR":
    case "Pre-Consumer Recycled Content":
      return Boolean(version);
    case "Dimensions":
      return Boolean(version?.physical.dimensions);
    case "Thickness":
      return Boolean(version && version.physical.thicknessMm > 0);
    case "DfR Grade":
      return Boolean(version?.circularity.dfrGrade);
    case "Heavy Metals":
      return typeof version?.chemicalSafety.heavyMetalPpm === "number";
    case "PFAS":
      return version ? version.chemicalSafety.pfasStatus !== "NOT_PROVIDED" : false;
    case "REACH":
      return version ? version.chemicalSafety.reachSvhcStatus !== "NOT_PROVIDED" : false;
    case "SCIP":
      return Boolean(version?.chemicalSafety.scipCode);
    case "RoHS":
      return version ? version.chemicalSafety.rohsStatus !== "NOT_PROVIDED" : false;
    case "FCM":
      return version ? version.specializedDomain.fcmStatus !== "NOT_PROVIDED" : false;
    case "OML":
      return Boolean(version?.specializedDomain.omlTestScore);
    case "Sterilization":
      return Boolean(version?.specializedDomain.sterilizationProfile);
    default:
      // Not one of the static field labels above — must be an
      // evidence document name (lib/requests/fields.ts's comment on
      // why those aren't statically enumerable). Available only if a
      // real Evidence record with that exact documentName exists for
      // this version.
      return evidenceItems.some((item) => item.documentName === field);
  }
}

// Maps to: GET /api/v1/data-requests/{requestId}/coverage
// Original requirements doc §8 — "existing data coverage": before
// deciding what to approve, a supplier should see which requested
// fields they already have on file versus which are genuinely
// missing, so they're not re-entering data Greendeal already has
// (AGENTS.md §10a's core promise). Works identically regardless of
// origin (GREENDEAL or PUBLIC_REQUEST_LINK) — it's purely a function
// of request.supplierProductId, which both origins always set. If
// supplierProductId doesn't resolve to a real product/version at all
// (the edge case this stage's prompt calls out — e.g. a stale id),
// isFieldOnFile's `undefined` branches naturally make every field
// MISSING rather than throwing.
export async function getRequestCoverage(
  requestId: string
): Promise<RequestCoverageResult | undefined> {
  const request = dataRequests.find((item) => item.id === requestId);
  if (!request) return undefined;

  const product = supplierProducts.find(
    (item) => item.id === request.supplierProductId
  );
  const version = product
    ? productVersions.find((item) => item.id === product.currentVersionId)
    : undefined;
  const evidenceItems = version
    ? evidence.filter((item) => item.productVersionId === version.id)
    : [];

  const coverage: Record<string, CoverageStatus> = {};
  for (const field of request.requestedAttributes) {
    coverage[field] = isFieldOnFile(field, product, version, evidenceItems)
      ? "AVAILABLE"
      : "MISSING";
  }

  const availableCount = Object.values(coverage).filter(
    (status) => status === "AVAILABLE"
  ).length;

  return {
    requestId,
    coverage,
    availableCount,
    totalCount: request.requestedAttributes.length,
  };
}

function generateResultToken(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `result-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface GenerateRequestResultEmail {
  to: string;
  from: string;
  subject: string;
  body: string;
}

export interface GenerateRequestResultResult {
  requestId: string;
  resultToken: string;
  resultUrl: string; // relative path, e.g. "/request-result/{token}"
  email: GenerateRequestResultEmail;
}

// Maps to: POST /api/v1/data-requests/{id}/generate-result-link
// Stage 7.12 — AGENTS.md's "Request Result Link": closes the loop for
// a PUBLIC_REQUEST_LINK-origin requester, who has no Greendeal account
// to view approved data in-app the way a GREENDEAL-origin requester
// does (Stage 5b). Simulated only — no real email is ever sent
// (API_CONTRACT.md), same posture as
// mockExternalSupplierService.requestInformationFromSupplier (Stage
// 7.10) — this generates the result link + email content for display
// in a dialog. Re-requesting (e.g. the supplier reopens the
// notification later) reuses the existing token/date rather than
// minting new ones, same precedent as that function.
//
// Refuses anything but an APPROVED PUBLIC_REQUEST_LINK request — a
// GREENDEAL-origin request must never get a result link (it has its
// own better, authenticated view), and there is nothing approved yet
// to link to before APPROVED.
export async function generateRequestResult(
  requestId: string
): Promise<GenerateRequestResultResult> {
  const request = dataRequests.find((item) => item.id === requestId);
  if (!request) {
    throw new Error(`Unknown data request: ${requestId}`);
  }
  if (request.origin !== "PUBLIC_REQUEST_LINK") {
    throw new Error(
      "Result links only apply to external (public request link) requests."
    );
  }
  if (request.status !== "APPROVED") {
    throw new Error("This request has not been approved yet.");
  }
  if (!request.requester) {
    throw new Error("This request has no requester contact details on file.");
  }

  const token = request.resultToken ?? generateResultToken();
  request.resultToken = token;
  request.resultGeneratedAt = request.resultGeneratedAt ?? today();

  const supplierOrg = organizations.find((org) => org.id === request.supplierOrgId);
  const supplierName = supplierOrg?.name ?? "The supplier";
  const product = supplierProducts.find(
    (item) => item.id === request.supplierProductId
  );
  const productName = product?.name ?? "the requested product";
  const resultUrl = `/request-result/${token}`;

  const email: GenerateRequestResultEmail = {
    to: request.requester.email,
    from: "noreply@greendealcompliance.com",
    subject: "Your compliance information request has been approved",
    body: [
      `Hi ${request.requester.contactName},`,
      "",
      `${supplierName} has approved your request for ${productName}. You can view and download the approved information using the secure link below:`,
      "",
      `  {{RESULT_LINK}}`,
      "",
      `Reference: ${request.id}`,
      "",
      "— Greendeal Compliance",
    ].join("\n"),
  };

  return {
    requestId,
    resultToken: token,
    resultUrl,
    email,
  };
}

export interface RequestResultData {
  requestId: string; // shown as the reference number (REQ-XXXX)
  supplierName: string;
  productName: string;
  purpose: string;
  resultGeneratedAt: string;
  /** The actual security boundary — only ever the DataApproval's own
   * approvedAttributes subset, NEVER request.requestedAttributes (which
   * would leak which fields were asked for but denied/withheld). */
  approvedAttributes: string[];
  /** Only Evidence records whose documentName is itself present in
   * approvedAttributes — never the product version's full evidence
   * list. Same boundary as above, applied to evidence specifically. */
  approvedEvidence: Evidence[];
}

// Maps to: GET /api/v1/public/request-result/{token} — no auth.
// Stage 7.12 — the read side of the Request Result Link. Returns
// undefined for an unknown/never-generated token (same pattern
// mockExternalSupplierService.getSupplierResponseData and
// mockPublicRequestService use for their own unknown-identifier case),
// so the page can 404 rather than leak whether a token ever existed.
// Also refuses a token whose request somehow isn't a currently-APPROVED
// PUBLIC_REQUEST_LINK request (belt-and-suspenders — generateRequestResult
// already only ever mints a token for one, but this is the actual
// public read boundary, so it re-checks rather than trusting that
// invariant alone).
//
// This is a static snapshot at approval time, not a live view — per
// AGENTS.md, a later re-approval or data change does not retroactively
// update what this returns.
export async function getRequestResult(
  token: string
): Promise<RequestResultData | undefined> {
  const request = dataRequests.find((item) => item.resultToken === token);
  if (!request) return undefined;
  if (request.origin !== "PUBLIC_REQUEST_LINK" || request.status !== "APPROVED") {
    return undefined;
  }

  const approval = dataApprovals.find(
    (item) => item.dataRequestId === request.id
  );
  // Deliberately request.requestedAttributes is never read here at
  // all — only the DataApproval's own approvedAttributes, so a denied
  // field can never leak onto this page even by accident.
  const approvedAttributes = approval?.approvedAttributes ?? [];

  const supplierOrg = organizations.find((org) => org.id === request.supplierOrgId);
  const product = supplierProducts.find(
    (item) => item.id === request.supplierProductId
  );
  const version = product
    ? productVersions.find((item) => item.id === product.currentVersionId)
    : undefined;
  const evidenceItems = version
    ? evidence.filter((item) => item.productVersionId === version.id)
    : [];
  // A PUBLIC_REQUEST_LINK request never asks for evidence by specific
  // document name (see lib/requests/fields.ts's PUBLIC_REQUEST_EVIDENCE_LABEL
  // comment) — it only ever has that one generic "please share
  // supporting evidence" checkbox. So the boundary here is: approving
  // that generic item means "share every evidence document on file for
  // this product", the only interpretation available given what was
  // actually asked for; anything else in approvedAttributes is matched
  // by exact documentName (kept for parity with the internal flow's
  // shape, even though nothing produces that combination today).
  const approvedEvidence = approvedAttributes.includes(PUBLIC_REQUEST_EVIDENCE_LABEL)
    ? evidenceItems
    : evidenceItems.filter((item) => approvedAttributes.includes(item.documentName));

  return {
    requestId: request.id,
    supplierName: supplierOrg?.name ?? "The supplier",
    productName: product?.name ?? "Unknown product",
    purpose: request.purpose,
    resultGeneratedAt: request.resultGeneratedAt ?? today(),
    approvedAttributes,
    approvedEvidence,
  };
}
