import type { PackagingComponent } from "@/lib/types";

// The three components of Coca-Cola 500ml — see DOMAIN.md §6. Each
// references a Supplier Product + Product Version owned by a
// different supplier (PET Solutions GmbH / LabelTech GmbH / PolyCap
// GmbH) — the manufacturer never duplicates that data (AGENTS.md §6).
//
// No Data Request has been made yet (that's Stage 4/5), so every
// component starts NOT_REQUESTED. dataAvailability is deliberately
// MISSING for all three too — not because the suppliers' own product
// data is incomplete (PET Bottle 500ml is 100% complete on the
// supplier side), but because the *manufacturer* has no authorized
// access to any of it yet. dataAvailability here reflects what's
// available to this manufacturer, not the supplier's own completeness
// — that boundary (AGENTS.md §7) must hold even before Stage 4/5 exist
// to enforce it end-to-end.
export const packagingComponents: PackagingComponent[] = [
  {
    id: "pkgc-coke-500-bottle",
    packagingItemId: "pkg-coca-cola-500",
    role: "Bottle",
    supplierProductId: "prod-pet-bottle-500",
    productVersionId: "pv-pet-bottle-500-v1",
    authorizationStatus: "NOT_REQUESTED",
    dataAvailability: "MISSING",
  },
  {
    id: "pkgc-coke-500-label",
    packagingItemId: "pkg-coca-cola-500",
    role: "Label",
    supplierProductId: "prod-coca-cola-label-500",
    productVersionId: "pv-coca-cola-label-500-v1",
    authorizationStatus: "NOT_REQUESTED",
    dataAvailability: "MISSING",
  },
  {
    id: "pkgc-coke-500-cap",
    packagingItemId: "pkg-coca-cola-500",
    role: "Cap",
    supplierProductId: "prod-pp-cap-28",
    productVersionId: "pv-pp-cap-28-v1",
    authorizationStatus: "NOT_REQUESTED",
    dataAvailability: "MISSING",
  },
];
