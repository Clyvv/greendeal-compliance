import { notFound } from "next/navigation";
import { getAssessment } from "@/lib/services/mockAssessmentService";
import { getPackagingItem } from "@/lib/services/mockPackagingService";
import { AssessmentResultsView } from "@/components/assessments/assessment-results-view";

// An assessment can be created moments before this page is visited
// (straight from the RunAssessmentButton's redirect), so nothing here
// should be build-time cached.
export const dynamic = "force-dynamic";

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const assessment = await getAssessment(id);
  if (!assessment) notFound();

  const packagingItem = await getPackagingItem(assessment.packagingItemId);

  return (
    <AssessmentResultsView
      assessment={assessment}
      packagingItemName={packagingItem?.name ?? "Unknown packaging item"}
      packagingItemId={assessment.packagingItemId}
    />
  );
}
