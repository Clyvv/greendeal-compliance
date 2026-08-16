import type { PackagingItem } from "@/lib/types";

// The sample packaging item — see DOMAIN.md §6. Owned by Coca-Cola
// (org-coca-cola); its three components (see packaging-components.ts)
// reference supplier products owned by three different suppliers.
export const packagingItems: PackagingItem[] = [
  {
    id: "pkg-coca-cola-500",
    manufacturerId: "org-coca-cola",
    name: "Coca-Cola 500ml",
    sku: "COKE-500",
    market: "Germany",
    packagingType: "Bottle",
    componentIds: [
      "pkgc-coke-500-bottle",
      "pkgc-coke-500-label",
      "pkgc-coke-500-cap",
    ],
    createdAt: "2026-08-01",
  },
];
