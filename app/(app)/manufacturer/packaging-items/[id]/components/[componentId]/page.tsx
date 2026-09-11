import { notFound, redirect } from "next/navigation";
import {
  getPackagingComponent,
  getPackagingItem,
} from "@/lib/services/mockPackagingService";
import { getExternalSupplierProduct } from "@/lib/services/mockExternalSupplierService";
import { ExternalSupplierProductDetailForm } from "@/components/packaging/external-supplier-product-detail-form";

// A completed edit changes what the packaging item page's readiness
// panel/card shows immediately (see updateExternalSupplierProductAction's
// revalidatePackagingItem) — nothing here should be build-time cached.
export const dynamic = "force-dynamic";

export default async function ExternalSupplierProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; componentId: string }>;
}) {
  const { id, componentId } = await params;

  const item = await getPackagingItem(id);
  if (!item) notFound();

  const component = await getPackagingComponent(componentId);
  if (!component || component.packagingItemId !== item.id) notFound();

  // Only External Supplier Product components have a view/edit details
  // page today — a native component's full compliance data view is a
  // later stage's concern (see PackagingComponentCard's disabled "View
  // Data" button), and its card never links here.
  if (!component.externalSupplierProductId) {
    redirect(`/manufacturer/packaging-items/${item.id}`);
  }

  const externalProduct = await getExternalSupplierProduct(
    component.externalSupplierProductId
  );
  if (!externalProduct) notFound();

  return (
    <ExternalSupplierProductDetailForm
      packagingItemId={item.id}
      packagingItemName={item.name}
      componentRole={component.role}
      externalSupplierProduct={externalProduct}
    />
  );
}
