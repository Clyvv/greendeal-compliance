import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPackagingComponents,
  getPackagingItem,
} from "@/lib/services/mockPackagingService";
import {
  getProductVersion,
  getSupplierProduct,
} from "@/lib/services/mockProductService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { PackagingComponentCard } from "@/components/packaging/packaging-component-card";
import { EmptyState } from "@/components/ui/empty-state";

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

  const resolvedComponents = await Promise.all(
    components.map(async (component) => {
      const supplierProduct = await getSupplierProduct(
        component.supplierProductId
      );
      const [supplierOrg, productVersion] = await Promise.all([
        supplierProduct
          ? getOrganization(supplierProduct.supplierId)
          : Promise.resolve(undefined),
        getProductVersion(component.productVersionId),
      ]);
      return { component, supplierProduct, supplierOrg, productVersion };
    })
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
              ({ component, supplierProduct, supplierOrg, productVersion }) => (
                <PackagingComponentCard
                  key={component.id}
                  component={component}
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
