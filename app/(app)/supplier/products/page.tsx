import Link from "next/link";
import {
  getProductVersions,
  getSupplierProducts,
} from "@/lib/services/mockProductService";
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { ProductVersion, SupplierProduct } from "@/lib/types";

// Products created via the Create Product wizard (Stage 1b) must show
// up here immediately — force per-request rendering rather than the
// build-time static prerender this route would otherwise get.
export const dynamic = "force-dynamic";

export default async function SupplierProductsPage() {
  const products = await getSupplierProducts(CURRENT_SUPPLIER_ORG_ID);

  const versionsByProduct = await Promise.all(
    products.map((product) => getProductVersions(product.id))
  );

  const rows: { product: SupplierProduct; currentVersion?: ProductVersion }[] =
    products.map((product, index) => ({
      product,
      currentVersion: versionsByProduct[index].find(
        (version) => version.id === product.currentVersionId
      ),
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage your product compliance data.
          </p>
        </div>
        <Link href="/supplier/products/new">
          <Button type="button">Create Product</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Supplier products will appear here once added."
          action={
            <Link href="/supplier/products/new">
              <Button type="button">Create Product</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Recycled Content</TableHead>
              <TableHead>Completeness</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ product, currentVersion }) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-slate-900">
                  <Link
                    href={`/supplier/products/${product.id}`}
                    className="hover:underline"
                  >
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>
                  {currentVersion
                    ? `${currentVersion.physical.materialFamily} (${currentVersion.physical.specificMaterial})`
                    : "—"}
                </TableCell>
                <TableCell>
                  {currentVersion
                    ? `${currentVersion.physical.netWeightGrams}g`
                    : "—"}
                </TableCell>
                <TableCell>
                  {currentVersion
                    ? `${currentVersion.circularity.totalRecycledContentPercent}%`
                    : "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      product.completenessPercent === 100
                        ? "font-medium text-emerald-700"
                        : "font-medium text-amber-700"
                    }
                  >
                    {product.completenessPercent}%
                  </span>
                </TableCell>
                <TableCell>
                  {currentVersion ? `v${currentVersion.versionLabel}` : "—"}
                </TableCell>
                <TableCell>
                  <StatusPill
                    status={
                      product.status === "PUBLISHED" ? "complete" : "pending"
                    }
                    label={product.status === "PUBLISHED" ? "Published" : "Draft"}
                  />
                </TableCell>
                <TableCell>{formatDate(product.lastUpdated)}</TableCell>
                <TableCell>
                  <Link
                    href={`/supplier/products/${product.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
