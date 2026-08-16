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
import {
  getAuthorizedData,
  getDataRequests,
} from "@/lib/services/mockRequestService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import { PackagingComponentCard } from "@/components/packaging/packaging-component-card";
import {
  PackagingReadinessPanel,
  type ReadinessRow,
} from "@/components/packaging/packaging-readiness-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { computeComponentReadiness, summarizeReadiness } from "@/lib/readiness";

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

  const resolvedComponents = await Promise.all(
    components.map(async (component) => {
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
        component,
        supplierProduct,
        supplierOrg,
        productVersion,
        dataRequestId: dataRequest?.id,
        readiness,
      };
    })
  );

  const readinessRows: ReadinessRow[] = resolvedComponents.map(
    ({ component, supplierProduct, supplierOrg, dataRequestId, readiness }) => ({
      component,
      supplierProductName: supplierProduct?.name,
      supplierName: supplierOrg?.name,
      dataRequestId,
      readiness,
    })
  );
  const readinessSummary = summarizeReadiness(
    readinessRows.map((row) => row.readiness)
  );

  return (
    <div className="space-y-6">
      <Link
        href="/manufacturer/packaging-items"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to Packaging Items
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">{item.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          SKU {item.sku} · {item.market} · {item.packagingType}
        </p>
      </div>

      {resolvedComponents.length > 0 && (
        <PackagingReadinessPanel
          packagingItemId={item.id}
          rows={readinessRows}
          summary={readinessSummary}
        />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Packaging Components ({resolvedComponents.length})
        </h2>
        {resolvedComponents.length === 0 ? (
          <EmptyState
            title="No components yet"
            description="Components will appear here once added to this packaging item."
          />
        ) : (
          <div className="space-y-4">
            {resolvedComponents.map(
              ({
                component,
                supplierProduct,
                supplierOrg,
                productVersion,
                dataRequestId,
              }) => (
                <PackagingComponentCard
                  key={component.id}
                  component={component}
                  packagingItemId={item.id}
                  dataRequestId={dataRequestId}
                  supplierProductName={supplierProduct?.name}
                  supplierName={supplierOrg?.name}
                  versionLabel={productVersion?.versionLabel}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
