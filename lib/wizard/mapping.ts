import type { CreateSupplierProductInput } from "@/lib/services/mockProductService";
import { calculateCompletenessPercent } from "./completeness";
import type { ProductWizardFormState } from "./types";

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return value.trim() !== "" && !Number.isNaN(parsed) ? parsed : fallback;
}

function toOptionalNumber(value: string): number | undefined {
  const parsed = Number(value);
  return value.trim() !== "" && !Number.isNaN(parsed) ? parsed : undefined;
}

function toOptionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toPfasFlag(
  value: ProductWizardFormState["pfasIntentionallyAdded"]
): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/**
 * Converts the wizard's raw draft state into the payload
 * createSupplierProduct() expects, parsing strings into the real
 * PhysicalProperties/CircularityMetrics/etc. shapes.
 *
 * Note on numeric defaults: netWeightGrams/thicknessMm and the
 * circularity percentages are required (non-optional) numbers on the
 * final domain types, so a blank input becomes 0 here. That's a safe
 * convention for these specific fields (a real packaging component
 * never legitimately weighs 0g), and it doesn't distort the
 * completeness calculation, which reads "was this touched" from the
 * wizard's own string state (see lib/wizard/completeness.ts) — not
 * from this parsed 0.
 */
export function toCreateSupplierProductInput(
  form: ProductWizardFormState
): CreateSupplierProductInput {
  return {
    name: form.name.trim(),
    sku: form.sku.trim(),
    gtin: toOptionalString(form.gtin),
    countryOfOrigin: toOptionalString(form.countryOfOrigin),
    physical: {
      materialFamily: form.materialFamily.trim(),
      specificMaterial: form.specificMaterial.trim(),
      netWeightGrams: toNumber(form.netWeightGrams),
      dimensions: form.dimensions.trim(),
      thicknessMm: toNumber(form.thicknessMm),
      packagingFunction: form.packagingFunction.trim(),
    },
    circularity: {
      totalRecycledContentPercent: toNumber(form.totalRecycledContentPercent),
      pcrYieldPercent: toNumber(form.pcrYieldPercent),
      preConsumerYieldPercent: toNumber(form.preConsumerYieldPercent),
      dfrGrade: form.dfrGrade.trim(),
      reusabilityStatus: form.reusabilityStatus.trim(),
    },
    chemicalSafety: {
      heavyMetalPpm: toOptionalNumber(form.heavyMetalPpm),
      pfasStatus: form.pfasStatus,
      pfasIntentionallyAdded: toPfasFlag(form.pfasIntentionallyAdded),
      reachSvhcStatus: form.reachSvhcStatus,
      scipCode: toOptionalString(form.scipCode),
      rohsStatus: form.rohsStatus,
    },
    specializedDomain: {
      fcmStatus: form.fcmStatus,
      omlTestScore: toOptionalString(form.omlTestScore),
      sterilizationProfile: toOptionalString(form.sterilizationProfile),
    },
    evidence: form.evidenceDrafts.map((draft) => ({
      documentName: draft.documentName.trim(),
      evidenceType: draft.evidenceType.trim(),
      issuingAuthority: draft.issuingAuthority.trim(),
      issueDate: draft.issueDate,
      expirationDate: draft.expirationDate,
      // Newly-submitted evidence starts VALID; a verification workflow
      // (PENDING_VERIFICATION → VERIFIED/EXPIRED) is a later concern.
      status: "VALID" as const,
      supportedAttributes: draft.supportedAttributes,
    })),
    completenessPercent: calculateCompletenessPercent(form),
  };
}

/**
 * Field labels (matching DOMAIN.md §2's own wording) for every
 * scoreable field, used by Step 6 (Evidence) to build the "which
 * fields already entered does this evidence support" multi-select —
 * only fields the supplier has actually filled in are offered.
 */
const FIELD_LABELS: {
  key: keyof ProductWizardFormState;
  label: string;
  kind: "text" | "status";
}[] = [
  { key: "gtin", label: "GTIN / EAN", kind: "text" },
  { key: "countryOfOrigin", label: "Country of Origin", kind: "text" },
  { key: "materialFamily", label: "Material Family", kind: "text" },
  {
    key: "specificMaterial",
    label: "Specific Material Composition",
    kind: "text",
  },
  { key: "netWeightGrams", label: "Component Net Weight", kind: "text" },
  { key: "dimensions", label: "Dimensions", kind: "text" },
  { key: "thicknessMm", label: "Thickness", kind: "text" },
  { key: "packagingFunction", label: "Packaging Function Type", kind: "text" },
  {
    key: "totalRecycledContentPercent",
    label: "Total Recycled Content %",
    kind: "text",
  },
  { key: "pcrYieldPercent", label: "PCR Yield %", kind: "text" },
  {
    key: "preConsumerYieldPercent",
    label: "Pre-Consumer Yield %",
    kind: "text",
  },
  { key: "dfrGrade", label: "DfR Grade", kind: "text" },
  { key: "reusabilityStatus", label: "Reusability Status", kind: "text" },
  {
    key: "heavyMetalPpm",
    label: "Heavy Metal PPM Concentration",
    kind: "text",
  },
  {
    key: "pfasStatus",
    label: "Intentionally Added PFAS Flag",
    kind: "status",
  },
  {
    key: "reachSvhcStatus",
    label: "REACH SVHC Declaration Status",
    kind: "status",
  },
  { key: "scipCode", label: "ECHA SCIP Registration Code", kind: "text" },
  {
    key: "rohsStatus",
    label: "RoHS Directive Compliance Status",
    kind: "status",
  },
  {
    key: "fcmStatus",
    label: "Food Contact Material (FCM) Approval Status",
    kind: "status",
  },
  {
    key: "omlTestScore",
    label: "Overall Migration Limit (OML) Test Score",
    kind: "text",
  },
  {
    key: "sterilizationProfile",
    label: "Sterilization Method Compatibility Profile",
    kind: "text",
  },
];

export function getEnteredFieldLabels(form: ProductWizardFormState): string[] {
  return FIELD_LABELS.filter(({ key, kind }) => {
    const value = form[key];
    if (kind === "status") return (value as string) !== "NOT_PROVIDED";
    return typeof value === "string" && value.trim().length > 0;
  }).map(({ label }) => label);
}
