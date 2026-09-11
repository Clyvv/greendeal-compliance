import Link from "next/link";
import { getDataRequests } from "@/lib/services/mockRequestService";
import { getOrganization } from "@/lib/services/mockOrganizationService";
import { getSupplierProduct } from "@/lib/services/mockProductService";
import { getPackagingItem } from "@/lib/services/mockPackagingService";
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { formatRequestingPartyName } from "@/lib/requests/requester";
import { formatDate } from "@/lib/utils";
import {
  DATA_REQUEST_STATUS_LABELS,
  DATA_REQUEST_STATUS_TO_PILL,
} from "@/lib/requests/status";
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

// Requests created via Stage 4 (or resolved via Stage 5's approval
// flow) must show up here immediately — force per-request rendering
// rather than the build-time static prerender this route would
// otherwise get.
export const dynamic = "force-dynamic";

export default async function SupplierDataRequestsPage() {
  // Scoped to requests addressed to PET Solutions GmbH only — same
  // ownership discipline as Stage 1a: this supplier never sees a
  // request meant for LabelTech GmbH or PolyCap GmbH.
  const requests = await getDataRequests(CURRENT_SUPPLIER_ORG_ID, "SUPPLIER");

  const rows = await Promise.all(
    requests.map(async (request) => {
      const [requestingOrg, product, packagingItem] = await Promise.all([
        getOrganization(request.requestingOrgId),
        getSupplierProduct(request.supplierProductId),
        getPackagingItem(request.packagingItemId),
      ]);
      // Stage 7.5 — request.requestingOrgId is absent for a
      // PUBLIC_REQUEST_LINK request (no Greendeal Organization behind
      // it); render its self-entered requester info instead of
      // blindly trusting getOrganization()'s result.
      const requestingPartyName = formatRequestingPartyName(
        request,
        requestingOrg?.name
      );
      return { request, requestingPartyName, product, packagingItem };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Data Requests</h1>
        <p className="text-sm text-slate-500">
          Review and respond to manufacturer data requests.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No data requests yet"
          description="Incoming data requests from manufacturers will appear here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requesting Organization</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Packaging Item</TableHead>
              <TableHead>Requested Attributes</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ request, requestingPartyName, product, packagingItem }) => {
              const fieldCount = request.requestedAttributes.length;
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-slate-900">
                    {requestingPartyName}
                  </TableCell>
                  <TableCell>{product?.name ?? "Unknown product"}</TableCell>
                  <TableCell>
                    {packagingItem?.name ?? "Unknown packaging item"}
                  </TableCell>
                  <TableCell>
                    {fieldCount} field{fieldCount === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell
                    className="max-w-xs truncate"
                    title={request.purpose}
                  >
                    {request.purpose}
                  </TableCell>
                  <TableCell>{formatDate(request.requestDate)}</TableCell>
                  <TableCell>
                    <StatusPill
                      status={DATA_REQUEST_STATUS_TO_PILL[request.status]}
                      label={DATA_REQUEST_STATUS_LABELS[request.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/supplier/data-requests/${request.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {request.status === "PENDING" ? "Review" : "View"}
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
