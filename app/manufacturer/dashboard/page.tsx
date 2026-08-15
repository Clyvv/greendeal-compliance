import { EmptyState } from "@/components/ui/empty-state";

export default function ManufacturerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manufacturer overview and compliance status at a glance.
        </p>
      </div>
      <EmptyState
        title="No dashboard data yet"
        description="Manufacturer dashboard metrics will appear here in a future stage."
      />
    </div>
  );
}
