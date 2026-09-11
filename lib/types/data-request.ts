// DOMAIN.md §3 — Data Request (Manufacturer → Supplier, field-level).
// A Data Request always specifies *which* fields are being asked for
// (AGENTS.md §7) — requestedAttributes is never "share everything".
export type DataRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

// DOMAIN.md §8a — distinguishes how a request was raised. GREENDEAL is
// the original Stage 4 flow (both sides are Greendeal users, this
// stage's only construction path — see mockRequestService.createDataRequest).
// PUBLIC_REQUEST_LINK / EXTERNAL are reserved for later stages (public
// supplier request pages / email-parsed requests); nothing in this
// stage produces them yet.
export type RequestOrigin = "GREENDEAL" | "PUBLIC_REQUEST_LINK" | "EXTERNAL";

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
  // Optional (not required) so the Stage 4/5 seed data in
  // /lib/mock-data/data-requests.ts — which predates this field —
  // doesn't need to be touched. Every request created going forward
  // via createDataRequest sets this explicitly to "GREENDEAL"; no
  // existing reader branches on its absence (see STAGE_7_REVIEW.md §6c).
  origin?: RequestOrigin;
};
