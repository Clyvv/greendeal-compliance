import type { DataSourceType, VerificationStatus } from "./provenance";

// DOMAIN.md §8a — a manufacturer-created stand-in for a supplier
// product that isn't (yet) registered by a real supplier in Greendeal
// (AGENTS.md §10a scenarios 2 & 4). Owned by the Manufacturer, not the
// Supplier — this is deliberately NOT a SupplierProduct (see
// lib/types/product.ts): it has no ProductVersion, no Evidence, no
// publish/draft lifecycle, because no supplier is maintaining it yet.
//
// sourceType/verificationStatus distinguish the two scenarios this
// stage builds (see lib/services/mockExternalSupplierService.ts and
// components/packaging/add-component-flow.tsx for exactly which path
// sets which value):
// - MANUFACTURER_PROVIDED — the manufacturer is standing this in as a
//   real supplier they intend to onboard (full contact details
//   captured so "Invite Supplier" is meaningful).
// - IMPORTED — the manufacturer already has this compliance data on
//   hand from some other existing source (email/PDF/ERP/spreadsheet)
//   and is just entering it directly; no onboarding is implied.
// Both start UNVERIFIED — nothing in this stage upgrades that; a real
// Supplier "claiming" this record (Stage 7.4/7.5+) is what would.
export type ExternalSupplierProduct = {
  id: string;
  createdByManufacturerId: string;
  supplierCompanyName: string;
  supplierContactName?: string;
  supplierEmail?: string;
  supplierCountry?: string;
  productName: string;
  supplierSku?: string;
  gtin?: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: number;
  sourceType: DataSourceType; // typically MANUFACTURER_PROVIDED or IMPORTED
  verificationStatus: VerificationStatus; // typically UNVERIFIED
  claimedBySupplierId?: string; // set if a real Supplier later "claims" this (not built yet)
};
