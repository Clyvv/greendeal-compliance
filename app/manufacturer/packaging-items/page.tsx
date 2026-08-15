import { EmptyState } from "@/components/ui/empty-state";

export default function ManufacturerPackagingItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Packaging Items
        </h1>
        <p className="text-sm text-slate-500">
          Manage packaging items and their components.
        </p>
      </div>
      <EmptyState
        title="No packaging items yet"
        description="Packaging items will appear here once created."
      />
    </div>
  );
}
