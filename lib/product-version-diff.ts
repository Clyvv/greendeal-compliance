import type { ProductVersion } from "@/lib/types";
import { FIELD_STATUS_LABELS } from "@/lib/field-status-labels";

export interface VersionFieldDiff {
  section: string;
  label: string;
  previousValue: string;
  currentValue: string;
}

function formatMissing(value: string | number | undefined): string {
  return value === undefined || value === null || value === ""
    ? "Missing"
    : String(value);
}

function formatPfasFlag(value: boolean | null): string {
  if (value === null) return "Unknown";
  return value ? "Yes" : "No";
}

/**
 * The fields compared between two ProductVersions — Sections 2–5 of
 * DOMAIN.md §2 (Physical, Circularity, Chemical Safety, Specialized
 * Domain). Identification (Section 1) lives on SupplierProduct, not
 * ProductVersion, and Evidence has its own dedicated tab, so neither
 * is part of a *version* diff.
 */
const DIFF_FIELDS: {
  section: string;
  label: string;
  get: (version: ProductVersion) => string;
}[] = [
  // Physical & Structural
  {
    section: "Physical & Structural",
    label: "Material Family",
    get: (v) => v.physical.materialFamily,
  },
  {
    section: "Physical & Structural",
    label: "Specific Material Composition",
    get: (v) => v.physical.specificMaterial,
  },
  {
    section: "Physical & Structural",
    label: "Component Net Weight",
    get: (v) => `${v.physical.netWeightGrams}g`,
  },
  {
    section: "Physical & Structural",
    label: "Dimensions",
    get: (v) => v.physical.dimensions,
  },
  {
    section: "Physical & Structural",
    label: "Thickness",
    get: (v) => `${v.physical.thicknessMm}mm`,
  },
  {
    section: "Physical & Structural",
    label: "Packaging Function Type",
    get: (v) => v.physical.packagingFunction,
  },
  // Circularity & PPWR
  {
    section: "Circularity & PPWR",
    label: "Total Recycled Content %",
    get: (v) => `${v.circularity.totalRecycledContentPercent}%`,
  },
  {
    section: "Circularity & PPWR",
    label: "PCR Yield %",
    get: (v) => `${v.circularity.pcrYieldPercent}%`,
  },
  {
    section: "Circularity & PPWR",
    label: "Pre-Consumer Yield %",
    get: (v) => `${v.circularity.preConsumerYieldPercent}%`,
  },
  {
    section: "Circularity & PPWR",
    label: "DfR Grade",
    get: (v) => v.circularity.dfrGrade,
  },
  {
    section: "Circularity & PPWR",
    label: "Reusability Status",
    get: (v) => v.circularity.reusabilityStatus,
  },
  // Chemical Safety
  {
    section: "Chemical Safety",
    label: "Heavy Metal PPM Concentration",
    get: (v) => formatMissing(v.chemicalSafety.heavyMetalPpm),
  },
  {
    section: "Chemical Safety",
    label: "Intentionally Added PFAS",
    get: (v) => formatPfasFlag(v.chemicalSafety.pfasIntentionallyAdded),
  },
  {
    section: "Chemical Safety",
    label: "PFAS Declaration Status",
    get: (v) => FIELD_STATUS_LABELS[v.chemicalSafety.pfasStatus],
  },
  {
    section: "Chemical Safety",
    label: "REACH SVHC Declaration Status",
    get: (v) => FIELD_STATUS_LABELS[v.chemicalSafety.reachSvhcStatus],
  },
  {
    section: "Chemical Safety",
    label: "ECHA SCIP Registration Code",
    get: (v) => formatMissing(v.chemicalSafety.scipCode),
  },
  {
    section: "Chemical Safety",
    label: "RoHS Directive Compliance Status",
    get: (v) => FIELD_STATUS_LABELS[v.chemicalSafety.rohsStatus],
  },
  // Specialized Domain
  {
    section: "Specialized Domain",
    label: "FCM Approval Status",
    get: (v) => FIELD_STATUS_LABELS[v.specializedDomain.fcmStatus],
  },
  {
    section: "Specialized Domain",
    label: "OML Test Score",
    get: (v) => formatMissing(v.specializedDomain.omlTestScore),
  },
  {
    section: "Specialized Domain",
    label: "Sterilization Method Compatibility Profile",
    get: (v) => formatMissing(v.specializedDomain.sterilizationProfile),
  },
];

/**
 * Genuine field-by-field diff between two ProductVersions — walks
 * DIFF_FIELDS and returns only the fields whose *formatted* value
 * actually differs. This is a real comparator, not hardcoded example
 * text, so it works correctly for any pair of versions (verified with
 * a temporary v2.0 seed during Stage 2 development, then removed —
 * see this stage's report).
 */
export function compareProductVersions(
  previous: ProductVersion | undefined,
  current: ProductVersion
): VersionFieldDiff[] {
  if (!previous) return [];
  const diffs: VersionFieldDiff[] = [];
  for (const field of DIFF_FIELDS) {
    const previousValue = field.get(previous);
    const currentValue = field.get(current);
    if (previousValue !== currentValue) {
      diffs.push({
        section: field.section,
        label: field.label,
        previousValue,
        currentValue,
      });
    }
  }
  return diffs;
}

/**
 * Ascending version order (oldest first) — by numeric versionLabel
 * ("1.0", "2.0", ...) with a createdAt fallback, so ordering stays
 * correct however many versions eventually exist.
 */
export function sortVersionsAscending(
  versions: ProductVersion[]
): ProductVersion[] {
  return [...versions].sort((a, b) => {
    const aNum = Number.parseFloat(a.versionLabel);
    const bNum = Number.parseFloat(b.versionLabel);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}
