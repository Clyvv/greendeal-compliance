import { EmptyState } from "@/components/ui/empty-state";

export default function ManufacturerDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-500">
          Generated conformance documents.
        </p>
      </div>
      <EmptyState
        title="No documents yet"
        description="Generated compliance documents will appear here."
      />
    </div>
  );
}
