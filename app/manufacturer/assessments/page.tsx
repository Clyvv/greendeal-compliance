import { getPackagingItems } from "@/lib/services/mockPackagingService";
import { getAssessmentHistory } from "@/lib/services/mockAssessmentService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import {
  AssessmentHistoryTable,
  type AssessmentHistoryRow,
} from "@/components/assessments/assessment-history-table";

// New assessments must show up here immediately after being run, so
// this route shouldn't be build-time cached.
export const dynamic = "force-dynamic";

export default async function ManufacturerAssessmentsPage() {
  const packagingItems = await getPackagingItems(CURRENT_MANUFACTURER_ORG_ID);

  const rows: AssessmentHistoryRow[] = (
    await Promise.all(
      packagingItems.map(async (item) => {
        const history = await getAssessmentHistory(item.id);
        return history.map((assessment) => ({
          assessment,
          packagingItemName: item.name,
        }));
      })
    )
  )
    .flat()
    .sort((a, b) => (a.assessment.createdAt < b.assessment.createdAt ? 1 : -1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Assessments</h1>
        <p className="text-sm text-slate-500">
          Run and review PPWR compliance assessments.
        </p>
      </div>
      <AssessmentHistoryTable
        rows={rows}
        showPackagingItemColumn
        emptyStateDescription="Compliance assessments will appear here once run."
      />
    </div>
  );
}
