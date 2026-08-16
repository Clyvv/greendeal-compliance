import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDateTime } from "@/lib/utils";
import {
  ASSESSMENT_SECTIONS,
  FINDING_LABELS,
  FINDING_TO_PILL,
  OVERALL_RESULT_LABELS,
  OVERALL_RESULT_TO_PILL,
} from "@/lib/assessment-findings";
import type { ComplianceAssessment } from "@/lib/types";

/**
 * Stage 7 — PPWR Compliance Assessment results. Section-level findings
 * only (PASS/WARNING/FAIL/MISSING/NOT_APPLICABLE per section) — the
 * underlying calculation/provenance drill-down is Stage 8, and
 * conformance document generation is Stage 9; neither is built here.
 */
export function AssessmentResultsView({
  assessment,
  packagingItemName,
  packagingItemId,
}: {
  assessment: ComplianceAssessment;
  packagingItemName: string;
  packagingItemId: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/manufacturer/packaging-items/${packagingItemId}`}
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to {packagingItemName}
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Greendeal Compliance
        </p>
        <h1 className="text-xl font-semibold text-slate-900">
          PPWR Compliance Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-500">{packagingItemName}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Overall Status
              </p>
              <div className="mt-1">
                <StatusPill
                  status={OVERALL_RESULT_TO_PILL[assessment.overallResult]}
                  label={OVERALL_RESULT_LABELS[assessment.overallResult]}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Assessment ID
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {assessment.id}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Run {formatDateTime(assessment.createdAt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ASSESSMENT_SECTIONS.map((section) => {
            const finding = assessment.findings[section];
            return (
              <div
                key={section}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3"
              >
                <p className="text-sm font-medium text-slate-900">{section}</p>
                {finding ? (
                  <StatusPill
                    status={FINDING_TO_PILL[finding]}
                    label={FINDING_LABELS[finding]}
                  />
                ) : (
                  <StatusPill status="not-applicable" label="Not Applicable" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
