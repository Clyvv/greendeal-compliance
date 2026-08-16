// DOMAIN.md §3 — Compliance Assessment (of a Packaging Item).
//
// Stage 7 note: this and everything computed from it is a SIMPLIFIED,
// illustrative PPWR assessment for demonstrating the UX/architecture —
// explicitly NOT a real regulatory rules engine (see AGENTS.md §2 and
// this stage's prompt). The shape below matches DOMAIN.md exactly so a
// real engine could slot in behind the same types later.
export type AssessmentStatus =
  | "DRAFT"
  | "PROCESSING"
  | "COMPLETE"
  | "FAILED"
  | "REQUIRES_REVIEW";

export type Finding =
  | "PASS"
  | "WARNING"
  | "FAIL"
  | "MISSING"
  | "NOT_APPLICABLE";

export type ComplianceAssessment = {
  id: string; // e.g. "PPWR-2026-000182" — see DOMAIN.md §8 for the format
  packagingItemId: string;
  status: AssessmentStatus;
  overallResult: "COMPLIANT" | "NON_COMPLIANT" | "INCOMPLETE";
  findings: Record<string, Finding>; // section name -> Finding
  createdAt: string; // ISO date-time (includes time, unlike most other createdAt fields)
};
