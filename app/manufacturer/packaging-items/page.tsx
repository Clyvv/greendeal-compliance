import Link from "next/link";
import {
  getPackagingComponents,
  getPackagingItems,
} from "@/lib/services/mockPackagingService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import {
  calculatePackagingDataCompletenessPercent,
  getPackagingItemStatus,
} from "@/lib/packaging-utils";
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

// New packaging items must show up here immediately — force
// per-request rendering rather than the build-time static prerender
// this route would otherwise get.
export const dynamic = "force-dynamic";

export default async function ManufacturerPackagingItemsPage() {
  const items = await getPackagingItems(CURRENT_MANUFACTURER_ORG_ID);

  const componentsByItem = await Promise.all(
    items.map((item) => getPackagingComponents(item.id))
  );

  const rows = items.map((item, index) => ({
    item,
    components: componentsByItem[index],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Packaging Items
          </h1>
          <p className="text-sm text-slate-500">
            Manage packaging items and their components.
          </p>
        </div>
        <Link href="/manufacturer/packaging-items/new">
          <Button type="button">Create Packaging Item</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No packaging items yet"
          description="Packaging items will appear here once created."
          action={
            <Link href="/manufacturer/packaging-items/new">
              <Button type="button">Create Packaging Item</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>Packaging Type</TableHead>
              <TableHead>Component Count</TableHead>
              <TableHead>Data Completeness</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ item, components }) => {
              const completenessPercent =
                calculatePackagingDataCompletenessPercent(components);
              const status = getPackagingItemStatus(components);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">
                    <Link
                      href={`/manufacturer/packaging-items/${item.id}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.market}</TableCell>
                  <TableCell>{item.packagingType}</TableCell>
                  <TableCell>{components.length}</TableCell>
                  <TableCell>{completenessPercent}%</TableCell>
                  <TableCell>
                    <StatusPill
                      status={status.pillStatus}
                      label={status.label}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/manufacturer/packaging-items/${item.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
