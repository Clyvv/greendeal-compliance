// DOMAIN.md §3 — Data Request (Manufacturer → Supplier, field-level).
// A Data Request always specifies *which* fields are being asked for
// (AGENTS.md §7) — requestedAttributes is never "share everything".
export type DataRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type DataRequest = {
  id: string;
  requestingOrgId: string;
  supplierOrgId: string;
  supplierProductId: string;
  packagingItemId: string;
  requestedAttributes: string[]; // flat list of field keys, grouped by section in UI
  purpose: string;
  requestDate: string;
  status: DataRequestStatus;
};
