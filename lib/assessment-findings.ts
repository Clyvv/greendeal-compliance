import type {
  ChemicalSafetyData,
  CircularityMetrics,
  ComplianceAssessment,
  Evidence,
  Finding,
  PhysicalProperties,
} from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/status-pill";
import { getEffectiveEvidenceStatus } from "@/lib/evidence-utils";
import {
  summarizeReadiness,
  type ComponentReadiness,
} from "@/lib/readiness";

// Stage 7 — Simplified PPWR Assessment.
//
// IMPORTANT: everything in this file is an illustrative, simplified
// heuristic for demonstrating the assessment UX/architecture — it is
// explicitly NOT a real PPWR regulatory rules engine (see AGENTS.md §2
// and this stage's prompt). Thresholds/checks below are chosen to be
// simple, clearly commented, and genuinely responsive to real
// authorization/data state — never to be mistaken for legal advice.

/** The six assessment sections shown on the Results page — findings
 * are keyed by these exact strings (DOMAIN.md §3's
 * `Record<string, Finding>`). */
export const ASSESSMENT_SECTIONS = [
  "Material Composition",
  "Recycled Content",
  "Recyclability",
  "Chemical Safety",
  "Required Evidence",
  "Data Completeness",
] as const;

export type AssessmentSection = (typeof ASSESSMENT_SECTIONS)[number];

/** Everything computeAssessmentFindings needs about one packaging
 * component — the caller (mockAssessmentService) gathers this from
 * mockPackagingService/mockProductService/mockRequestService; this
 * module only ever reasons about it, never fetches anything itself. */
export interface ComponentAssessmentInput {
  componentId: string;
  /** From mockRequestService.getAuthorizedData — the only fields this
   * computation is allowed to actually read a real value for (AGENTS.md
   * §7). A field absent here must never influence a finding towards
   * PASS, no matter what the underlying mock data actually contains. */
  authorizedAttributes: string[];
  physical: PhysicalProperties;
  circularity: CircularityMetrics;
  chemicalSafety: ChemicalSafetyData;
  evidenceItems: Evidence[];
  /** Stage 6's own per-component readiness computation — reused
   * directly for the "Data Completeness" section below rather than
   * re-derived. */
  readiness: ComponentReadiness;
}

function fieldCoverage(
  components: ComponentAssessmentInput[],
  field: string
): { authorizedCount: number; total: number } {
  const total = components.length;
  const authorizedCount = components.filter((component) =>
    component.authorizedAttributes.includes(field)
  ).length;
  return { authorizedCount, total };
}

/** Simple three-way split shared by most sections below: nothing
 * authorized yet -> MISSING, everything authorized -> PASS, partial ->
 * WARNING. Sections with a real (illustrative) data check layer this
 * on top rather than replace it. */
function coverageFinding(authorizedCount: number, total: number): Finding {
  if (total === 0 || authorizedCount === 0) return "MISSING";
  if (authorizedCount < total) return "WARNING";
  return "PASS";
}

// --- Material Composition ---------------------------------------------
// Presence/authorization-based only — this deliberately does not judge
// *which* material is used (that would be inventing regulatory
// judgment); it only checks Coca-Cola actually has authorized access
// to each component's Material Composition field.
function findMaterialComposition(components: ComponentAssessmentInput[]): Finding {
  const { authorizedCount, total } = fieldCoverage(components, "Material Composition");
  return coverageFinding(authorizedCount, total);
}

// --- Recycled Content ----------------------------------------------------
// Only once every component's "Total Recycled Content" is authorized
// does this attempt a real calculation — the same weight-weighted
// average DOMAIN.md §7 uses (Stage 8 will show the full math; here the
// result only decides a Finding). Net Weight is only read if it's ALSO
// authorized for every component; otherwise falls back to a simple
// unweighted average rather than reading an unauthorized field.
const ILLUSTRATIVE_MIN_RECYCLED_CONTENT_PERCENT = 30; // demo-only placeholder — NOT a real legal minimum

function findRecycledContent(components: ComponentAssessmentInput[]): Finding {
  const { authorizedCount, total } = fieldCoverage(components, "Total Recycled Content");
  if (total === 0 || authorizedCount === 0) return "MISSING";
  if (authorizedCount < total) return "WARNING";

  const netWeightAuthorizedForAll = components.every((component) =>
    component.authorizedAttributes.includes("Net Weight")
  );

  let overallPercent: number;
  if (netWeightAuthorizedForAll) {
    const totalWeight = components.reduce((sum, c) => sum + c.physical.netWeightGrams, 0);
    const recycledWeight = components.reduce(
      (sum, c) => sum + c.physical.netWeightGrams * (c.circularity.totalRecycledContentPercent / 100),
      0
    );
    overallPercent = totalWeight > 0 ? (recycledWeight / totalWeight) * 100 : 0;
  } else {
    overallPercent =
      components.reduce((sum, c) => sum + c.circularity.totalRecycledContentPercent, 0) /
      components.length;
  }

  return overallPercent >= ILLUSTRATIVE_MIN_RECYCLED_CONTENT_PERCENT ? "PASS" : "WARNING";
}

