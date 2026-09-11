import { notFound } from "next/navigation";
import {
  getAuthorizedData,
  getDataRequest,
} from "@/lib/services/mockRequestService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { getSupplierProduct } from "@/lib/services/mockProductService";
import {
  getPackagingComponentsByProduct,
  getPackagingItem,
} from "@/lib/services/mockPackagingService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import { groupRequestedAttributesBySection } from "@/lib/requests/fields";
import { DataRequestManufacturerView } from "@/components/requests/data-request-manufacturer-view";

// A request's status can change (PENDING -> APPROVED/REJECTED) without
// this route having a generateStaticParams, so nothing here should be
// build-time cached.
export const dynamic = "force-dynamic";

export default async function ManufacturerDataRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await getDataRequest(id);
  if (!request) notFound();

  // Ownership boundary, mirroring the supplier side's Stage 1a
  // discipline — Coca-Cola can only view requests it sent itself.
  if (request.requestingOrgId !== CURRENT_MANUFACTURER_ORG_ID) notFound();

  const [supplierOrg, supplierProduct, packagingItem, components] =
    await Promise.all([
      getOrganization(request.supplierOrgId),
      getSupplierProduct(request.supplierProductId),
      getPackagingItem(request.packagingItemId),
      getPackagingComponentsByProduct(
        request.packagingItemId,
        request.supplierProductId
      ),
    ]);

  // Same source of truth the manufacturer's actual data access is
  // gated by (Stage 5/6) — never re-derived some other way.
  let approvedAttributes: string[] | undefined;
  if (request.status === "APPROVED" && components[0]) {
    const authorizedData = await getAuthorizedData(components[0].id);
    approvedAttributes = authorizedData?.authorizedAttributes;
  }

  const groupedRequested = groupRequestedAttributesBySection(
    request.requestedAttributes
  );

  return (
    <DataRequestManufacturerView
      request={request}
      supplierOrgName={supplierOrg?.name ?? "Unknown supplier"}
      supplierProductName={supplierProduct?.name ?? "Unknown product"}
      packagingItemName={packagingItem?.name ?? "Unknown packaging item"}
      groupedRequested={groupedRequested}
      approvedAttributes={approvedAttributes}
    />
  );
}
