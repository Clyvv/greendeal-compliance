import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { RunAssessmentButton } from "@/components/assessments/run-assessment-button";
import {
  COMPONENT_READINESS_LABELS,
  COMPONENT_READINESS_TO_PILL,
  getMissingGroups,
  type ComponentReadiness,
  type PackagingReadinessSummary,
} from "@/lib/readiness";
import type { PackagingComponent } from "@/lib/types";

export interface ReadinessRow {
  component: PackagingComponent;
  supplierProductName?: string;
  supplierName?: string;
  dataRequestId?: string;
  readiness: ComponentReadiness;
}

/**
 * Stage 6 — Packaging Data Completeness. A new, self-contained section
 * on the Packaging Item Details page (does not touch the existing
 * "Packaging Components" cards from Stage 3/4/5) that rolls up real
 * authorization state into a PPWR-readiness view: overall % + a
 * visual bar, per-component ✓/⚠/🔒 status, and — for anything
 * incomplete — exactly which fields are missing and why.
 */
export function PackagingReadinessPanel({
  packagingItemId,
  rows,
  summary,
}: {
  packagingItemId: string;
  rows: ReadinessRow[];
  summary: PackagingReadinessSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Packaging Data Completeness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-2xl font-semibold text-slate-900">
              {summary.overallPercent}%
            </p>
            <p className="text-xs text-slate-500">
              {summary.totalSatisfied} of {summary.totalRequired} required
              fields authorized across {rows.length} component
              {rows.length === 1 ? "" : "s"}
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={summary.overallPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width]"
              style={{ width: `${summary.overallPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {rows.map(({ component, supplierProductName, supplierName, dataRequestId, readiness }) => (
            <ComponentReadinessRow
              key={component.id}
              packagingItemId={packagingItemId}
              component={component}
              supplierProductName={supplierProductName}
              supplierName={supplierName}
              dataRequestId={dataRequestId}
              readiness={readiness}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter>
        {summary.isFullyComplete ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-emerald-700">
              ✓ Ready for assessment
            </p>
            <RunAssessmentButton packagingItemId={packagingItemId} />
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-amber-700">
              ⚠ Assessment cannot be completed
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Resolve the missing data listed above for every component
              before a PPWR assessment can be run.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function ComponentReadinessRow({
  packagingItemId,
  component,
  supplierProductName,
  supplierName,
  dataRequestId,
  readiness,
}: {
  packagingItemId: string;
  component: PackagingComponent;
  supplierProductName?: string;
  supplierName?: string;
  dataRequestId?: string;
  readiness: ComponentReadiness;
}) {
  const missingGroups = getMissingGroups(readiness);
  const isComplete = readiness.overallStatus === "COMPLETE";
  const canRequestData = component.authorizationStatus === "NOT_REQUESTED";

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {supplierProductName ?? component.role}
          </p>
          <p className="text-xs text-slate-500">
            Supplier: {supplierName ?? "Unknown supplier"}
          </p>
        </div>
        <StatusPill
          status={COMPONENT_READINESS_TO_PILL[readiness.overallStatus]}
          label={COMPONENT_READINESS_LABELS[readiness.overallStatus]}
        />
      </div>

      {!isComplete && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Missing
          </p>
          <ul className="space-y-1">
            {missingGroups.map((group) => (
              <li key={group.state} className="text-sm text-slate-700">
                <span aria-hidden="true">{group.icon}</span>{" "}
                <span className="text-slate-500">{group.label}:</span>{" "}
                {group.items.join(", ")}
              </li>
            ))}
          </ul>

          <div className="pt-1">
            {canRequestData ? (
              <Link
                href={`/manufacturer/packaging-items/${packagingItemId}/request/${component.id}`}
              >
                <Button variant="secondary" size="sm">
                  Request Missing Data
                </Button>
              </Link>
            ) : dataRequestId ? (
              <Link
                href={`/manufacturer/data-requests/${dataRequestId}`}
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                View Request →
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
