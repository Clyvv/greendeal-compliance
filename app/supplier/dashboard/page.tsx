import { EmptyState } from "@/components/ui/empty-state";

export default function SupplierDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Supplier overview and compliance status at a glance.
        </p>
      </div>
      <EmptyState
        title="No dashboard data yet"
        description="Supplier dashboard metrics will appear here in a future stage."
      />
    </div>
  );
}
