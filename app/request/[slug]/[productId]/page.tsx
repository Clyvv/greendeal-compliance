import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSupplierProductPublic,
  getSupplierPublicProfile,
} from "@/lib/services/mockPublicRequestService";
import { SupplierRequestIntro } from "@/components/public-request/supplier-request-intro";
import { PublicContinuePlaceholder } from "@/components/public-request/public-continue-placeholder";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProductPublicRequestPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;

  // Resolve the supplier first so an unknown slug 404s the same way
  // the supplier-level page does, rather than a confusing "product not
  // found" for a link that was never valid in the first place.
  const profile = await getSupplierPublicProfile(slug);
  if (!profile) notFound();

  // Only ever resolves a product that's both PUBLISHED and actually
  // this supplier's own (see mockPublicRequestService) — a guessed or
  // stale productId 404s exactly like an unknown one would.
  const product = await getSupplierProductPublic(slug, productId);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <SupplierRequestIntro
        supplierName={profile.supplierName}
        description="You're requesting compliance information for the product below."
      />

      {/* Product is preselected here — no selector, unlike the
          supplier-level page (this stage's scope, item 4). */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Product
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {product.name}
          </p>
          <p className="text-xs text-slate-500">SKU {product.sku}</p>
        </CardContent>
      </Card>

      <PublicContinuePlaceholder />

      {profile.publishedProducts.length > 1 && (
        <p className="text-xs text-slate-500">
          Requesting a different product from {profile.supplierName}?{" "}
          <Link
            href={`/request/${slug}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            Choose another product
          </Link>
          .
        </p>
      )}
    </div>
  );
}