// --- Recyclability -------------------------------------------------------
// Based on DfR Grade presence/authorization only — again, no judgment
// on *which* grade is "good enough" (that's a real regulatory
// question this prototype explicitly does not answer).
function findRecyclability(components: ComponentAssessmentInput[]): Finding {
  const { authorizedCount, total } = fieldCoverage(components, "DfR Grade");
  if (total === 0 || authorizedCount === 0) return "MISSING";
  if (authorizedCount < total) return "WARNING";
  const allPresent = components.every((component) => Boolean(component.circularity.dfrGrade?.trim()));
  return allPresent ? "PASS" : "WARNING";
}

// --- Chemical Safety -------------------------------------------------------
// Covers all five CHEMICAL fields (Heavy Metals, PFAS, REACH, SCIP,
// RoHS). The only real "compliance judgments" made here are
// deliberately conservative/uncontroversial illustrative red flags —
// intentionally-added PFAS, or an EXPIRED substance declaration.
// Otherwise this only distinguishes "authorized to see" (an access
// question) from "the supplier actually provided/verified the value"
// (a FieldStatus question) — being authorized to see a field the
// supplier never actually filled in is still a real gap, not a PASS.
const CHEMICAL_FIELDS = ["Heavy Metals", "PFAS", "REACH", "SCIP", "RoHS"];

function findChemicalSafety(components: ComponentAssessmentInput[]): Finding {
  const coverages = CHEMICAL_FIELDS.map((field) => fieldCoverage(components, field));
  const totalAuthorized = coverages.reduce((sum, c) => sum + c.authorizedCount, 0);
  const totalPossible = coverages.reduce((sum, c) => sum + c.total, 0);
  if (totalAuthorized === 0) return "MISSING";

  const hasRedFlag = components.some((component) => {
    const { authorizedAttributes, chemicalSafety } = component;
    if (authorizedAttributes.includes("PFAS") && chemicalSafety.pfasIntentionallyAdded === true) {
      return true;
    }
    if (authorizedAttributes.includes("REACH") && chemicalSafety.reachSvhcStatus === "EXPIRED") {
      return true;
    }
    if (authorizedAttributes.includes("RoHS") && chemicalSafety.rohsStatus === "EXPIRED") {
      return true;
    }
    return false;
  });
  if (hasRedFlag) return "FAIL";

  if (totalAuthorized < totalPossible) return "WARNING";

  const allProvided = components.every((component) => {
    const { authorizedAttributes, chemicalSafety } = component;
    const checks: boolean[] = [];
    if (authorizedAttributes.includes("Heavy Metals")) {
      checks.push(typeof chemicalSafety.heavyMetalPpm === "number");
    }
    if (authorizedAttributes.includes("PFAS")) {
      checks.push(chemicalSafety.pfasStatus === "VERIFIED" || chemicalSafety.pfasStatus === "PROVIDED");
    }
    if (authorizedAttributes.includes("REACH")) {
      checks.push(
        chemicalSafety.reachSvhcStatus === "VERIFIED" || chemicalSafety.reachSvhcStatus === "PROVIDED"
      );
    }
    if (authorizedAttributes.includes("SCIP")) {
      checks.push(Boolean(chemicalSafety.scipCode?.trim()));
    }
    if (authorizedAttributes.includes("RoHS")) {
      checks.push(chemicalSafety.rohsStatus === "VERIFIED" || chemicalSafety.rohsStatus === "PROVIDED");
    }
    return checks.length > 0 && checks.every(Boolean);
  });

  return allProvided ? "PASS" : "WARNING";
}

// --- Required Evidence -----------------------------------------------------
// A component needs at least one AUTHORIZED evidence document whose
// *effective* status (lib/evidence-utils.ts — expiration-aware, not
// the possibly-stale stored status) is currently VALID.
function findRequiredEvidence(components: ComponentAssessmentInput[]): Finding {
  if (components.length === 0) return "MISSING";

  let anyAuthorized = false;
  let allCleanlyAuthorized = true;

  for (const component of components) {
    const authorizedEvidence = component.evidenceItems.filter((item) =>
      component.authorizedAttributes.includes(item.documentName)
    );
    if (authorizedEvidence.length === 0) {
      allCleanlyAuthorized = false;
      continue;
    }
    anyAuthorized = true;
    const anyCurrentlyValid = authorizedEvidence.some(
      (item) => getEffectiveEvidenceStatus(item) === "VALID"
    );
    if (!anyCurrentlyValid) allCleanlyAuthorized = false;
  }

  if (!anyAuthorized) return "MISSING";
  return allCleanlyAuthorized ? "PASS" : "WARNING";
}

