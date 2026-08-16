import {
  getPackagingComponents,
  getPackagingItems,
} from "@/lib/services/mockPackagingService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import { calculatePackagingDataCompletenessPercent } from "@/lib/packaging-utils";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// Packaging items created here must show up immediately — force
// per-request rendering rather than the build-time static prerender
// this route would otherwise get.
export const dynamic = "force-dynamic";

export default async function ManufacturerDashboardPage() {
  const items = await getPackagingItems(CURRENT_MANUFACTURER_ORG_ID);

  const componentsByItem = await Promise.all(
    items.map((item) => getPackagingComponents(item.id))
  );
  const allComponents = componentsByItem.flat();

  const dataCompletenessPercent = calculatePackagingDataCompletenessPercent(
    allComponents
  );
  const completeComponentCount = allComponents.filter(
    (component) => component.dataAvailability === "COMPLETE"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manufacturer overview and compliance status at a glance.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No packaging items yet"
          description="Create a packaging item to see your compliance dashboard."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricTile label="Packaging Items" value={items.length} />
          <MetricTile
            label="Data Completeness"
            value={`${dataCompletenessPercent}%`}
            hint={`${completeComponentCount} of ${allComponents.length} components authorized`}
          />
          <PlaceholderMetricTile
            label="Pending Supplier Requests"
            hint="Coming in Stage 4/5"
          />
          <PlaceholderMetricTile
            label="Assessments"
            hint="Coming in Stage 7"
          />
          <PlaceholderMetricTile
            label="Compliance Status"
            hint="Coming in Stage 7"
          />
          <PlaceholderMetricTile
            label="Supplier Data Changes"
            hint="Coming in Stage 10"
          />
        </div>
      )}
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Visually distinct from MetricTile on purpose — a bare "0" would look
 * like a real computed zero. These are features that don't exist yet
 * (Stage 4/5/7/10), not metrics that happen to currently be zero.
 */
function PlaceholderMetricTile({
  label,
  hint,
}: {
  label: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-400">—</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
