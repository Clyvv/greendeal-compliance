import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { RunAssessmentButton } from "@/components/assessments/run-assessment-button";
import { buildExternalSupplierProvenance } from "@/lib/provenance";
import {
  COMPONENT_READINESS_LABELS,
  COMPONENT_READINESS_TO_PILL,
  EVIDENCE_REQUIREMENT_LABEL,
  isExternalSupplierDataUsable,
  type ComponentReadiness,
  type PackagingReadinessSummary,
  type ReadinessFieldState,
} from "@/lib/readiness";
import type { ExternalSupplierProduct, PackagingComponent } from "@/lib/types";

// Stage 7.8 — a row is EITHER a native component (real SupplierProduct,
// request/authorization pipeline applies) OR an external one
// (ExternalSupplierProduct, Stage 7.3 — no such pipeline exists).
// Modeled as a real discriminated union (matching the same "kind" split
// the packaging item page already resolves components into) rather
// than one shape with optional fields for both, since the two need
// entirely different rendering, not just different data.
export type ReadinessRow =
  | {
      kind: "NATIVE";
      component: PackagingComponent;
      supplierProductName?: string;
      supplierName?: string;
      dataRequestId?: string;
      readiness: ComponentReadiness;
    }
  | {
      kind: "EXTERNAL";
      component: PackagingComponent;
      externalProduct?: ExternalSupplierProduct;
      readiness: ComponentReadiness;
    };

/**
 * Stage 6 — Packaging Data Completeness. A new, self-contained section
 * on the Packaging Item Details page (does not touch the existing
 * "Packaging Components" cards from Stage 3/4/5) that rolls up real
 * authorization state into a PPWR-readiness view: overall % + a
 * visual bar, a full per-field checklist per component (original
 * requirements doc §14), and — for anything incomplete — a way to act
 * on it.
 *
 * Stage 7.8 — `rows` now also includes external (ExternalSupplierProduct-
 * backed) components, so `summary`'s % honestly reflects them dragging
 * it down rather than being silently excluded. Whether the assessment
 * can be run is a SEPARATE concern (`canRunAssessment`) gated on native
 * components only — an unverified external component must never be
 * able to block running an assessment on otherwise fully-authorized
 * native data (this stage is about visibility, not gating).
 */
