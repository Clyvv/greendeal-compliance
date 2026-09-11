"use server";

import { revalidatePath } from "next/cache";
import {
  approveDataRequest,
  createDataRequest,
  generateRequestResult,
  getDataRequest,
  rejectDataRequest,
} from "@/lib/services/mockRequestService";
import {
  getPackagingComponentsByProduct,
  updateComponentAuthorizationStatus,
} from "@/lib/services/mockPackagingService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import type { DataApproval } from "@/lib/types";
import type { GenerateRequestResultResult } from "@/lib/services/mockRequestService";

export interface SubmitDataRequestInput {
  packagingItemId: string;
  packagingComponentId: string;
  supplierProductId: string;
  supplierOrgId: string;
  requestedAttributes: string[];
  purpose: string;
}

// Server Action, invoked directly from the client DataRequestFlow
// component (not via a plain <form action>), so the flow can control
// its own step/pending/error UI — same pattern as
// lib/wizard/actions.ts. Returns a plain serializable result rather
// than calling redirect() here, so the client can navigate itself with
// router.push() once the toast has been shown.
export async function submitDataRequestAction(
  input: SubmitDataRequestInput
): Promise<{ requestId: string }> {
  const purpose = input.purpose.trim();

  // Belt-and-suspenders: the Request Summary screen's own validation
  // should already prevent this, but never trust client-side
  // validation alone (AGENTS.md §7 — requests are always field-level
  // and always have a stated purpose, never blank/"everything").
  if (input.requestedAttributes.length === 0) {
    throw new Error("Select at least one field to request.");
  }
  if (!purpose) {
    throw new Error("Purpose is required.");
  }

  const request = await createDataRequest({
    requestingOrgId: CURRENT_MANUFACTURER_ORG_ID,
    supplierOrgId: input.supplierOrgId,
    supplierProductId: input.supplierProductId,
    packagingItemId: input.packagingItemId,
    requestedAttributes: input.requestedAttributes,
    purpose,
  });

  // Reflect the pending request on the component immediately — this is
  // what takes "Request Data" off the table for this component until
  // Stage 5's approval flow resolves it.
  await updateComponentAuthorizationStatus(
    input.packagingComponentId,
    "PENDING"
  );

  revalidatePath(`/manufacturer/packaging-items/${input.packagingItemId}`);
  revalidatePath("/manufacturer/data-requests");

  return { requestId: request.id };
}

// Flips every PackagingComponent this DataRequest concerns to the
// given authorizationStatus. A DataRequest doesn't store a componentId
// directly (DOMAIN.md §3), so it's resolved via (packagingItemId,
// supplierProductId) instead — see
// mockPackagingService.getPackagingComponentsByProduct.
async function syncComponentAuthorization(
  packagingItemId: string | undefined,
  supplierProductId: string,
  status: "AUTHORIZED" | "REJECTED"
) {
  const components = await getPackagingComponentsByProduct(
    packagingItemId,
    supplierProductId
  );
  await Promise.all(
    components.map((component) =>
      updateComponentAuthorizationStatus(component.id, status)
    )
  );
}

// Server Action, invoked from the client DataRequestApprovalFlow
// component (Stage 5's supplier-side approval screen). Approves only
// the still-checked subset of fields (AGENTS.md §7 — never
// all-or-nothing), then syncs the related PackagingComponent(s) to
// AUTHORIZED so the manufacturer side reflects it without a page
// refresh workaround.
export async function approveDataRequestAction(
  requestId: string,
  approvedAttributes: string[]
): Promise<DataApproval> {
  const request = await getDataRequest(requestId);
  if (!request) {
    throw new Error("Data request not found.");
  }

  const approval = await approveDataRequest(requestId, approvedAttributes);

  await syncComponentAuthorization(
    request.packagingItemId,
    request.supplierProductId,
    "AUTHORIZED"
  );

  revalidatePath("/supplier/data-requests");
  revalidatePath(`/supplier/data-requests/${requestId}`);
  revalidatePath(`/manufacturer/packaging-items/${request.packagingItemId}`);
  revalidatePath("/manufacturer/data-requests");

  return approval;
}

// Server Action for the Reject path — rejects the whole request (no
// partial state per this stage's prompt) and syncs the related
// component(s) to REJECTED so the manufacturer side shows a clear
// rejected state rather than staying stuck on PENDING.
export async function rejectDataRequestAction(
  requestId: string,
  reason?: string
): Promise<void> {
  const request = await getDataRequest(requestId);
  if (!request) {
    throw new Error("Data request not found.");
  }

  await rejectDataRequest(requestId, reason);

  await syncComponentAuthorization(
    request.packagingItemId,
    request.supplierProductId,
    "REJECTED"
  );

  revalidatePath("/supplier/data-requests");
  revalidatePath(`/supplier/data-requests/${requestId}`);
  revalidatePath(`/manufacturer/packaging-items/${request.packagingItemId}`);
  revalidatePath("/manufacturer/data-requests");
}

// Stage 7.12 — invoked from the client
// components/requests/request-result-notification.tsx, both
// automatically right after a PUBLIC_REQUEST_LINK-origin request is
// approved, and later via its "View Notification Email" reopen button
// (which reuses the same token — see
// mockRequestService.generateRequestResult).
export async function generateRequestResultAction(
  requestId: string
): Promise<GenerateRequestResultResult> {
  const result = await generateRequestResult(requestId);
  revalidatePath(`/supplier/data-requests/${requestId}`);
  return result;
}
