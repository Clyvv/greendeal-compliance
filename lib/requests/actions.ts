"use server";

import { revalidatePath } from "next/cache";
import { createDataRequest } from "@/lib/services/mockRequestService";
import { updateComponentAuthorizationStatus } from "@/lib/services/mockPackagingService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";

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
