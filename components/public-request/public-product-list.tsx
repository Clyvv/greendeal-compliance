import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PublicProductSummary } from "@/lib/services/mockPublicRequestService";

/**
 * The supplier-level public page's "product selector" — per this
 * stage's scope, selection IS navigation: picking a product just opens
 * its own /request/{slug}/{productId} page (DOMAIN.md §8a's two public
 * route shapes), rather than introducing separate client-side
 * selection state that Stage 7.5's actual request form would need to
 * reconcile with anyway. Only ever shown PUBLISHED products (see
 * mockPublicRequestService) — nothing about SKU/name here is
 * compliance data, just identity.
 */
export function PublicProductList({
  slug,
  products,
}: {
  slug: string;
  products: PublicProductSummary[];
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products available to request yet"
        description="This supplier hasn't published any products for request through this link yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Select a product
      </p>
      {products.map((product) => (
        <Link key={product.productId} href={`/request/${slug}/${product.productId}`}>
          <Card className="transition hover:border-emerald-400 hover:bg-emerald-50/40">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {product.name}
                </p>
                <p className="text-xs text-slate-500">SKU {product.sku}</p>
              </div>
              <span className="text-sm font-medium text-emerald-700">
                Select →
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
