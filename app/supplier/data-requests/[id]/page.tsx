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
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { groupRequestedAttributesBySection } from "@/lib/requests/fields";
import { DataRequestApprovalFlow } from "@/components/requests/data-request-approval-flow";

// A request's status can change (PENDING -> APPROVED/REJECTED) without
// this route having a generateStaticParams, so nothing here should be
// build-time cached.
export const dynamic = "force-dynamic";

export default async function SupplierDataRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await getDataRequest(id);
  if (!request) notFound();

  // Ownership boundary (AGENTS.md §7, same discipline as Stage 1a) —
  // PET Solutions GmbH must never be able to open a request addressed
  // to another supplier, even via a guessed URL.
  if (request.supplierOrgId !== CURRENT_SUPPLIER_ORG_ID) notFound();

  const [requestingOrg, supplierOrg, supplierProduct, packagingItem, components] =
    await Promise.all([
      getOrganization(request.requestingOrgId),
      getOrganization(request.supplierOrgId),
      getSupplierProduct(request.supplierProductId),
      getPackagingItem(request.packagingItemId),
      getPackagingComponentsByProduct(
        request.packagingItemId,
        request.supplierProductId
      ),
    ]);

  // For an already-approved request, redisplay exactly what was
  // authorized by asking the same getAuthorizedData function the
  // manufacturer side depends on (rather than re-deriving it some
  // other way) — one source of truth for "what's actually approved".
  let approvedAttributes: string[] | undefined;
  if (request.status === "APPROVED" && components[0]) {
    const authorizedData = await getAuthorizedData(components[0].id);
    approvedAttributes = authorizedData?.authorizedAttributes;
  }

  const groupedRequested = groupRequestedAttributesBySection(
    request.requestedAttributes
  );

  return (
    <DataRequestApprovalFlow
      request={request}
      requestingOrgName={requestingOrg?.name ?? "Unknown organization"}
      supplierProductName={supplierProduct?.name ?? "Unknown product"}
      packagingItemName={packagingItem?.name ?? "Unknown packaging item"}
      supplierOrgName={supplierOrg?.name ?? "Unknown supplier"}
      groupedRequested={groupedRequested}
      approvedAttributes={approvedAttributes}
    />
  );
}
