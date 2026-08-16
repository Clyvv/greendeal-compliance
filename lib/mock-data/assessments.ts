import type { ComplianceAssessment } from "@/lib/types";

// No assessments have been run yet — Stage 7 creates the first one,
// when Coca-Cola clicks "Run PPWR Assessment" from the Packaging Data
// Completeness view (Stage 6). Running it more than once produces
// additional entries here, never overwrites one (see
// mockAssessmentService.runAssessment).
export const assessments: ComplianceAssessment[] = [];
