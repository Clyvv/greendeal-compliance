import { EmptyState } from "@/components/ui/empty-state";

export default function ManufacturerAssessmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Assessments</h1>
        <p className="text-sm text-slate-500">
          Run and review PPWR compliance assessments.
        </p>
      </div>
      <EmptyState
        title="No assessments yet"
        description="Compliance assessments will appear here once run."
      />
    </div>
  );
}
