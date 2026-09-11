import { notFound } from "next/navigation";
import { getAssessment } from "@/lib/services/mockAssessmentService";
import {
  getPackagingComponents,
  getPackagingItem,
} from "@/lib/services/mockPackagingService";
import { getExternalSupplierProduct } from "@/lib/services/mockExternalSupplierService";
import {
  AssessmentResultsView,
  type UnverifiedComponentSummary,
} from "@/components/assessments/assessment-results-view";

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

  // Stage 7.8 — no new field on ComplianceAssessment itself (it stays
  // exactly DOMAIN.md §3's shape); this re-reads the packaging item's
  // CURRENT components at render time, the same way packagingItemName
  // above is resolved rather than stored on the assessment. If a
  // component's source changes after this assessment ran, the results
  // page reflects today's provenance, not a frozen snapshot — a real
  // calculation-view (out of scope here, see STAGE_7_REVIEW.md) would
  // eventually want to snapshot this properly.
  const components = await getPackagingComponents(assessment.packagingItemId);
  const unverifiedComponents: UnverifiedComponentSummary[] = (
    await Promise.all(
      components
        .filter((component) => component.externalSupplierProductId)
        .map(async (component) => ({
          componentId: component.id,
          role: component.role,
          externalProduct: await getExternalSupplierProduct(
            component.externalSupplierProductId!
          ),
        }))
    )
  );

  return (
    <AssessmentResultsView
      assessment={assessment}
      packagingItemName={packagingItem?.name ?? "Unknown packaging item"}
      packagingItemId={assessment.packagingItemId}
      unverifiedComponents={unverifiedComponents}
    />
  );
}
