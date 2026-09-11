// DOMAIN.md §8a — Data Provenance. Attached to any significant data
// value the manufacturer (or, per this stage's scope, the supplier
// viewing their own data) sees, so it's always clear where a value
// came from and how trustworthy it currently is (AGENTS.md §10a: "not
// all data is equally authoritative").
//
// This stage only ever produces SUPPLIER_MAINTAINED / SUPPLIER_APPROVED
// data (100% native Greendeal-to-Greendeal flow, per AGENTS.md §10a
// scenario 1) — the remaining DataSourceType/VerificationStatus values
// exist here because DOMAIN.md defines the full enum now, but nothing
// in this stage constructs them yet. That's intentional: later stages
// (External Supplier Products, public request links) introduce the
// data that actually uses MANUFACTURER_PROVIDED / IMPORTED /
// EXTERNAL_REQUEST_RESPONSE / UNVERIFIED / EXPIRED.
export type DataSourceType =
  | "SUPPLIER_MAINTAINED"
  | "SUPPLIER_APPROVED"
  | "MANUFACTURER_PROVIDED"
  | "IMPORTED"
  | "EXTERNAL_REQUEST_RESPONSE";

export type VerificationStatus =
  | "VERIFIED"
  | "SUPPLIER_APPROVED"
  | "UNVERIFIED"
  | "EXPIRED";

export type DataProvenance = {
  sourceType: DataSourceType;
  sourceName: string; // e.g. "PET Solutions GmbH" or "Manufacturer Provided"
  verificationStatus: VerificationStatus;
  productVersionId?: string; // if traceable to a real Product Version
  evidenceIds?: string[];
  validUntil?: string; // ISO date, if applicable
};
