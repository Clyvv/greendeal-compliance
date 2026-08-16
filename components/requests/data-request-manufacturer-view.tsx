import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/lib/utils";
import {
  DATA_REQUEST_STATUS_LABELS,
  DATA_REQUEST_STATUS_TO_PILL,
} from "@/lib/requests/status";
import type { DataRequest } from "@/lib/types";
import type { GroupedRequestedAttributes } from "@/lib/requests/fields";

export interface DataRequestManufacturerViewProps {
  request: DataRequest;
  supplierOrgName: string;
  supplierProductName: string;
  packagingItemName: string;
  groupedRequested: GroupedRequestedAttributes[];
  /** Only meaningful when request.status === "APPROVED" — the subset of
   * requestedAttributes the supplier actually granted (see
   * getAuthorizedData). Anything requested but absent here was denied. */
  approvedAttributes?: string[];
}

/**
 * Read-only mirror of Stage 5's supplier approval screen, for the
 * manufacturer side (Stage 5 corrective addition). No actions here —
 * Coca-Cola can only view the request and its outcome, never approve/
 * reject its own request. Per AGENTS.md §7, a denied field must render
 * as clearly "requested, not approved" rather than silently
 * disappearing from the list.
 */
export function DataRequestManufacturerView({
  request,
  supplierOrgName,
  supplierProductName,
  packagingItemName,
  groupedRequested,
  approvedAttributes,
}: DataRequestManufacturerViewProps) {
  const approvedSet = new Set(approvedAttributes ?? []);
  const approvedCount = request.requestedAttributes.filter((attribute) =>
    approvedSet.has(attribute)
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/manufacturer/data-requests"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to Data Requests
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Data Request
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Requested {formatDate(request.requestDate)}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Supplier
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {supplierOrgName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Packaging item
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {packagingItemName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Product
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {supplierProductName}
              </dd>
            </div>
          </dl>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Purpose
            </dt>
            <dd className="mt-0.5 text-sm text-slate-900">
              {request.purpose}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </dt>
            <dd className="mt-1">
              <StatusPill
                status={DATA_REQUEST_STATUS_TO_PILL[request.status]}
                label={DATA_REQUEST_STATUS_LABELS[request.status]}
              />
            </dd>
          </div>
        </CardContent>
      </Card>

      {request.status === "PENDING" && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">
            ⏳ Awaiting review by {supplierOrgName} — no action is needed
            from Coca-Cola right now.
          </p>
        </div>
      )}

      {request.status === "APPROVED" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ Approved — the fields marked below are now authorized for
            use.
          </p>
          {approvedCount < request.requestedAttributes.length && (
            <p className="mt-1 text-xs text-emerald-700">
              {supplierOrgName} did not approve every field that was
              requested — fields marked 🔒 below were denied and remain
              unavailable.
            </p>
          )}
        </div>
      )}

      {request.status === "REJECTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            ✕ Rejected — {supplierOrgName} declined this request. No
            fields were shared.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requested Data</CardTitle>
          {request.status === "APPROVED" && (
            <Badge tone="neutral">
              {approvedCount} of {request.requestedAttributes.length}{" "}
              approved
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {request.status === "APPROVED" && (
            <p className="text-xs text-slate-500">
              ✓ approved · 🔒 requested, not approved
            </p>
          )}
          {groupedRequested.map((group) => (
            <div key={group.key}>
              <p className="text-sm font-semibold text-slate-900">
                {group.title}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {group.attributes.map((attribute) => {
                  if (request.status === "APPROVED") {
                    const isApproved = approvedSet.has(attribute);
                    return (
                      <li key={attribute}>
                        <Badge tone={isApproved ? "success" : "neutral"}>
                          {isApproved ? "✓" : "🔒"} {attribute}
                        </Badge>
                      </li>
                    );
                  }
                  if (request.status === "REJECTED") {
                    return (
                      <li key={attribute}>
                        <Badge tone="danger">✕ {attribute}</Badge>
                      </li>
                    );
                  }
                  return (
                    <li key={attribute}>
                      <Badge tone="neutral">⏳ {attribute}</Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
