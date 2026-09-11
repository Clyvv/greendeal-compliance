import { notFound } from "next/navigation";
import { getPackagingItem } from "@/lib/services/mockPackagingService";
import { getPublishedSupplierProducts } from "@/lib/services/mockProductService";
import { getOrganizations } from "@/lib/services/mockOrganizationService";
import {
  AddComponentFlow,
  type SupplierProductOption,
} from "@/components/packaging/add-component-flow";

// Mirrors the packaging item detail page: components added here must
// be reflected immediately, so nothing here should be build-time cached.
export const dynamic = "force-dynamic";

export default async function AddComponentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await getPackagingItem(id);
  if (!item) notFound();

  // Cross-supplier lookup (Stage 7.3) — getSupplierProducts is scoped
  // to one supplier's own product list, so this uses the
  // manufacturer-facing equivalent instead (see mockProductService for
  // why this is a separate function rather than widening that one).
  const [publishedProducts, organizations] = await Promise.all([
    getPublishedSupplierProducts(),
    getOrganizations(),
  ]);

  const organizationNameById = new Map(
    organizations.map((org) => [org.id, org.name])
  );

  const supplierProductOptions: SupplierProductOption[] = publishedProducts.map(
    (product) => ({
      product,
      supplierName: organizationNameById.get(product.supplierId) ?? "Unknown supplier",
    })
  );

  return (
    <AddComponentFlow
      packagingItemId={item.id}
      packagingItemName={item.name}
      supplierProductOptions={supplierProductOptions}
    />
  );
}
