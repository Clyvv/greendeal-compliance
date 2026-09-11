import { notFound } from "next/navigation";
import { getSupplierPublicProfile } from "@/lib/services/mockPublicRequestService";
import { SupplierRequestIntro } from "@/components/public-request/supplier-request-intro";
import { PublicProductList } from "@/components/public-request/public-product-list";

// A supplier's published product list can change at any time — no
// generateStaticParams here, so nothing should be build-time cached.
export const dynamic = "force-dynamic";

export default async function SupplierPublicRequestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const profile = await getSupplierPublicProfile(slug);
  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <SupplierRequestIntro
        supplierName={profile.supplierName}
        description="Select the product you need compliance information for."
      />
      <PublicProductList slug={profile.slug} products={profile.publishedProducts} />
    </div>
  );
}
