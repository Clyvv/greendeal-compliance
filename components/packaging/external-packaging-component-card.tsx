import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { InviteSupplierButton } from "./invite-supplier-button";
import { DetailField } from "./packaging-component-card";
import { buildExternalSupplierProvenance } from "@/lib/provenance";
import type { ExternalSupplierProduct, PackagingComponent } from "@/lib/types";

/**
 * Stage 7.3 — the card body for a component sourced from an
 * ExternalSupplierProduct rather than a real SupplierProduct
 * (AGENTS.md §10a scenarios 2/4). Deliberately does NOT reuse the
 * native card's authorization/data-availability rendering — there is
 * no supplier org in Greendeal yet to request anything from, so a
 * NOT_REQUESTED/MISSING pill pair (what's actually stored — see
 * mockPackagingService.addPackagingComponent's comment) would
 * misleadingly imply a supplier exists and simply hasn't been asked
 * yet. This card replaces that with an explicit "No registered
 * supplier" state and an "Invite Supplier" affordance instead of a
 * "Request Data" button.
 */
export function ExternalPackagingComponentCard({
  component,
  externalSupplierProduct,
}: {
  component: PackagingComponent;
  externalSupplierProduct?: ExternalSupplierProduct;
}) {
  const provenance = externalSupplierProduct
    ? buildExternalSupplierProvenance(externalSupplierProduct)
    : buildExternalSupplierProvenance({
        sourceType: "MANUFACTURER_PROVIDED",
        verificationStatus: "UNVERIFIED",
      });

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="neutral">{component.role}</Badge>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {externalSupplierProduct?.productName ?? "Unknown product"}
            </p>
            <p className="text-xs text-slate-500">
              Claimed supplier:{" "}
              {externalSupplierProduct?.supplierCompanyName ?? "Unknown"}
              {externalSupplierProduct?.supplierCountry
                ? ` · ${externalSupplierProduct.supplierCountry}`
                : ""}
            </p>
            <div className="mt-1">
              <ProvenanceBadge provenance={provenance} />
            </div>
          </div>
          <Badge tone="warning">External Supplier Product</Badge>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetailField
            label="Material Family"
            value={externalSupplierProduct?.knownMaterialFamily ?? "—"}
          />
          <DetailField
            label="Known Weight"
            value={
              externalSupplierProduct?.knownWeightGrams !== undefined
                ? `${externalSupplierProduct.knownWeightGrams}g`
                : "—"
            }
          />
          <DetailField
            label="Supplier Registration"
            value={
              // Deliberately not AUTHORIZATION_STATUS_TO_PILL's
              // NOT_REQUESTED ("Not Authorized" 🔒) — that implies a
              // real supplier org exists and simply hasn't been asked
              // yet. There isn't one, so this says so directly.
              <StatusPill
                status="not-authorized"
                label="No registered supplier"
              />
            }
          />
        </dl>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            This product is not currently maintained by the supplier in
            Greendeal.
          </p>
          <div className="mt-2">
            <InviteSupplierButton
              externalSupplierProductId={
                externalSupplierProduct?.id ??
                component.externalSupplierProductId ??
                ""
              }
              defaultEmail={externalSupplierProduct?.supplierEmail}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
