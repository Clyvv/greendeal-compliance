import type { ComplianceAssessment } from "@/lib/types";
import { assessments } from "@/lib/mock-data";
import { MOCK_TODAY, CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import { getPackagingComponents } from "@/lib/services/mockPackagingService";
import {
  getProductEvidence,
  getProductVersion,
} from "@/lib/services/mockProductService";
import { getAuthorizedData, getDataRequests } from "@/lib/services/mockRequestService";
import { computeComponentReadiness, computeExternalComponentReadiness } from "@/lib/readiness";
import {
  computeAssessmentFindings,
  type ComponentAssessmentInput,
} from "@/lib/assessment-findings";

function nowIso(): string {
  return MOCK_TODAY.toISOString();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let assessmentSequence = assessments.length + 1;

// DOMAIN.md §8 — PPWR-<year>-<6-digit sequence>, e.g. "PPWR-2026-000182".
function generateAssessmentId(): string {
  const year = MOCK_TODAY.getFullYear();
  const sequence = String(assessmentSequence).padStart(6, "0");
  assessmentSequence += 1;
  return `PPWR-${year}-${sequence}`;
}

// A safe, empty fallback for the (not currently occurring) case where
// a component's ProductVersion can't be found — every check in
// lib/assessment-findings.ts is gated on authorizedAttributes first,
// which is forced empty below whenever this fallback is used, so these
// placeholder values are never actually read as real data.
const EMPTY_PHYSICAL = {
  materialFamily: "",
  specificMaterial: "",
  netWeightGrams: 0,
  dimensions: "",
  thicknessMm: 0,
  packagingFunction: "",
};
const EMPTY_CIRCULARITY = {
  totalRecycledContentPercent: 0,
  pcrYieldPercent: 0,
  preConsumerYieldPercent: 0,
  dfrGrade: "",
  reusabilityStatus: "",
};
const EMPTY_CHEMICAL_SAFETY = {
  pfasStatus: "NOT_PROVIDED" as const,
  pfasIntentionallyAdded: null,
  reachSvhcStatus: "NOT_PROVIDED" as const,
  rohsStatus: "NOT_PROVIDED" as const,
};

// Maps to: POST /api/v1/packaging-items/{itemId}/assessments
// Synchronous in this mock, but deliberately models a real (if brief)
// PROCESSING -> COMPLETE/REQUIRES_REVIEW transition rather than an
// instant flip — see API_CONTRACT.md's note on this function. The
// step-by-step UI (components/assessments/run-assessment-button.tsx)
// is a separate, purely client-side narration and isn't tied to this
// delay's exact timing; this delay is what a real async job queue
// would eventually replace with actual processing time.
export async function runAssessment(
  packagingItemId: string
): Promise<ComplianceAssessment> {
  const assessment: ComplianceAssessment = {
    id: generateAssessmentId(),
    packagingItemId,
    status: "PROCESSING",
    overallResult: "INCOMPLETE",
    findings: {},
    createdAt: nowIso(),
  };
  assessments.push(assessment);

  await delay(300);

  const components = await getPackagingComponents(packagingItemId);
  const sentRequests = await getDataRequests(CURRENT_MANUFACTURER_ORG_ID, "MANUFACTURER");

  // Stage 7.8 — a component references EITHER a real SupplierProduct OR
  // an ExternalSupplierProduct (Stage 7.3); branch the same way
  // app/(app)/manufacturer/packaging-items/[id]/page.tsx already does,
  // so an external component's total absence of PPWR-required fields
  // (see computeExternalComponentReadiness) is represented honestly
  // (UNVERIFIED) rather than silently computed via the native
  // request/authorization path it was never actually part of.
  const inputs: ComponentAssessmentInput[] = await Promise.all(
    components.map(async (component) => {
      if (component.externalSupplierProductId) {
        return {
          componentId: component.id,
          authorizedAttributes: [],
          physical: EMPTY_PHYSICAL,
          circularity: EMPTY_CIRCULARITY,
          chemicalSafety: EMPTY_CHEMICAL_SAFETY,
          evidenceItems: [],
          readiness: computeExternalComponentReadiness(),
        };
      }

      const [productVersion, evidenceItems, authorizedData] = await Promise.all([
        getProductVersion(component.productVersionId),
        getProductEvidence(component.productVersionId),
        getAuthorizedData(component.id),
      ]);

      // Without a ProductVersion there is nothing legitimate to read —
      // force authorizedAttributes empty so every check in
      // lib/assessment-findings.ts naturally treats this component as
      // fully missing rather than reading placeholder data as real.
      const authorizedAttributes = productVersion
        ? authorizedData?.authorizedAttributes ?? []
        : [];

      const dataRequest = sentRequests.find(
        (request) =>
          request.packagingItemId === component.packagingItemId &&
          request.supplierProductId === component.supplierProductId
      );

      const readiness = computeComponentReadiness({
        requestedAttributes: dataRequest?.requestedAttributes ?? [],
        requestStatus: dataRequest?.status,
        authorizedAttributes,
        evidenceDocumentNames: evidenceItems.map((item) => item.documentName),
      });

      return {
        componentId: component.id,
        authorizedAttributes,
        physical: productVersion?.physical ?? EMPTY_PHYSICAL,
        circularity: productVersion?.circularity ?? EMPTY_CIRCULARITY,
        chemicalSafety: productVersion?.chemicalSafety ?? EMPTY_CHEMICAL_SAFETY,
        evidenceItems,
        readiness,
      };
    })
  );

  const { findings, overallResult } = computeAssessmentFindings(inputs);

  assessment.findings = findings;
  assessment.overallResult = overallResult;
  // COMPLIANT/NON_COMPLIANT both mean the assessment ran to completion
  // successfully (the compliance *outcome* differs, the assessment
  // *lifecycle* doesn't) — only INCOMPLETE (missing/partial data) maps
  // to the REQUIRES_REVIEW lifecycle status, since that genuinely
  // needs a human to chase down the gaps before a real verdict is
  // possible. FAILED (a run that errored out) never happens in this
  // mock — there's no failure mode to simulate here.
  assessment.status = overallResult === "INCOMPLETE" ? "REQUIRES_REVIEW" : "COMPLETE";

  return assessment;
}

// Maps to: GET /api/v1/assessments/{assessmentId}
export async function getAssessment(
  assessmentId: string
): Promise<ComplianceAssessment | undefined> {
  return assessments.find((item) => item.id === assessmentId);
}

// Maps to: GET /api/v1/packaging-items/{itemId}/assessments
// Most-recent-first — supports 0..n assessments per packaging item;
// running the assessment again always appends a new record rather
// than overwriting the previous one (see runAssessment above).
export async function getAssessmentHistory(
  packagingItemId: string
): Promise<ComplianceAssessment[]> {
  return assessments
    .filter((item) => item.packagingItemId === packagingItemId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// Planned for a later stage (see API_CONTRACT.md → mockAssessmentService):
//   getCalculation(assessmentId, metric)
//   getImpactAnalysis(productVersionChangeId)
//   recalculateAssessment(assessmentId)
