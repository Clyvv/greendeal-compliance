// DOMAIN.md §3 — Packaging Item / Packaging Component. Owned by the
// Manufacturer (AGENTS.md §6) — never duplicates the referenced
// Supplier Product's own data, only points to it.
export type PackagingItem = {
  id: string;
  manufacturerId: string;
  name: string;
  sku: string;
  market: string;
  packagingType: string;
  componentIds: string[];
  createdAt: string;
};

export type PackagingComponentAuthorizationStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "AUTHORIZED"
  | "REJECTED";

export type PackagingComponentDataAvailability =
  | "COMPLETE"
  | "PARTIAL"
  | "MISSING";

export type PackagingComponent = {
  id: string;
  packagingItemId: string;
  role: string; // e.g. "Bottle", "Label", "Cap"
  supplierProductId: string;
  productVersionId: string;
  authorizationStatus: PackagingComponentAuthorizationStatus;
  dataAvailability: PackagingComponentDataAvailability;
};
