import type { Organization } from "@/lib/types";

// Sample organizations — see DOMAIN.md §4. Reused as-is across every
// later stage; do not fork a parallel data set.
export const organizations: Organization[] = [
  { id: "org-coca-cola", name: "Coca-Cola", type: "MANUFACTURER" },
  { id: "org-pet-solutions", name: "PET Solutions GmbH", type: "SUPPLIER" },
  { id: "org-labeltech", name: "LabelTech GmbH", type: "SUPPLIER" },
  { id: "org-polycap", name: "PolyCap GmbH", type: "SUPPLIER" },
];
