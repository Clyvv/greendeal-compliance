import type { SupplierProduct } from "@/lib/types";

// The three sample supplier products — see DOMAIN.md §5. Each is
// PUBLISHED with a single v1.0 ProductVersion (see product-versions.ts).
// completenessPercent reflects how much of the compliance profile has
// actually been submitted (physical + circularity are always filled;
// chemical-safety / specialized-domain fields left NOT_PROVIDED reduce
// completeness) — this is what the dashboard's complete/incomplete
// split is derived from.
export const supplierProducts: SupplierProduct[] = [
  {
    id: "prod-pet-bottle-500",
    supplierId: "org-pet-solutions",
    name: "PET Bottle 500ml",
    sku: "PET-500",
    gtin: "04012345678901",
    countryOfOrigin: "Germany",
    currentVersionId: "pv-pet-bottle-500-v1",
    status: "PUBLISHED",
    completenessPercent: 100,
    lastUpdated: "2026-08-10",
  },
  {
    id: "prod-coca-cola-label-500",
    supplierId: "org-labeltech",
    name: "Coca-Cola Label 500ml",
    sku: "LABEL-500",
    currentVersionId: "pv-coca-cola-label-500-v1",
    status: "PUBLISHED",
    completenessPercent: 60,
    lastUpdated: "2026-07-22",
  },
  {
    id: "prod-pp-cap-28",
    supplierId: "org-polycap",
    name: "PP Cap 28mm",
    sku: "CAP-28",
    currentVersionId: "pv-pp-cap-28-v1",
    status: "PUBLISHED",
    completenessPercent: 80,
    lastUpdated: "2026-08-05",
  },
];
