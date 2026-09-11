import Link from "next/link";
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
 * yet.
 *
 * Stage 7.11 — `hasSupplier` now genuinely branches this card into two
 * different situations, not just two variants of the same one:
 * - hasSupplier: true — "Add External Supplier Product" (unchanged
 *   from Stage 7.10). A real supplier exists; shows the "Request
 *   Information from Supplier" affordance (request-information-button.tsx),
 *   which flips to a success banner once responseStatus is 'COMPLETED'
 *   (the ProvenanceBadge above reflects that upgrade automatically —
 *   buildExternalSupplierProvenance always reads sourceType/
 *   verificationStatus straight off the entity).
 * - hasSupplier: false — "Use Existing Manufacturer-Provided Data".
 *   There is no supplier to request anything from, ever — the
 *   "Request Information from Supplier" action is not merely disabled,
 *   it's not rendered at all, and the copy below says so plainly
 *   rather than implying a supplier relationship that doesn't exist.
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
  // Defaults to true (the original, pre-Stage-7.11 behavior) only in
  // the edge case where the record itself failed to resolve — once
  // externalSupplierProduct is loaded, hasSupplier is always a real
  // boolean.
  const hasSupplier = externalSupplierProduct?.hasSupplier ?? true;

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
              {hasSupplier ? (
                <>
                  Claimed supplier:{" "}
                  {externalSupplierProduct?.supplierCompanyName ?? "Unknown"}
                  {externalSupplierProduct?.supplierCountry
                    ? ` · ${externalSupplierProduct.supplierCountry}`
                    : ""}
                </>
              ) : (
                "No supplier associated — self-reported by manufacturer"
              )}
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
              hasSupplier ? (
                // Deliberately not AUTHORIZATION_STATUS_TO_PILL's
                // NOT_REQUESTED ("Not Authorized" 🔒) — that implies a
                // real supplier org exists and simply hasn't been asked
                // yet. There isn't one on Greendeal, so this says so
                // directly.
                <StatusPill
                  status="not-authorized"
                  label="No registered supplier"
                />
              ) : (
                // "Not applicable" (○), not "not authorized" (🔒) — for
                // a hasSupplier:false record there is no supplier
                // concept here at all to be (un)authorized, so ○ is the
                // accurate icon per AGENTS.md §4, not just the closest
                // available one.
                <StatusPill status="not-applicable" label="No supplier" />
              )
            }
          />
        </dl>

        {!hasSupplier ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              No supplier associated — data self-reported by manufacturer.
              This is the permanent state for this component, not a step
              on the way to something else: there is no supplier to
              invite or request more from, and this data will not become
              supplier-verified.
            </p>
          </div>
        ) : externalSupplierProduct?.responseStatus === "COMPLETED" ? (
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
          <Link
            href={`/manufacturer/packaging-items/${packagingItemId}/components/${component.id}`}
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            View / Edit Details →
          </Link>
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
