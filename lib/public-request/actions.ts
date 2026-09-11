"use server";

import {
  submitPublicDataRequest,
  type SubmitPublicDataRequestInput,
  type SubmitPublicDataRequestResult,
} from "@/lib/services/mockPublicRequestService";

// Server Action, invoked directly from the client PublicRequestForm
// component (not a plain <form action>), so the form controls its own
// pending/error/confirmation UI — same pattern as
// lib/requests/actions.ts's submitDataRequestAction. This route has no
// authenticated session at all (AGENTS.md §10a) — nothing here reads
// or assumes a Greendeal account exists for the caller.
export async function submitPublicDataRequestAction(
  input: SubmitPublicDataRequestInput
): Promise<SubmitPublicDataRequestResult> {
  return submitPublicDataRequest(input);
}
