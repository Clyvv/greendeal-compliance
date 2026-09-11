import { getOrganization } from "@/lib/services/mockOrganizationService";
import { getSupplierProducts } from "@/lib/services/mockProductService";
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { CopyLinkRow } from "@/components/public-request/copy-link-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// Newly published products must get a working link immediately, and
// this route has no generateStaticParams, so nothing here should be
// build-time cached.
export const dynamic = "force-dynamic";

export default async function SupplierRequestLinksPage() {
  const [org, products] = await Promise.all([
    getOrganization(CURRENT_SUPPLIER_ORG_ID),
    getSupplierProducts(CURRENT_SUPPLIER_ORG_ID),
  ]);

  const slug = org?.slug;
  const publishedProducts = products.filter(
    (product) => product.status === "PUBLISHED"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Request Links
        </h1>
        {/* Original requirements doc §6 */}
        <p className="mt-1 text-sm text-slate-500">
          Share this link with customers who request compliance
          information from you. Customers can select the information
          they need. You review every request before information is
          shared.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {slug ? (
            <>
              <CopyLinkRow path={`/request/${slug}`} copyLabel="Copy Supplier Link" />
              <p className="text-xs text-slate-500">
                Customers who open this link choose which of your
                published products they need compliance information
                about.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No public link is configured for this supplier yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Product Links ({publishedProducts.length})
        </h2>
        {publishedProducts.length === 0 ? (
          <EmptyState
            title="No published products yet"
            description="Publish a product to get its own request link customers can use directly."
          />
        ) : !slug ? (
          <p className="text-sm text-slate-500">
            No public link is configured for this supplier yet.
          </p>
        ) : (
          <div className="space-y-3">
            {publishedProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="space-y-2 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">SKU {product.sku}</p>
                  </div>
                  <CopyLinkRow
                    path={`/request/${slug}/${product.id}`}
                    copyLabel="Copy Product Link"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
