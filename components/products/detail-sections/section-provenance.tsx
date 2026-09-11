import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { buildSupplierMaintainedProvenance } from "@/lib/provenance";

/**
 * Shared provenance line for the product detail tabs (identification/
 * physical/circularity/chemical-safety/specialized-domain/evidence).
 * This is the supplier's own published data, so it's always
 * SUPPLIER_MAINTAINED / VERIFIED — see lib/provenance.ts. Reused across
 * every section rather than each one constructing the badge itself.
 */
export function SectionProvenance({
  supplierName,
}: {
  supplierName?: string;
}) {
  return (
    <div className="mb-3">
      <ProvenanceBadge
        provenance={buildSupplierMaintainedProvenance(
          supplierName ?? "Unknown supplier"
        )}
      />
    </div>
  );
}
