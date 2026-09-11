import { EmptyState } from "@/components/ui/empty-state";

export default function SupplierEvidencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Evidence</h1>
        <p className="text-sm text-slate-500">
          Manage supporting documents and certificates.
        </p>
      </div>
      <EmptyState
        title="No evidence yet"
        description="Uploaded evidence documents will appear here."
      />
    </div>
  );
}
