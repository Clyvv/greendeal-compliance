import type { FieldStatus } from "@/lib/types";

/**
 * One added Evidence record within the Create Product wizard (Stage
 * 1b, Step 6). `id` is a client-local id used for list keys/removal
 * only — a real Evidence id is minted when the product is submitted.
 * File upload is mocked per the Stage 1b prompt: selecting a file only
 * captures its filename into `documentName`, nothing is uploaded/parsed.
 */
export interface EvidenceDraft {
  id: string;
  documentName: string;
  evidenceType: string;
  issuingAuthority: string;
  issueDate: string; // ISO date, from <input type="date">
  expirationDate: string; // ISO date
  supportedAttributes: string[];
}

/**
 * The Create Product wizard's draft form state. Deliberately keeps
 * every field as a raw string (or FieldStatus) rather than the final
 * typed PhysicalProperties/CircularityMetrics/etc. shapes — this makes
 * "was this field actually touched" unambiguous (an empty string is
 * clearly untouched, whereas a parsed `0` is not: e.g. Total Recycled
 * Content % of 0 is a legitimate real answer, not a sign the field was
 * skipped). See lib/wizard/mapping.ts for the conversion to the real
 * domain types on submit, and lib/wizard/completeness.ts for why this
 * shape matters for the completeness calculation.
 */
export interface ProductWizardFormState {
  // Step 1 — Product & Supplier Identification (DOMAIN.md §2 Section 1).
  // Batch/Lot Number is intentionally NOT collected — it belongs to a
  // Production Batch, not the product (see this stage's prompt).
  name: string;
  sku: string;
  gtin: string;
  countryOfOrigin: string;

  // Step 2 — Physical & Structural Properties (Section 2).
  materialFamily: string;
  specificMaterial: string;
  netWeightGrams: string;
  dimensions: string;
  thicknessMm: string;
  packagingFunction: string;

  // Step 3 — Circularity & PPWR Metrics (Section 3).
  totalRecycledContentPercent: string;
  pcrYieldPercent: string;
  preConsumerYieldPercent: string;
  dfrGrade: string;
  reusabilityStatus: string;

  // Step 4 — Chemical Safety & Substance Restrictions (Section 4).
  heavyMetalPpm: string;
  pfasStatus: FieldStatus;
  pfasIntentionallyAdded: "" | "true" | "false"; // "" = unknown/not provided
  reachSvhcStatus: FieldStatus;
  scipCode: string;
  rohsStatus: FieldStatus;

  // Step 5 — Specialized Domain Metrics (Section 5).
  fcmStatus: FieldStatus;
  omlTestScore: string;
  sterilizationProfile: string;

  // Step 6 — Evidence & Governance (Section 6).
  evidenceDrafts: EvidenceDraft[];
}

export function createInitialWizardFormState(): ProductWizardFormState {
  return {
    name: "",
    sku: "",
    gtin: "",
    countryOfOrigin: "",

    materialFamily: "",
    specificMaterial: "",
    netWeightGrams: "",
    dimensions: "",
    thicknessMm: "",
    packagingFunction: "",

    totalRecycledContentPercent: "",
    pcrYieldPercent: "",
    preConsumerYieldPercent: "",
    dfrGrade: "",
    reusabilityStatus: "",

    heavyMetalPpm: "",
    // New fields default to NOT_PROVIDED, not NOT_APPLICABLE — the
    // supplier hasn't made any determination yet on a fresh draft, and
    // NOT_APPLICABLE should be a deliberate choice, not an assumed one.
    pfasStatus: "NOT_PROVIDED",
    pfasIntentionallyAdded: "",
    reachSvhcStatus: "NOT_PROVIDED",
    scipCode: "",
    rohsStatus: "NOT_PROVIDED",

    fcmStatus: "NOT_PROVIDED",
    omlTestScore: "",
    sterilizationProfile: "",

    evidenceDrafts: [],
  };
}

export type WizardFieldSetter = <K extends keyof ProductWizardFormState>(
  key: K,
  value: ProductWizardFormState[K]
) => void;
