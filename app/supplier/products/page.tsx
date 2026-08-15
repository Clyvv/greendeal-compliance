import { EmptyState } from "@/components/ui/empty-state";

export default function SupplierProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Products</h1>
        <p className="text-sm text-slate-500">
          Manage your product compliance data.
        </p>
      </div>
      <EmptyState
        title="No products yet"
        description="Supplier products will appear here once added."
      />
    </div>
  );
}
