import type { ProductVersion } from "@/lib/types";

// One published v1.0 ProductVersion per sample product — see
// DOMAIN.md §5. Fields not called out in DOMAIN.md's shorthand sample
// data (e.g. a paper label's exact dimensions, or chemical-safety /
// specialized-domain data that hasn't been submitted yet) are recorded
// honestly via FieldStatus (NOT_PROVIDED / NOT_APPLICABLE) rather than
// invented — this is what drives the "complete vs incomplete" split on
// the supplier dashboard.
export const productVersions: ProductVersion[] = [
  // PET Bottle 500ml — the fully-compliant flagship example.
  {
    id: "pv-pet-bottle-500-v1",
    productId: "prod-pet-bottle-500",
    versionLabel: "1.0",
    createdAt: "2026-08-10",
    changeSummary: "Initial published version.",
    physical: {
      materialFamily: "Plastic",
      specificMaterial: "PET",
      netWeightGrams: 18.2,
      dimensions: "65mm × 65mm × 210mm",
      thicknessMm: 0.35,
      packagingFunction: "Primary Packaging",
    },
    circularity: {
      totalRecycledContentPercent: 35,
      pcrYieldPercent: 30,
      preConsumerYieldPercent: 5,
      dfrGrade: "A",
      reusabilityStatus: "Not reusable",
    },
    chemicalSafety: {
      pfasStatus: "VERIFIED",
      pfasIntentionallyAdded: false,
      reachSvhcStatus: "VERIFIED",
      rohsStatus: "VERIFIED",
    },
    specializedDomain: {
      fcmStatus: "VERIFIED",
    },
    evidenceIds: [
      "ev-pet-bottle-recycled-cert",
      "ev-pet-bottle-material-cert",
      "ev-pet-bottle-tds",
    ],
  },

  // Coca-Cola Label 500ml — sparser data: no chemical-safety /
  // specialized-domain submission yet.
  {
    id: "pv-coca-cola-label-500-v1",
    productId: "prod-coca-cola-label-500",
    versionLabel: "1.0",
    createdAt: "2026-07-22",
    changeSummary: "Initial published version.",
    physical: {
      materialFamily: "Paper",
      specificMaterial: "Paper",
      netWeightGrams: 0.8,
      dimensions: "148mm × 95mm",
      thicknessMm: 0.08,
      packagingFunction: "Label",
    },
    circularity: {
      totalRecycledContentPercent: 0,
      pcrYieldPercent: 0,
      preConsumerYieldPercent: 0,
      dfrGrade: "Recyclable", // DOMAIN.md §5: "Recyclability: Recyclable" (no letter grade given)
      reusabilityStatus: "Not reusable",
    },
    chemicalSafety: {
      pfasStatus: "NOT_PROVIDED",
      pfasIntentionallyAdded: null,
      reachSvhcStatus: "NOT_PROVIDED",
      rohsStatus: "NOT_PROVIDED",
    },
    specializedDomain: {
      fcmStatus: "NOT_APPLICABLE", // an outer paper label is not itself food-contact material
    },
    evidenceIds: ["ev-label-material-cert", "ev-label-tds"],
  },

  // PP Cap 28mm — physical/circularity provided, chemical-safety /
  // specialized-domain not yet submitted.
  {
    id: "pv-pp-cap-28-v1",
    productId: "prod-pp-cap-28",
    versionLabel: "1.0",
    createdAt: "2026-08-05",
    changeSummary: "Initial published version.",
    physical: {
      materialFamily: "Plastic",
      specificMaterial: "PP",
      netWeightGrams: 2.1,
      dimensions: "Ø28mm",
      thicknessMm: 0.6,
      packagingFunction: "Closure",
    },
    circularity: {
      totalRecycledContentPercent: 10,
      pcrYieldPercent: 10,
      preConsumerYieldPercent: 0,
      dfrGrade: "A",
      reusabilityStatus: "Not reusable",
    },
    chemicalSafety: {
      pfasStatus: "NOT_PROVIDED",
      pfasIntentionallyAdded: null,
      reachSvhcStatus: "NOT_PROVIDED",
      rohsStatus: "NOT_PROVIDED",
    },
    specializedDomain: {
      fcmStatus: "NOT_PROVIDED", // a cap does contact the beverage at pour — relevant, just not yet submitted
    },
    evidenceIds: ["ev-cap-material-cert", "ev-cap-recycled-cert"],
  },
];
