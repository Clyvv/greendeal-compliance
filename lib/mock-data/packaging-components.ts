import type { PackagingComponent } from "@/lib/types";

// The three components of Coca-Cola 500ml — see DOMAIN.md §6. Each
// references a Supplier Product + Product Version owned by a
// different supplier (PET Solutions GmbH / LabelTech GmbH / PolyCap
// GmbH) — the manufacturer never duplicates that data (AGENTS.md §6).
//
// Seed narrative: all three have already been through the Stage 4/5
// request → approval workflow (see data-requests.ts / data-approvals.ts)
// and are fully AUTHORIZED with COMPLETE data availability — Stage 6
// (Packaging Data Completeness) needs a fully-authorized starting
// state so its readiness view has something real and complete to
// compute against, and Stage 7's assessment simulation needs complete
// data to run on. This is the same kind of "story so far" snapshot
// DOMAIN.md's other sample data already represents (e.g. supplier
// products already PUBLISHED) — not a hardcoded shortcut around the
// workflow, the workflow genuinely ran (see data-requests.ts's
// requestedAttributes / data-approvals.ts's approvedAttributes for
// exactly what was requested and granted).
export const packagingComponents: PackagingComponent[] = [
  {
    id: "pkgc-coke-500-bottle",
    packagingItemId: "pkg-coca-cola-500",
    role: "Bottle",
    supplierProductId: "prod-pet-bottle-500",
    productVersionId: "pv-pet-bottle-500-v1",
    authorizationStatus: "AUTHORIZED",
    dataAvailability: "COMPLETE",
  },
  {
    id: "pkgc-coke-500-label",
    packagingItemId: "pkg-coca-cola-500",
    role: "Label",
    supplierProductId: "prod-coca-cola-label-500",
    productVersionId: "pv-coca-cola-label-500-v1",
    authorizationStatus: "AUTHORIZED",
    dataAvailability: "COMPLETE",
  },
  {
    id: "pkgc-coke-500-cap",
    packagingItemId: "pkg-coca-cola-500",
    role: "Cap",
    supplierProductId: "prod-pp-cap-28",
    productVersionId: "pv-pp-cap-28-v1",
    authorizationStatus: "AUTHORIZED",
    dataAvailability: "COMPLETE",
  },
];
