import type { DataApproval, DataRequest } from "@/lib/types";
import { dataApprovals, dataRequests, packagingComponents } from "@/lib/mock-data";
import { MOCK_TODAY } from "@/lib/constants";

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
  supplierProductId: string;
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