// --- Data Completeness -----------------------------------------------------
// Directly reuses Stage 6's own readiness computation rather than
// re-deriving a second notion of "complete" — this section IS Stage
// 6's Packaging Data Completeness view, expressed as a single Finding.
function findDataCompleteness(components: ComponentAssessmentInput[]): Finding {
  const summary = summarizeReadiness(components.map((component) => component.readiness));
  if (summary.totalSatisfied === 0) return "MISSING";
  return summary.isFullyComplete ? "PASS" : "WARNING";
}

function deriveOverallResult(
  findings: Record<string, Finding>
): ComplianceAssessment["overallResult"] {
  const values = Object.values(findings);
  if (values.includes("FAIL")) return "NON_COMPLIANT";
  if (values.includes("MISSING") || values.includes("WARNING")) return "INCOMPLETE";
  return "COMPLIANT"; // every section is PASS or NOT_APPLICABLE
}

export interface AssessmentFindingsResult {
  findings: Record<string, Finding>;
  overallResult: ComplianceAssessment["overallResult"];
}

/**
 * Computes every section's Finding from ACTUAL current authorization
 * state (never hardcoded) — see the per-section functions above for
 * exactly what each one checks. NOT_APPLICABLE is supported by the
 * Finding type and rendered correctly wherever it appears, but none of
 * the six sections below currently produce it for this app's sample
 * packaging item (every section genuinely applies to any packaging
 * item) — it's reserved for a hypothetical section/component
 * combination where a check genuinely doesn't apply, not manufactured
 * here just to exercise the value.
 */
export function computeAssessmentFindings(
  components: ComponentAssessmentInput[]
): AssessmentFindingsResult {
  if (components.length === 0) {
    const findings = Object.fromEntries(
      ASSESSMENT_SECTIONS.map((section) => [section, "MISSING" as Finding])
    );
    return { findings, overallResult: "INCOMPLETE" };
  }

  const findings: Record<string, Finding> = {
    "Material Composition": findMaterialComposition(components),
    "Recycled Content": findRecycledContent(components),
    Recyclability: findRecyclability(components),
    "Chemical Safety": findChemicalSafety(components),
    "Required Evidence": findRequiredEvidence(components),
    "Data Completeness": findDataCompleteness(components),
  };

  return { findings, overallResult: deriveOverallResult(findings) };
}

// --- Display mappings (AGENTS.md §4's sanctioned status-icon set) --------
// Finding has 5 distinct values but the icon vocabulary only has 7
// fixed icons total (AGENTS.md §4: never invent new ones) shared across
// every status enum in this app. WARNING and MISSING both map to the
// "missing" (⚠) pill status here — the closest fit for both — but stay
// fully distinct in the data model (Finding itself, never collapsed)
// and are distinguished in the UI via their label text ("Warning" vs
// "Missing"), not by icon alone.
export const FINDING_TO_PILL: Record<Finding, StatusPillStatus> = {
  PASS: "complete",
  WARNING: "missing",
  FAIL: "failed",
  MISSING: "missing",
  NOT_APPLICABLE: "not-applicable",
};

export const FINDING_LABELS: Record<Finding, string> = {
  PASS: "Pass",
  WARNING: "Warning",
  FAIL: "Fail",
  MISSING: "Missing",
  NOT_APPLICABLE: "Not Applicable",
};

export const OVERALL_RESULT_TO_PILL: Record<
  ComplianceAssessment["overallResult"],
  StatusPillStatus
> = {
  COMPLIANT: "complete",
  NON_COMPLIANT: "failed",
  INCOMPLETE: "missing",
};

// DOMAIN.md's overallResult enum uses "INCOMPLETE", but this stage's
// prompt asks the Results page to display that state as "REQUIRES
// REVIEW" — a friendlier, more actionable label for the same computed
// value (still derived purely from findings, never independently
// chosen).
export const OVERALL_RESULT_LABELS: Record<ComplianceAssessment["overallResult"], string> = {
  COMPLIANT: "Compliant",
  NON_COMPLIANT: "Non-Compliant",
  INCOMPLETE: "Requires Review",
};
