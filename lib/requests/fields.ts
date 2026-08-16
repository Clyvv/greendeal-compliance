// Stage 4 — Selective Data Request field registry.
//
// The requestable, non-evidence fields a manufacturer can ask a
// supplier for, grouped by DOMAIN.md §2 section. Product Name and SKU
// are deliberately excluded — they're already visible reference-level
// info on the Packaging Item Details page (AGENTS.md §6), so
// re-offering them as "requestable" would be misleading. Evidence
// documents aren't listed here: they're rendered from the actual
// Evidence records for the product version (see
// mockProductService.getProductEvidence), never a hardcoded list, so a
// product's evidence checklist always matches what really exists.
export type RequestableFieldSectionKey =
  | "IDENTIFICATION"
  | "PHYSICAL"
  | "CIRCULARITY"
  | "CHEMICAL"
  | "SPECIALIZED";

export interface RequestableFieldSection {
  key: RequestableFieldSectionKey;
  title: string;
  fields: string[];
}

export const REQUESTABLE_FIELD_SECTIONS: RequestableFieldSection[] = [
  {
    key: "IDENTIFICATION",
    title: "Identification",
    fields: ["GTIN", "Country of Origin"],
  },
  {
    key: "PHYSICAL",
    title: "Physical & Structural",
    fields: ["Material Composition", "Net Weight", "Dimensions", "Thickness"],
  },
  {
    key: "CIRCULARITY",
    title: "Circularity & PPWR",
    fields: [
      "Total Recycled Content",
      "PCR",
      "Pre-Consumer Recycled Content",
      "DfR Grade",
    ],
  },
  {
    key: "CHEMICAL",
    title: "Chemical Safety",
    fields: ["Heavy Metals", "PFAS", "REACH", "SCIP", "RoHS"],
  },
  {
    key: "SPECIALIZED",
    title: "Specialized Domain",
    fields: ["FCM", "OML", "Sterilization"],
  },
];

/** Every requestable field label across all non-evidence sections, flattened. */
export const ALL_REQUESTABLE_FIELDS: string[] = REQUESTABLE_FIELD_SECTIONS.flatMap(
  (section) => section.fields
);

// Sensible pre-checked defaults matching AGENTS.md's Stage 4 demo
// script (PPWR assessment on the PET Bottle component) — every
// checkbox stays freely toggleable in the UI, this is just the
// starting selection, not a fixed script.
export const DEFAULT_SELECTED_FIELDS: string[] = [
  "Material Composition",
  "Net Weight",
  "Dimensions",
  "Thickness",
  "Total Recycled Content",
  "PCR",
  "Pre-Consumer Recycled Content",
  "DfR Grade",
  "PFAS",
  "REACH",
];

// Evidence documents pre-checked by default per the same demo script —
// matched by documentName against whichever Evidence records actually
// exist for the product version being requested from. Anything not
// present for a given product is simply not offered, never invented.
export const DEFAULT_SELECTED_EVIDENCE_DOCUMENT_NAMES: string[] = [
  "Recycled Content Certificate.pdf",
  "Material Certificate.pdf",
];
