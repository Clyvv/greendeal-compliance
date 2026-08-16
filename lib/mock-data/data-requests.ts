import type { DataRequest } from "@/lib/types";

// Seed narrative (see packaging-components.ts) — all three components
// of Coca-Cola 500ml have already been through Stage 4's request flow,
// each requesting every requestable field (DOMAIN.md §2 sections 1–5,
// via the same field-key labels lib/requests/fields.ts uses) plus
// every evidence document on file for that product (lib/mock-data/evidence.ts).
// All three ended up APPROVED in full (see data-approvals.ts) — no
// denials in this seed story, so Stage 6's readiness view and Stage 7
// onward start from complete, authorized data. Field lists are written
// out directly (not imported from lib/requests/fields.ts) to keep this
// mock-data file self-contained static data, same as every other file
// in this folder.
const ALL_FIELDS = [
  "GTIN",
  "Country of Origin",
  "Material Composition",
  "Net Weight",
  "Dimensions",
  "Thickness",
  "Total Recycled Content",
  "PCR",
  "Pre-Consumer Recycled Content",
  "DfR Grade",
  "Heavy Metals",
  "PFAS",
  "REACH",
  "SCIP",
  "RoHS",
  "FCM",
  "OML",
  "Sterilization",
];

export const dataRequests: DataRequest[] = [
  {
    id: "dr-1",
    requestingOrgId: "org-coca-cola",
    supplierOrgId: "org-pet-solutions",
    supplierProductId: "prod-pet-bottle-500",
    packagingItemId: "pkg-coca-cola-500",
    requestedAttributes: [
      ...ALL_FIELDS,
      "Recycled Content Certificate.pdf",
      "Material Certificate.pdf",
      "Technical Data Sheet.pdf",
    ],
    purpose: "PPWR assessment for Coca-Cola 500ml",
    requestDate: "2026-08-12",
    status: "APPROVED",
  },
  {
    id: "dr-2",
    requestingOrgId: "org-coca-cola",
    supplierOrgId: "org-labeltech",
    supplierProductId: "prod-coca-cola-label-500",
    packagingItemId: "pkg-coca-cola-500",
    requestedAttributes: [
      ...ALL_FIELDS,
      "Material Certificate.pdf",
      "Technical Data Sheet.pdf",
    ],
    purpose: "PPWR assessment for Coca-Cola 500ml",
    requestDate: "2026-08-12",
    status: "APPROVED",
  },
  {
    id: "dr-3",
    requestingOrgId: "org-coca-cola",
    supplierOrgId: "org-polycap",
    supplierProductId: "prod-pp-cap-28",
    packagingItemId: "pkg-coca-cola-500",
    requestedAttributes: [
      ...ALL_FIELDS,
      "Material Certificate.pdf",
      "Recycled Content Certificate.pdf",
    ],
    purpose: "PPWR assessment for Coca-Cola 500ml",
    requestDate: "2026-08-12",
    status: "APPROVED",
  },
];
