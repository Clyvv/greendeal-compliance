import type { Organization } from "@/lib/types";
import { generateSupplierSlug } from "@/lib/organization-utils";

// Sample organizations — see DOMAIN.md §4. Reused as-is across every
// later stage; do not fork a parallel data set.
//
// Stage 7.4 — `slug` is generated here (never hand-typed) via
// lib/organization-utils.ts, so it's genuinely deterministic from each
// supplier's name rather than an arbitrary literal that happens to
// match: "PET Solutions GmbH" -> "pet-solutions", "LabelTech GmbH" ->
// "labeltech", "PolyCap GmbH" -> "polycap". Manufacturers don't get one
// — a Public Request Link only ever exists for a Supplier.
const seedOrganizations: Omit<Organization, "slug">[] = [
  { id: "org-coca-cola", name: "Coca-Cola", type: "MANUFACTURER" },
  { id: "org-pet-solutions", name: "PET Solutions GmbH", type: "SUPPLIER" },
  { id: "org-labeltech", name: "LabelTech GmbH", type: "SUPPLIER" },
  { id: "org-polycap", name: "PolyCap GmbH", type: "SUPPLIER" },
];

export const organizations: Organization[] = seedOrganizations.map((org) => ({
  ...org,
  slug: org.type === "SUPPLIER" ? generateSupplierSlug(org.name) : undefined,
}));
