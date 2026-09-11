import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { RequestInformationButton } from "./request-information-button";
import { RemoveComponentButton } from "./remove-component-button";
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
 * supplier" state and a "Request Information from Supplier" affordance
 * (Stage 7.10 — see request-information-button.tsx) instead of a
 * "Request Data" button. Once the supplier completes that response
 * (responseStatus 'COMPLETED'), the banner below flips to a success
 * state and the ProvenanceBadge above automatically reflects the
 * upgraded sourceType/verificationStatus (buildExternalSupplierProvenance
 * always reads those straight off the entity).
 */
export function ExternalPackagingComponentCard({
  component,
  packagingItemId,
  externalSupplierProduct,
}: {
  component: PackagingComponent;
  packagingItemId: string;
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

        {externalSupplierProduct?.responseStatus === "COMPLETED" ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm text-emerald-800">
              ✓ The supplier completed their response — this record now
              reflects supplier-provided data (see provenance above),
              though it&rsquo;s still not a fully onboarded Greendeal
              Supplier Product.
            </p>
            <div className="mt-2">
              <RequestInformationButton
                externalSupplierProductId={externalSupplierProduct.id}
                packagingItemId={packagingItemId}
                defaultEmail={externalSupplierProduct.supplierEmail}
                responseStatus={externalSupplierProduct.responseStatus}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              This product is not currently maintained by the supplier in
              Greendeal.
              {externalSupplierProduct?.responseStatus === "SENT" && (
                <>
                  {" "}
                  <span className="font-medium">
                    ⏳ Information requested — awaiting supplier response.
                  </span>
                </>
              )}
            </p>
            <div className="mt-2">
              <RequestInformationButton
                externalSupplierProductId={
                  externalSupplierProduct?.id ??
                  component.externalSupplierProductId ??
                  ""
                }
                packagingItemId={packagingItemId}
                defaultEmail={externalSupplierProduct?.supplierEmail}
                responseStatus={externalSupplierProduct?.responseStatus ?? "NOT_SENT"}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <RemoveComponentButton
            componentId={component.id}
            packagingItemId={packagingItemId}
            componentLabel={externalSupplierProduct?.productName ?? component.role}
          />
        </div>
      </CardContent>
    </Card>
  );
}
