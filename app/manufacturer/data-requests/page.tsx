import { EmptyState } from "@/components/ui/empty-state";

export default function ManufacturerDataRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Data Requests</h1>
        <p className="text-sm text-slate-500">
          Request and track supplier data access.
        </p>
      </div>
      <EmptyState
        title="No data requests yet"
        description="Data requests sent to suppliers will appear here."
      />
    </div>
  );
}
