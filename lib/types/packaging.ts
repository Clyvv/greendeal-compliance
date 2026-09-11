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
  // Stage 7.3 — a component references EITHER a real SupplierProduct +
  // ProductVersion OR an ExternalSupplierProduct (AGENTS.md §10a
  // scenarios 2/4), never both. Modeled here as plain optional fields
  // (not a nominal discriminated union) so every native-component
  // consumer written before Stage 7.3 keeps compiling/behaving
  // unchanged for the seeded Coca-Cola components, which still always
  // set supplierProductId + productVersionId. The invariant itself —
  // exactly one of (supplierProductId & productVersionId) or
  // externalSupplierProductId is set — is enforced where components
  // are actually created: see
  // mockPackagingService.AddPackagingComponentInput, which IS a real
  // discriminated union.
  supplierProductId?: string;
  productVersionId?: string;
  // Set only for components sourced from an ExternalSupplierProduct —
  // see lib/types/external-supplier-product.ts.
  externalSupplierProductId?: string;
  authorizationStatus: PackagingComponentAuthorizationStatus;
  dataAvailability: PackagingComponentDataAvailability;
};
