import { notFound } from "next/navigation";
import {
  getProductEvidence,
  getProductVersion,
  getProductVersions,
  getSupplierProduct,
} from "@/lib/services/mockProductService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { ProductDetailsView } from "@/components/products/product-details-view";

// Products/versions created via the Create Product wizard must be
// reflected here immediately, and this route has no
// generateStaticParams, so nothing here should be build-time cached.
export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getSupplierProduct(productId);
  if (!product) notFound();

  const [currentVersion, versions, supplierOrg] = await Promise.all([
    getProductVersion(product.currentVersionId),
    getProductVersions(product.id),
    getOrganization(product.supplierId),
  ]);

  const evidenceItems = currentVersion
    ? await getProductEvidence(currentVersion.id)
    : [];

  return (
    <ProductDetailsView
      product={product}
      currentVersion={currentVersion}
      versions={versions}
      evidenceItems={evidenceItems}
      supplierName={supplierOrg?.name}
      supplierSlug={supplierOrg?.slug}
    />
  );
}
