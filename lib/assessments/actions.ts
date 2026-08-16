"use server";

import { revalidatePath } from "next/cache";
import { runAssessment } from "@/lib/services/mockAssessmentService";
import type { ComplianceAssessment } from "@/lib/types";

// Server Action, invoked directly from the client RunAssessmentButton
// component so it can drive its own step-by-step processing UI (same
// pattern as lib/requests/actions.ts's submitDataRequestAction) —
// returns the finished assessment rather than calling redirect() here,
// so the client can navigate itself with router.push() once its
// minimum step-narration time has elapsed.
export async function runAssessmentAction(
  packagingItemId: string
): Promise<ComplianceAssessment> {
  const assessment = await runAssessment(packagingItemId);

  revalidatePath(`/manufacturer/packaging-items/${packagingItemId}`);
  revalidatePath("/manufacturer/assessments");
  revalidatePath(`/manufacturer/assessments/${assessment.id}`);

  return assessment;
}
