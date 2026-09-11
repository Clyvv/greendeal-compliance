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
// the original Stage 4 flow (both sides are Greendeal users — see
// mockRequestService.createDataRequest). PUBLIC_REQUEST_LINK is
// Stage 7.5's public-link submission (see
// mockPublicRequestService.submitPublicDataRequest). EXTERNAL is
// reserved for a later stage (e.g. email-parsed requests); nothing
// produces it yet.
export type RequestOrigin = "GREENDEAL" | "PUBLIC_REQUEST_LINK" | "EXTERNAL";

// Stage 7.5 — DOMAIN.md §8a: a PUBLIC_REQUEST_LINK submission's
// self-entered identity. Lives on the DataRequest itself (not a
// separate RequestResponse) because it's who's asking, not what they
// got back — DOMAIN.md's RequestResponse is reserved for the
// supplier's structured reply in the external scenario, a later stage.
export type DataRequestRequester = {
  companyName: string;
  contactName: string;
  email: string;
  country?: string;
  referenceNumber?: string;
};

export type DataRequest = {
  id: string;
  // Optional as of Stage 7.5 — a PUBLIC_REQUEST_LINK submission has no
  // real Greendeal Organization behind it (see `requester` below); it
  // is never set to a placeholder value for that case. Every
  // GREENDEAL-origin request still always sets this (see
  // mockRequestService.createDataRequest) — nothing upstream needs to
  // fake one for the external case.
  requestingOrgId?: string;
  supplierOrgId: string;
  supplierProductId: string;
  // Optional as of Stage 7.5 — a public-link requester has no
  // Greendeal packaging item this request is "for"; it's just a
  // request against a supplier product directly. Every GREENDEAL-origin
  // request still always sets this.
  packagingItemId?: string;
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
  // Present only when origin === 'PUBLIC_REQUEST_LINK' — see
  // mockPublicRequestService.submitPublicDataRequest.
  requester?: DataRequestRequester;

  // Stage 7.12 — Request Result Link (AGENTS.md's "Request Result
  // Link" section). Only ever meaningful for a PUBLIC_REQUEST_LINK-
  // origin request once it's been APPROVED — a GREENDEAL-origin
  // requester already has a working in-app view (Stage 5b) and never
  // needs this. Generated once by
  // mockRequestService.generateRequestResult (reused on every
  // subsequent call, never regenerated) and consumed by the public,
  // unauthenticated /request-result/{token} page.
  resultToken?: string;
  resultGeneratedAt?: string; // ISO date
};
