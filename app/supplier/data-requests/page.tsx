import { EmptyState } from "@/components/ui/empty-state";

export default function SupplierDataRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Data Requests</h1>
        <p className="text-sm text-slate-500">
          Review and respond to manufacturer data requests.
        </p>
      </div>
      <EmptyState
        title="No data requests yet"
        description="Incoming data requests from manufacturers will appear here."
      />
    </div>
  );
}
