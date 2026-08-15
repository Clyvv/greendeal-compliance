import type { FieldStatus } from "./field-status";

// DOMAIN.md §2, Section 2 — Physical & Structural Properties.
export type PhysicalProperties = {
  materialFamily: string;
  specificMaterial: string;
  netWeightGrams: number;
  dimensions: string;
  thicknessMm: number;
  packagingFunction: string;
};

// DOMAIN.md §2, Section 3 — Circularity & PPWR Metrics.
export type CircularityMetrics = {
  totalRecycledContentPercent: number;
  pcrYieldPercent: number;
  preConsumerYieldPercent: number;
  dfrGrade: string;
  reusabilityStatus: string;
};

// DOMAIN.md §2, Section 4 — Chemical Safety & Substance Restrictions.
export type ChemicalSafetyData = {
  heavyMetalPpm?: number;
  pfasStatus: FieldStatus;
  pfasIntentionallyAdded: boolean | null;
  reachSvhcStatus: FieldStatus;
  scipCode?: string;
  rohsStatus: FieldStatus;
};

// DOMAIN.md §2, Section 5 — Specialized Domain Metrics.
export type SpecializedDomainData = {
  fcmStatus: FieldStatus;
  omlTestScore?: string;
  sterilizationProfile?: string;
};

// A versioned snapshot of a Supplier Product's compliance data — see
// DOMAIN.md §1 (provenance/audit) and §3.
export type ProductVersion = {
  id: string;
  productId: string;
  versionLabel: string; // e.g. "1.0", "2.0"
  createdAt: string;
  changeSummary?: string;
  physical: PhysicalProperties;
  circularity: CircularityMetrics;
  chemicalSafety: ChemicalSafetyData;
  specializedDomain: SpecializedDomainData;
  evidenceIds: string[];
};

// Supplier-owned product record — see AGENTS.md §6 (data ownership).
export type SupplierProduct = {
  id: string;
  supplierId: string;
  name: string;
  sku: string;
  gtin?: string;
  countryOfOrigin?: string;
  currentVersionId: string;
  status: "DRAFT" | "PUBLISHED";
  completenessPercent: number;
  lastUpdated: string;
};
