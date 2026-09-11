import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import {
  AUTHORIZATION_STATUS_LABELS,
  AUTHORIZATION_STATUS_TO_PILL,
  DATA_AVAILABILITY_LABELS,
  DATA_AVAILABILITY_TO_PILL,
} from "@/lib/packaging-utils";
import { buildSupplierMaintainedProvenance } from "@/lib/provenance";
import { ExternalPackagingComponentCard } from "./external-packaging-component-card";
import { RemoveComponentButton } from "./remove-component-button";
import type { ExternalSupplierProduct, PackagingComponent } from "@/lib/types";

export function DetailField({ label, value }: { label: string; value: ReactNode }) {
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
  dataRequestId,
  supplierProductName,
  supplierName,
  versionLabel,
  externalSupplierProduct,
}: {
  component: PackagingComponent;
  packagingItemId: string;
  /** The Data Request this component's authorizationStatus came from,
   * if any (Stage 5 corrective addition) — lets the status badge link
   * through to its detail view instead of being a dead end. Undefined
   * for NOT_REQUESTED components, since there's nothing to view yet. */
  dataRequestId?: string;
  supplierProductName?: string;
  supplierName?: string;
  versionLabel?: string;
  /** Set only when component.externalSupplierProductId is set (Stage
   * 7.3) — the resolved ExternalSupplierProduct record. Dispatches to
   * an entirely different card body below; everything else in this
   * function is the unchanged native-component rendering from Stage
   * 7.2, per AGENTS.md's "preserve prior functionality" rule. */
  externalSupplierProduct?: ExternalSupplierProduct;
}) {
  if (component.externalSupplierProductId) {
    return (
      <ExternalPackagingComponentCard
        component={component}
        packagingItemId={packagingItemId}
        externalSupplierProduct={externalSupplierProduct}
      />
    );
  }

  const isAuthorized = component.authorizationStatus === "AUTHORIZED";
  const canRequestData = component.authorizationStatus === "NOT_REQUESTED";

  const authorizationStatusPill = (
    <StatusPill
      status={AUTHORIZATION_STATUS_TO_PILL[component.authorizationStatus]}
      label={AUTHORIZATION_STATUS_LABELS[component.authorizationStatus]}
    />
  );

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
            {/* This reference (which product/version this component
                sources from) is always visible regardless of
                authorizationStatus, per AGENTS.md §6 — it describes the
                supplier's own published product, not the gated
                compliance field values. */}
            <div className="mt-1">
              <ProvenanceBadge
                provenance={buildSupplierMaintainedProvenance(
                  supplierName ?? "Unknown supplier",
                  { productVersionId: component.productVersionId }
                )}
              />
            </div>
          </div>
          {dataRequestId ? (
            <Link
              href={`/manufacturer/data-requests/${dataRequestId}`}
              className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              title="View the underlying data request"
            >
              {authorizationStatusPill}
            </Link>
          ) : (
            authorizationStatusPill
          )}
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
            title={
              isAuthorized
                ? "Full data view arrives in Stage 6"
                : "Locked until the supplier authorizes access"
            }
          >
            View Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled
            title={
              isAuthorized
                ? "Full data view arrives in Stage 6"
                : "Locked until the supplier authorizes access"
            }
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
          ) : component.authorizationStatus === "PENDING" ? (
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Awaiting supplier approval"
            >
              Request Pending
            </Button>
          ) : component.authorizationStatus === "REJECTED" ? (
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="The supplier rejected this data request"
            >
              Request Rejected
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="This component's data is already authorized"
            >
              Authorized
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
          <RemoveComponentButton
            componentId={component.id}
            packagingItemId={packagingItemId}
            componentLabel={supplierProductName ?? component.role}
          />
        </div>
      </CardContent>
    </Card>
  );
}
