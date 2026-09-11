import { notFound } from "next/navigation";
import {
  getApprovalForRequest,
  getDataRequest,
  getRequestCoverage,
} from "@/lib/services/mockRequestService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { getSupplierProduct } from "@/lib/services/mockProductService";
import { getPackagingItem } from "@/lib/services/mockPackagingService";
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { groupRequestedAttributesBySection } from "@/lib/requests/fields";
import { getRequestingPartyName } from "@/lib/requests/requester";
import { getEffectiveOrigin } from "@/lib/requests/origin";
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

  const [requestingOrg, supplierOrg, supplierProduct, packagingItem, approval, coverage] =
    await Promise.all([
      getOrganization(request.requestingOrgId),
      getOrganization(request.supplierOrgId),
      getSupplierProduct(request.supplierProductId),
      getPackagingItem(request.packagingItemId),
      // Stage 7.6 — a direct dataRequestId -> DataApproval lookup
      // (getApprovalForRequest), not the component-based
      // getAuthorizedData this page used through Stage 7.5. A
      // PUBLIC_REQUEST_LINK request has no packaging component to
      // route through at all (no packagingItemId — Stage 7.5), so
      // that approach silently produced `undefined` for exactly the
      // requests this stage adds visibility for; this lookup is
      // correct for both origins.
      getApprovalForRequest(request.id),
      // Original requirements doc §8: what the supplier already has
      // on file for this product, regardless of origin (see
      // getRequestCoverage's own comment for why it doesn't need to
      // branch on GREENDEAL vs PUBLIC_REQUEST_LINK itself).
      getRequestCoverage(request.id),
    ]);

  const approvedAttributes: string[] | undefined =
    request.status === "APPROVED" ? approval?.approvedAttributes : undefined;

  const groupedRequested = groupRequestedAttributesBySection(
    request.requestedAttributes
  );

  return (
    <DataRequestApprovalFlow
      request={request}
      origin={getEffectiveOrigin(request)}
      // Stage 7.7 — the plain company/org name, no "(External
      // Request)" suffix: the origin badge + Requester Details card
      // on this page already establish that context, so the approval
      // review/confirmation sentences read naturally either way
      // ("...will be shared with Acme Bottling Co." not "...with Acme
      // Bottling Co. (External Request)").
      requestingOrgName={getRequestingPartyName(request, requestingOrg?.name)}
      supplierProductName={supplierProduct?.name ?? "Unknown product"}
      // Undefined (not a fallback string) when request.packagingItemId
      // itself is unset — a PUBLIC_REQUEST_LINK request genuinely has
      // none (Stage 7.5), so the component omits that field entirely
      // rather than showing a misleading "Unknown packaging item".
      packagingItemName={packagingItem?.name}
      supplierOrgName={supplierOrg?.name ?? "Unknown supplier"}
      groupedRequested={groupedRequested}
      approvedAttributes={approvedAttributes}
      coverage={coverage?.coverage}
    />
  );
}
