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

// Stage 5 — Supplier Approval needs to redisplay a DataRequest's
// already-submitted requestedAttributes grouped by section, exactly
// like Stage 4's Request Summary screen. requestedAttributes is a
// flat string[] on the DataRequest record (DOMAIN.md §3), so this
// groups it back up using the same field registry above. Anything not
// matched to a known field (i.e. an evidence document name, which is
// never enumerable statically — see the comment at the top of this
// file) is bucketed into a synthetic "Evidence" group instead of being
// dropped, so nothing requested is ever silently omitted from display.
export const EVIDENCE_GROUP_KEY = "EVIDENCE";
const EVIDENCE_GROUP_TITLE = "Evidence";

export interface GroupedRequestedAttributes {
  key: string;
  title: string;
  attributes: string[];
}

/**
 * Groups a DataRequest's requestedAttributes by section for display —
 * pulls the actual set of requested attributes straight from the
 * DataRequest record passed in, never recomputes or guesses which
 * fields were requested from defaults/current product data.
 */
export function groupRequestedAttributesBySection(
  requestedAttributes: string[]
): GroupedRequestedAttributes[] {
  const fieldToSection = new Map<string, RequestableFieldSection>();
  for (const section of REQUESTABLE_FIELD_SECTIONS) {
    for (const field of section.fields) {
      fieldToSection.set(field, section);
    }
  }

  const groupsByKey = new Map<string, GroupedRequestedAttributes>();
  for (const attribute of requestedAttributes) {
    const section = fieldToSection.get(attribute);
    const key = section?.key ?? EVIDENCE_GROUP_KEY;
    const title = section?.title ?? EVIDENCE_GROUP_TITLE;
    if (!groupsByKey.has(key)) {
      groupsByKey.set(key, { key, title, attributes: [] });
    }
    groupsByKey.get(key)!.attributes.push(attribute);
  }

  // Preserve the same section order as Stage 4's Select Fields screen,
  // with Evidence last.
  const orderedKeys: string[] = [
    ...REQUESTABLE_FIELD_SECTIONS.map((section) => section.key),
    EVIDENCE_GROUP_KEY,
  ];
  return orderedKeys
    .map((key) => groupsByKey.get(key))
    .filter((group): group is GroupedRequestedAttributes => Boolean(group));
}
