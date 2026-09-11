import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPackagingComponents,
  getPackagingItem,
} from "@/lib/services/mockPackagingService";
import {
  getProductEvidence,
  getProductVersion,
  getSupplierProduct,
} from "@/lib/services/mockProductService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { getExternalSupplierProduct } from "@/lib/services/mockExternalSupplierService";
import {
  getAuthorizedData,
  getDataRequests,
} from "@/lib/services/mockRequestService";
import { getAssessmentHistory } from "@/lib/services/mockAssessmentService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PackagingComponentCard } from "@/components/packaging/packaging-component-card";
import {
  PackagingReadinessPanel,
  type ReadinessRow,
} from "@/components/packaging/packaging-readiness-panel";
import { AssessmentHistoryTable } from "@/components/assessments/assessment-history-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  computeComponentReadiness,
  computeExternalComponentReadiness,
  summarizeReadiness,
} from "@/lib/readiness";

// New packaging items must be reachable immediately after creation,
// and this route has no generateStaticParams, so nothing here should
// be build-time cached.
export const dynamic = "force-dynamic";

export default async function PackagingItemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPackagingItem(id);
  if (!item) notFound();

  const components = await getPackagingComponents(item.id);

  // Needed so each component's authorization badge can link through to
  // its underlying Data Request (Stage 5 corrective addition) rather
  // than being a dead end — a DataRequest doesn't store a componentId
  // directly (DOMAIN.md §3), so it's matched back via
  // (packagingItemId, supplierProductId), same as
  // mockPackagingService.getPackagingComponentsByProduct's inverse.
  const sentRequests = await getDataRequests(
    CURRENT_MANUFACTURER_ORG_ID,
    "MANUFACTURER"
  );

  // Stage 7.3 — a component references EITHER a real SupplierProduct
  // OR an ExternalSupplierProduct (see lib/types/packaging.ts). Branch
  // early per component rather than threading optional fields through
  // one shared shape, so each branch only ever fetches/returns data
  // that's actually meaningful for its kind.
  const resolvedComponents = await Promise.all(
    components.map(async (component) => {
      if (component.externalSupplierProductId) {
        const externalProduct = await getExternalSupplierProduct(
          component.externalSupplierProductId
        );
        return {
          kind: "EXTERNAL" as const,
          component,
          externalProduct,
          // Stage 7.8 — included in the readiness rollup now (see
          // below); UNVERIFIED unless Stage 7.10's Supplier Response
          // Link has since been completed for this record, in which
          // case computeExternalComponentReadiness reflects the
          // supplier-provided fields instead (see that function).
          readiness: computeExternalComponentReadiness(externalProduct),
        };
      }

      const supplierProduct = await getSupplierProduct(
        component.supplierProductId
      );
      const [supplierOrg, productVersion, evidenceItems, authorizedData] =
        await Promise.all([
          supplierProduct
            ? getOrganization(supplierProduct.supplierId)
            : Promise.resolve(undefined),
          getProductVersion(component.productVersionId),
          getProductEvidence(component.productVersionId),
          getAuthorizedData(component.id),
        ]);
      const dataRequest = sentRequests.find(
        (request) =>
          request.packagingItemId === component.packagingItemId &&
          request.supplierProductId === component.supplierProductId
      );

      // Stage 6 — real, computed readiness (never hardcoded) from this
      // component's actual authorization state: what was requested,
      // what the request's current status is, and what's actually
      // been authorized (see lib/readiness.ts for the required-field
      // definition and the AUTHORIZED/PENDING/DENIED/NOT_REQUESTED logic).
      const readiness = computeComponentReadiness({
        requestedAttributes: dataRequest?.requestedAttributes ?? [],
        requestStatus: dataRequest?.status,
        authorizedAttributes: authorizedData?.authorizedAttributes ?? [],
        evidenceDocumentNames: evidenceItems.map((item) => item.documentName),
      });

      return {
        kind: "NATIVE" as const,
        component,
        supplierProduct,
        supplierOrg,
        productVersion,
        dataRequestId: dataRequest?.id,
        readiness,
      };
    })
  );

  const nativeComponents = resolvedComponents.filter(
    (resolved) => resolved.kind === "NATIVE"
  );
  const externalComponents = resolvedComponents.filter(
    (resolved) => resolved.kind === "EXTERNAL"
  );
  // Stage 7.11 — three distinct buckets now, not two: a hasSupplier:false
  // ("Use Existing Manufacturer-Provided Data") component is NEVER
  // "awaiting" anything and is always its own bucket, regardless of how
  // complete its data is — conflating it with either "awaiting a
  // supplier" or "a supplier responded" would misrepresent a permanently
  // self-reported record as having some relationship to a supplier at
  // all.
  const selfReportedComponents = externalComponents.filter(
    (resolved) => resolved.externalProduct?.hasSupplier === false
  );
  const awaitingSupplierComponents = externalComponents.filter(
    (resolved) =>
      resolved.externalProduct?.hasSupplier !== false &&
      resolved.externalProduct?.responseStatus !== "COMPLETED"
  );
  const supplierRespondedComponents = externalComponents.filter(
    (resolved) =>
      resolved.externalProduct?.hasSupplier !== false &&
      resolved.externalProduct?.responseStatus === "COMPLETED"
  );

  // Stage 7.8 — external components are now INCLUDED in the readiness
  // rollup (previously excluded entirely — STAGE_7_REVIEW.md's Stage
  // 7.3 note, now superseded), each contributing its own UNVERIFIED
  // readiness (computeExternalComponentReadiness) so the overall %
  // honestly reflects them dragging it down rather than silently
  // reading 100% off native components alone while an unverified one
  // sits right there unaccounted for.
  const readinessRows: ReadinessRow[] = resolvedComponents.map((resolved) =>
    resolved.kind === "EXTERNAL"
      ? {
          kind: "EXTERNAL",
          component: resolved.component,
          externalProduct: resolved.externalProduct,
          readiness: resolved.readiness,
        }
      : {
          kind: "NATIVE",
          component: resolved.component,
          supplierProductName: resolved.supplierProduct?.name,
          supplierName: resolved.supplierOrg?.name,
          dataRequestId: resolved.dataRequestId,
          readiness: resolved.readiness,
        }
  );
  // The overall %/summary shown on the panel includes every component
  // (honest score — see above). Whether "Run PPWR Assessment" is
  // offered stays gated on native components alone, exactly as before
  // (Stage 6) — an unverified external component must not be able to
  // silently block running an assessment on otherwise-fully-authorized
  // native data; this stage is about visibility, not gating (this
  // stage's prompt, point 3).
  const overallReadinessSummary = summarizeReadiness(
    readinessRows.map((row) => row.readiness)
  );
  const nativeReadinessSummary = summarizeReadiness(
    nativeComponents.map((resolved) => resolved.readiness)
  );

  // Stage 7 — every assessment ever run for this item, most recent
  // first. Supports 0..n; running the assessment again always adds a
  // new row rather than overwriting the last one.
  const assessmentHistory = await getAssessmentHistory(item.id);

  return (
    <div className="space-y-6">
      <Link
        href="/manufacturer/packaging-items"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to Packaging Items
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{item.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            SKU {item.sku} · {item.market} · {item.packagingType}
          </p>
        </div>
        <Link href={`/manufacturer/packaging-items/${item.id}/add-component`}>
          <Button type="button">Add Component</Button>
        </Link>
      </div>

      {readinessRows.length > 0 && (
        <div className="space-y-2">
          <PackagingReadinessPanel
            packagingItemId={item.id}
            rows={readinessRows}
            summary={overallReadinessSummary}
            canRunAssessment={nativeReadinessSummary.isFullyComplete}
          />
          {awaitingSupplierComponents.length > 0 && (
            <p className="text-xs text-slate-500">
              {awaitingSupplierComponents.length} component
              {awaitingSupplierComponents.length === 1 ? "" : "s"} below{" "}
              {awaitingSupplierComponents.length === 1 ? "uses" : "use"}{" "}
              unverified, manufacturer-provided data (no registered
              Greendeal supplier) — counted above as unverified, not as
              authorized supplier data.
            </p>
          )}
          {supplierRespondedComponents.length > 0 && (
            <p className="text-xs text-slate-500">
              {supplierRespondedComponents.length} component
              {supplierRespondedComponents.length === 1 ? "" : "s"} below{" "}
              {supplierRespondedComponents.length === 1 ? "uses" : "use"}{" "}
              data from a completed supplier response — more trusted than
              manufacturer-only entry, but still not a fully onboarded
              Greendeal Supplier Product.
            </p>
          )}
          {selfReportedComponents.length > 0 && (
            <p className="text-xs text-slate-500">
              {selfReportedComponents.length} component
              {selfReportedComponents.length === 1 ? "" : "s"} below{" "}
              {selfReportedComponents.length === 1 ? "uses" : "use"}{" "}
              manufacturer self-entered data with no supplier associated —
              permanently unverified regardless of how complete the data
              is.
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Packaging Components ({resolvedComponents.length})
        </h2>
        {resolvedComponents.length === 0 ? (
          <EmptyState
            title="No components yet"
            description="Add a component to get started — reference a published Greendeal supplier product, or record data from a supplier not yet on Greendeal."
            action={
              <Link href={`/manufacturer/packaging-items/${item.id}/add-component`}>
                <Button type="button">Add Component</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {resolvedComponents.map((resolved) =>
              resolved.kind === "EXTERNAL" ? (
                <PackagingComponentCard
                  key={resolved.component.id}
                  component={resolved.component}
                  packagingItemId={item.id}
                  externalSupplierProduct={resolved.externalProduct}
                />
              ) : (
                <PackagingComponentCard
                  key={resolved.component.id}
                  component={resolved.component}
                  packagingItemId={item.id}
                  dataRequestId={resolved.dataRequestId}
                  supplierProductName={resolved.supplierProduct?.name}
                  supplierName={resolved.supplierOrg?.name}
                  versionLabel={resolved.productVersion?.versionLabel}
                />
              )
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Assessment History ({assessmentHistory.length})
        </h2>
        <AssessmentHistoryTable
          rows={assessmentHistory.map((assessment) => ({ assessment }))}
          emptyStateDescription="Assessments run for this packaging item will appear here."
        />
      </div>
    </div>
  );
}
