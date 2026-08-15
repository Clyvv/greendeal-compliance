import {
  getProductEvidence,
  getSupplierProducts,
} from "@/lib/services/mockProductService";
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { isExpiringSoon } from "@/lib/evidence-utils";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";

// Products created via the Create Product wizard (Stage 1b) must be
// reflected here immediately — force per-request rendering rather than
// the build-time static prerender this route would otherwise get.
export const dynamic = "force-dynamic";

export default async function SupplierDashboardPage() {
  const products = await getSupplierProducts(CURRENT_SUPPLIER_ORG_ID);

  const evidenceByProduct = await Promise.all(
    products.map((product) => getProductEvidence(product.currentVersionId))
  );

  const totalProducts = products.length;
  const completeProducts = products.filter(
    (product) => product.completenessPercent === 100
  ).length;
  const incompleteProducts = totalProducts - completeProducts;

  // Data Requests land in a later stage — placeholder for now.
  const pendingRequestsCount = 0;

  const expiringEvidenceCount = evidenceByProduct.reduce(
    (count, productEvidence) =>
      count + productEvidence.filter((item) => isExpiringSoon(item)).length,
    0
  );

  const recentlyUpdated = [...products]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Supplier overview and compliance status at a glance.
        </p>
      </div>

      {totalProducts === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add a product to see your compliance dashboard."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile label="Products" value={totalProducts} />
            <MetricTile
              label="Complete Products"
              value={completeProducts}
              hint={`${incompleteProducts} incomplete`}
            />
            <MetricTile
              label="Pending Data Requests"
              value={pendingRequestsCount}
              hint="Coming in a later stage"
            />
            <MetricTile
              label="Evidence Expiring Soon"
              value={expiringEvidenceCount}
              hint="Within 60 days"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recently Updated Products</CardTitle>
              <CardDescription>
                Sorted by most recently updated.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-200">
                {recentlyUpdated.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        SKU {product.sku} · Updated{" "}
                        {formatDate(product.lastUpdated)}
                      </p>
                    </div>
                    <StatusPill
                      status={
                        product.completenessPercent === 100
                          ? "complete"
                          : "missing"
                      }
                      label={`${product.completenessPercent}% complete`}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
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
  value: number;
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
