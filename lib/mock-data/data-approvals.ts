import type { DataApproval } from "@/lib/types";
import { dataRequests } from "./data-requests";

// Seed narrative (see packaging-components.ts / data-requests.ts) —
// each of the three seeded DataRequests was approved in full: every
// requestedAttribute was granted, nothing denied. approvedAttributes
// is derived directly from each DataRequest's own requestedAttributes
// (rather than a second hand-copied literal list) so the two files
// can never drift out of sync.
export const dataApprovals: DataApproval[] = dataRequests.map((request, index) => ({
  id: `da-${index + 1}`,
  dataRequestId: request.id,
  approvedAttributes: [...request.requestedAttributes],
  decidedAt: "2026-08-14",
  decidedBy: request.supplierOrgId,
}));
