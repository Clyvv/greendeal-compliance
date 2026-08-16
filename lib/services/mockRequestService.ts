import type { DataRequest } from "@/lib/types";
import { dataRequests } from "@/lib/mock-data";
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

// Maps to: GET /api/v1/organizations/{orgId}/data-requests?role=
// TODO: derive orgId from auth context once real auth exists.
// `role` disambiguates which side of the request `orgId` is standing
// in for — a manufacturer wants requests it sent (REQUESTING), a
// supplier wants requests it received (SUPPLIER).
export async function getDataRequests(
  orgId: string,
  role: "REQUESTING" | "SUPPLIER"
): Promise<DataRequest[]> {
  return dataRequests.filter((request) =>
    role === "REQUESTING"
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

// Planned for a later stage (see API_CONTRACT.md → mockRequestService):
//   approveDataRequest(requestId, approvedAttributes)
//   rejectDataRequest(requestId, reason?)
//   getAuthorizedData(packagingComponentId)
