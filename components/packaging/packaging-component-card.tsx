import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  AUTHORIZATION_STATUS_LABELS,
  AUTHORIZATION_STATUS_TO_PILL,
  DATA_AVAILABILITY_LABELS,
  DATA_AVAILABILITY_TO_PILL,
} from "@/lib/packaging-utils";
import type { PackagingComponent } from "@/lib/types";

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  );
}

/**
 * One Packaging Component — reference-level info only (which product,
 * which supplier, which version). Full supplier compliance data
 * (recycled content %, chemical safety, evidence documents, ...) is
 * NEVER fetched or rendered here — that boundary only lifts once a
 * Data Request is approved (Stage 4/5; see AGENTS.md §7).
 */
export function PackagingComponentCard({
  component,
  packagingItemId,
  supplierProductName,
  supplierName,
  versionLabel,
}: {
  component: PackagingComponent;
  packagingItemId: string;
  supplierProductName?: string;
  supplierName?: string;
  versionLabel?: string;
}) {
  const isAuthorized = component.authorizationStatus === "AUTHORIZED";
  const canRequestData = component.authorizationStatus === "NOT_REQUESTED";

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="neutral">{component.role}</Badge>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {supplierProductName ?? "Unknown product"}
            </p>
            <p className="text-xs text-slate-500">
              Source: {supplierProductName ?? "Unknown product"}
              {versionLabel ? ` v${versionLabel}` : ""},{" "}
              {supplierName ?? "Unknown supplier"}
            </p>
          </div>
          <StatusPill
            status={AUTHORIZATION_STATUS_TO_PILL[component.authorizationStatus]}
            label={AUTHORIZATION_STATUS_LABELS[component.authorizationStatus]}
          />
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetailField label="Supplier" value={supplierName ?? "—"} />
          <DetailField
            label="Product Version"
            value={versionLabel ? `v${versionLabel}` : "—"}
          />
          <DetailField
            label="Data Availability"
            value={
              <StatusPill
                status={DATA_AVAILABILITY_TO_PILL[component.dataAvailability]}
                label={DATA_AVAILABILITY_LABELS[component.dataAvailability]}
              />
            }
          />
        </dl>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Evidence Availability
          </p>
          {/* Evidence is gated by the same authorization boundary as
              compliance data at this stage (AGENTS.md §7) — field-level
              approval nuance (a request could approve data but not
              evidence, or vice versa) arrives with Stage 4/5. */}
          <StatusPill
            status={AUTHORIZATION_STATUS_TO_PILL[component.authorizationStatus]}
            label={isAuthorized ? "Available" : "Not Authorized"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="Locked until the supplier authorizes access (Stage 5)"
          >
            View Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="Locked until the supplier authorizes access (Stage 5)"
          >
            View Evidence
          </Button>
          {canRequestData ? (
            <Link
              href={`/manufacturer/packaging-items/${packagingItemId}/request/${component.id}`}
            >
              <Button variant="secondary" size="sm">
                Request Data
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled
              title={
                component.authorizationStatus === "PENDING"
                  ? "Awaiting supplier approval"
                  : "This component's data request has already been resolved"
              }
            >
              {component.authorizationStatus === "PENDING"
                ? "Request Pending"
                : "Request Data"}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="Coming in a later stage"
          >
            Replace Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
