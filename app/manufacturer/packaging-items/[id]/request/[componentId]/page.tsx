import { notFound, redirect } from "next/navigation";
import {
  getPackagingComponent,
  getPackagingItem,
} from "@/lib/services/mockPackagingService";
import {
  getProductEvidence,
  getProductVersion,
  getSupplierProduct,
} from "@/lib/services/mockProductService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { DataRequestFlow } from "@/components/requests/data-request-flow";
import {
  DEFAULT_SELECTED_EVIDENCE_DOCUMENT_NAMES,
  DEFAULT_SELECTED_FIELDS,
} from "@/lib/requests/fields";

// Mirrors the packaging item details page: nothing here should be
// build-time cached, since a component's authorizationStatus changes
// as soon as a request is submitted (Stage 4).
export const dynamic = "force-dynamic";

export default async function RequestDataPage({
  params,
}: {
  params: Promise<{ id: string; componentId: string }>;
}) {
  const { id, componentId } = await params;

  const item = await getPackagingItem(id);
  if (!item) notFound();

  const component = await getPackagingComponent(componentId);
  if (!component || component.packagingItemId !== item.id) notFound();

  // Data can only be requested once per component in this stage —
  // Stage 5 (approval) and beyond decide what happens next for
  // PENDING/AUTHORIZED/REJECTED components. Revisiting this route
  // directly (e.g. a stale link) sends the manufacturer back to the
  // details page instead of letting a second request be created.
  if (component.authorizationStatus !== "NOT_REQUESTED") {
    redirect(`/manufacturer/packaging-items/${item.id}`);
  }

  const supplierProduct = await getSupplierProduct(component.supplierProductId);
  if (!supplierProduct) notFound();

  const [supplierOrg, productVersion, evidenceItems] = await Promise.all([
    getOrganization(supplierProduct.supplierId),
    getProductVersion(component.productVersionId),
    getProductEvidence(component.productVersionId),
  ]);

  return (
    <DataRequestFlow
      packagingItemId={item.id}
      packagingItemName={item.name}
      packagingComponentId={component.id}
      componentRole={component.role}
      supplierProductId={supplierProduct.id}
      supplierProductName={supplierProduct.name}
      supplierOrgId={supplierProduct.supplierId}
      supplierOrgName={supplierOrg?.name ?? "Unknown supplier"}
      versionLabel={productVersion?.versionLabel}
      evidenceItems={evidenceItems}
      defaultSelectedFields={DEFAULT_SELECTED_FIELDS}
      defaultSelectedEvidenceDocumentNames={
        DEFAULT_SELECTED_EVIDENCE_DOCUMENT_NAMES
      }
    />
  );
}
