import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { formatDateTime } from "@/lib/utils";
import { buildExternalSupplierProvenance } from "@/lib/provenance";
import {
  ASSESSMENT_SECTIONS,
  FINDING_LABELS,
  FINDING_TO_PILL,
  OVERALL_RESULT_LABELS,
  OVERALL_RESULT_TO_PILL,
} from "@/lib/assessment-findings";
import type { ComplianceAssessment, ExternalSupplierProduct } from "@/lib/types";

// Stage 7.8 — one packaging component whose data came from an
// ExternalSupplierProduct (Stage 7.3) rather than a real, authorized
// SupplierProduct. Resolved fresh at render time by the page (see that
// file's comment) — not stored on ComplianceAssessment itself.
export interface UnverifiedComponentSummary {
  componentId: string;
  role: string;
  externalProduct?: ExternalSupplierProduct;
}

/**
 * Stage 7 — PPWR Compliance Assessment results. Section-level findings
 * only (PASS/WARNING/FAIL/MISSING/NOT_APPLICABLE per section) — the
 * underlying calculation/provenance drill-down is a full calculation
 * view (STAGE_7_REVIEW.md confirms this isn't built yet), and
 * conformance document generation is a later stage; neither is built
 * here.
 *
 * Stage 7.8 — when `unverifiedComponents` is non-empty, this surfaces
 * that some of the data behind these findings is unverified/
 * manufacturer-provided (AGENTS.md §10a), without changing the
 * PASS/WARNING/FAIL logic itself (lib/assessment-findings.ts already
 * naturally produces a lower-confidence finding for these — see that
 * file's comment on how an unauthorized/external component dilutes
 * fieldCoverage's ratio; this view only adds visibility on top).
 */
export function AssessmentResultsView({
  assessment,
  packagingItemName,
  packagingItemId,
  unverifiedComponents = [],
}: {
  assessment: ComplianceAssessment;
  packagingItemName: string;
  packagingItemId: string;
  unverifiedComponents?: UnverifiedComponentSummary[];
}) {
  const hasUnverifiedComponents = unverifiedComponents.length > 0;

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

      {/* Stage 7.8 — data quality/provenance visibility (original
          requirements doc §14, scoped-down source drill-through per
          this stage's prompt: a full Assessment → Calculation →
          Component → Supplier Product → Version → Evidence chain isn't
          built here, but a direct link to each affected component's
          own card — where its ProvenanceBadge lives — is). */}
      {hasUnverifiedComponents && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="space-y-3 py-4">
            <p className="text-sm font-semibold text-amber-800">
              ⚠ This assessment includes unverified, manufacturer-provided
              data
            </p>
            <p className="text-xs text-amber-700">
              The component{unverifiedComponents.length === 1 ? "" : "s"}{" "}
              below {unverifiedComponents.length === 1 ? "is" : "are"} not
              backed by a registered Greendeal supplier — findings above
              may be incomplete or overly cautious until verified supplier
              data is available.
            </p>
            <ul className="space-y-2">
              {unverifiedComponents.map(({ componentId, role, externalProduct }) => {
                const provenance = externalProduct
                  ? buildExternalSupplierProvenance(externalProduct)
                  : buildExternalSupplierProvenance({
                      sourceType: "MANUFACTURER_PROVIDED",
                      verificationStatus: "UNVERIFIED",
                    });
                return (
                  <li
                    key={componentId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-white px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {role}
                        {externalProduct?.productName
                          ? `: ${externalProduct.productName}`
                          : ""}
                      </p>
                      <ProvenanceBadge provenance={provenance} />
                    </div>
                    <Link
                      href={`/manufacturer/packaging-items/${packagingItemId}`}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      View Component →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

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
                className="rounded-md border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                {/* Every section's coverage check counts every
                    component, including unverified ones (see this
                    file's top comment) — attributing a gap to one
                    specific component would require the calculation
                    breakdown this prototype doesn't build yet, so this
                    is a uniform, honest note rather than a false-precise
                    per-section attribution. */}
                {hasUnverifiedComponents && (
                  <p className="mt-1 text-xs text-amber-700">
                    ⚠ Includes {unverifiedComponents.length} unverified
                    component{unverifiedComponents.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