export function PackagingReadinessPanel({
  packagingItemId,
  rows,
  summary,
  canRunAssessment,
}: {
  packagingItemId: string;
  rows: ReadinessRow[];
  summary: PackagingReadinessSummary;
  canRunAssessment: boolean;
}) {
  // "Unverified" here means genuinely no usable data yet, for either
  // reason readiness.ts tracks: a hasSupplier:true record still
  // awaiting its supplier's response, or ANY hasSupplier:false record
  // (which is always "unverified" in the sense that nobody but the
  // manufacturer ever confirmed it — see UNVERIFIED_COMPLETE).
  const hasUnverifiedRows = rows.some(
    (row) =>
      row.kind === "EXTERNAL" &&
      (row.externalProduct?.hasSupplier === false ||
        !isExternalSupplierDataUsable(row.externalProduct))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Readiness</CardTitle>
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
          {rows.map((row) =>
            row.kind === "EXTERNAL" ? (
              <ExternalComponentReadinessRow
                key={row.component.id}
                component={row.component}
                externalProduct={row.externalProduct}
                readiness={row.readiness}
              />
            ) : (
              <ComponentReadinessRow
                key={row.component.id}
                packagingItemId={packagingItemId}
                component={row.component}
                supplierProductName={row.supplierProductName}
                supplierName={row.supplierName}
                dataRequestId={row.dataRequestId}
                readiness={row.readiness}
              />
            )
          )}
        </div>
      </CardContent>

      <CardFooter>
        {canRunAssessment ? (
          <div className="w-full space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-emerald-700">
                ✓ Ready for assessment
              </p>
              <RunAssessmentButton packagingItemId={packagingItemId} />
            </div>
            {hasUnverifiedRows && (
              <p className="text-xs text-amber-700">
                ⚠ One or more components use unverified, manufacturer-
                provided data — the assessment will flag this rather than
                treat it as verified supplier data.
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-amber-700">
              ⚠ Assessment cannot be completed
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Resolve the missing data listed above for every native
              supplier component before a PPWR assessment can be run.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Icon/label/tone for each per-field readiness line — reuses the exact
// icons AGENTS.md §4 + this stage's prompt already specify (✓ complete,
// ⏳ pending, ✕ failed/denied, 🔒 not authorized/requested), never
// invents new ones.
const FIELD_STATE_DISPLAY: Record<
  ReadinessFieldState,
  { icon: string; suffix: string; className: string }
> = {
  AUTHORIZED: { icon: "✓", suffix: "", className: "text-emerald-700" },
  PENDING: { icon: "⏳", suffix: " — Awaiting approval", className: "text-slate-600" },
  DENIED: { icon: "✕", suffix: " — Denied by supplier", className: "text-red-600" },
  NOT_REQUESTED: {
    icon: "🔒",
    suffix: " — Not yet requested",
    className: "text-slate-500",
  },
};

function FieldReadinessLine({
  label,
  state,
}: {
  label: string;
  state: ReadinessFieldState;
}) {
  const display = FIELD_STATE_DISPLAY[state];
  return (
    <p className={`text-sm ${display.className}`}>
      <span aria-hidden="true">{display.icon}</span> {label}
      {display.suffix}
    </p>
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
  const isComplete = readiness.overallStatus === "COMPLETE";
  const canRequestData = component.authorizationStatus === "NOT_REQUESTED";

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {component.role}
            {supplierProductName ? `: ${supplierProductName}` : ""}
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

      {/* Original requirements doc §14 — the full per-field checklist,
          always shown (not just when incomplete), so a fully-ready
          component visibly earns its "Complete" pill rather than just
          asserting it. */}
      <div className="mt-3 space-y-1">
        {readiness.requiredFields.map(({ field, state }) => (
          <FieldReadinessLine key={field} label={field} state={state} />
        ))}
        <FieldReadinessLine
          label={EVIDENCE_REQUIREMENT_LABEL}
          state={readiness.evidence.state}
        />
      </div>

      {!isComplete && (
        <div className="mt-3 pt-1">
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
      )}
    </div>
  );
}

// Stage 7.8 — an External Supplier Product component's Data Readiness
// row. Deliberately NOT the same per-field checklist as
// ComponentReadinessRow above: REQUIRED_PPWR_FIELDS (Circularity +
// Chemical Safety) aren't modeled on ExternalSupplierProduct at all
// (see lib/readiness.ts's computeExternalComponentReadiness comment),
// so listing all 9 of them as "🔒 Not yet requested" would misleadingly
// imply a request could resolve them — there's no supplier org to
// request from. This shows what's actually known (manufacturer-
// entered, unverified) and states plainly that PPWR-required data
// isn't available from this source, per the original doc's
// "⚠ ... — Manufacturer Provided" / "✕ ... Missing" example. No
// "View Component" link here (unlike the assessment results page's
// equivalent) — this row already lives on the same Packaging Item
// Details page as the component's own card, just below.
// Stage 7.10/7.11 — an external component's row varies by whether its
// data is currently usable (isExternalSupplierDataUsable: a completed
// Supplier Response for hasSupplier:true, or ANY hasSupplier:false
// record — see lib/readiness.ts). Not usable yet gets the original
// ⚠/✕ "nothing PPWR-required known" styling; usable gets its own
// per-field checklist (same shape as native components' FieldReadinessLine)
// plus the correct overallStatus pill (COMPONENT_READINESS_TO_PILL/
// LABELS — never a hardcoded "Unverified"). The per-field/known-field
// wording additionally distinguishes hasSupplier:true ("Supplier-
// Provided", once confirmed) from hasSupplier:false ("Self-Reported",
// which is what it will always say — see external-packaging-component-card.tsx's
// permanence note).
function ExternalComponentReadinessRow({
  component,
  externalProduct,
  readiness,
}: {
  component: PackagingComponent;
  externalProduct?: ExternalSupplierProduct;
  readiness: ComponentReadiness;
}) {
  const provenance = externalProduct
    ? buildExternalSupplierProvenance(externalProduct)
    : buildExternalSupplierProvenance({
        sourceType: "MANUFACTURER_PROVIDED",
        verificationStatus: "UNVERIFIED",
      });
  const hasSupplier = externalProduct?.hasSupplier ?? true;
  const isDataUsable = isExternalSupplierDataUsable(externalProduct);
  const providedFieldLabel = hasSupplier ? "Supplier-Provided" : "Self-Reported";
  const missingFieldSuffix = hasSupplier
    ? " — Not answered by supplier"
    : " — Not provided";

  const knownFields: { label: string; value?: string }[] = [
    { label: "Material Family", value: externalProduct?.knownMaterialFamily },
    {
      label: "Material Composition",
      value: externalProduct?.knownMaterialComposition,
    },
    {
      label: "Weight",
      value:
        externalProduct?.knownWeightGrams !== undefined
          ? `${externalProduct.knownWeightGrams}g`
          : undefined,
    },
  ];

  return (
    <div
      className={
        isDataUsable
          ? "rounded-md border border-slate-200 p-4"
          : "rounded-md border border-amber-200 bg-amber-50/40 p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {component.role}
            {externalProduct?.productName ? `: ${externalProduct.productName}` : ""}
          </p>
          <div className="mt-1">
            <ProvenanceBadge provenance={provenance} />
          </div>
        </div>
        <StatusPill
          status={COMPONENT_READINESS_TO_PILL[readiness.overallStatus]}
          label={COMPONENT_READINESS_LABELS[readiness.overallStatus]}
        />
      </div>

      <div className="mt-3 space-y-1">
        {knownFields.map(({ label, value }) =>
          value ? (
            <p
              key={label}
              className={`text-sm ${isDataUsable ? "text-emerald-700" : "text-amber-700"}`}
            >
              <span aria-hidden="true">{isDataUsable ? "✓" : "⚠"}</span> {label} —{" "}
              {isDataUsable ? providedFieldLabel : "Manufacturer Provided"}
            </p>
          ) : (
            <p key={label} className="text-sm text-slate-500">
              <span aria-hidden="true">✕</span> {label} Missing
            </p>
          )
        )}

        {isDataUsable ? (
          <>
            {/* Deliberately NOT FieldReadinessLine's generic
                NOT_REQUESTED suffix ("Not yet requested") — there's no
                request pipeline here to point at; a field left blank
                (whether by the supplier or the manufacturer itself) is
                its own distinct state. */}
            {readiness.requiredFields.map(({ field, state }) => (
              <p
                key={field}
                className={`text-sm ${state === "AUTHORIZED" ? "text-emerald-700" : "text-slate-500"}`}
              >
                <span aria-hidden="true">{state === "AUTHORIZED" ? "✓" : "✕"}</span>{" "}
                {field}
                {state === "AUTHORIZED" ? "" : missingFieldSuffix}
              </p>
            ))}
            <p
              className={`text-sm ${readiness.evidence.state === "AUTHORIZED" ? "text-emerald-700" : "text-slate-500"}`}
            >
              <span aria-hidden="true">
                {readiness.evidence.state === "AUTHORIZED" ? "✓" : "✕"}
              </span>{" "}
              {EVIDENCE_REQUIREMENT_LABEL}
              {readiness.evidence.state === "AUTHORIZED" ? "" : missingFieldSuffix}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            <span aria-hidden="true">✕</span> Circularity &amp; Chemical
            Safety data Missing — not available from this source
          </p>
        )}
      </div>
    </div>
  );
}
