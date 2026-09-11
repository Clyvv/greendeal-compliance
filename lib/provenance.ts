import type { DataProvenance, DataSourceType, VerificationStatus } from "@/lib/types";

/**
 * Builders for DataProvenance (DOMAIN.md §8a). Kept out of components
 * per AGENTS.md §5 — screens just call these with the org/version info
 * they already have, they never construct the shape by hand.
 *
 * This stage only ever produces these two variants — everything shown
 * today is either the supplier's own published product data
 * (SUPPLIER_MAINTAINED) or data a manufacturer has real, request-
 * approved access to (SUPPLIER_APPROVED). Later stages add builders for
 * MANUFACTURER_PROVIDED / IMPORTED / EXTERNAL_REQUEST_RESPONSE data as
 * those scenarios are built.
 */

export interface ProvenanceOptions {
  productVersionId?: string;
  evidenceIds?: string[];
  validUntil?: string;
}

/**
 * The product/version itself, as maintained and published by the
 * supplier — true regardless of any manufacturer's authorization state,
 * since the reference chain (component → product → version → supplier)
 * is always visible per AGENTS.md §6, independent of field-level access.
 */
export function buildSupplierMaintainedProvenance(
  sourceName: string,
  options: ProvenanceOptions = {}
): DataProvenance {
  return {
    sourceType: "SUPPLIER_MAINTAINED",
    sourceName,
    verificationStatus: "VERIFIED",
    ...options,
  };
}

/**
 * Specific field values that reached a manufacturer because a Data
 * Request for them was approved (AGENTS.md §7) — use only where data
 * has actually been granted via that flow, not for the always-visible
 * reference chain (see buildSupplierMaintainedProvenance for that).
 */
export function buildSupplierApprovedProvenance(
  sourceName: string,
  options: ProvenanceOptions = {}
): DataProvenance {
  return {
    sourceType: "SUPPLIER_APPROVED",
    sourceName,
    verificationStatus: "SUPPLIER_APPROVED",
    ...options,
  };
}

// DOMAIN.md's own example for sourceName is literally "Manufacturer
// Provided" (§8a) — not the (unverified, manufacturer-typed) supplier
// company name — because sourceName describes who is actually vouching
// for the data's accuracy. For an ExternalSupplierProduct, that's the
// manufacturer, not the claimed supplier (nothing verifies that company
// name is even real yet). The claimed company name is still shown
// elsewhere on the card (see ExternalPackagingComponentCard) — this
// badge is purely the standardized source/verification indicator.
const EXTERNAL_SOURCE_NAMES: Record<"MANUFACTURER_PROVIDED" | "IMPORTED", string> = {
  MANUFACTURER_PROVIDED: "Manufacturer Provided",
  IMPORTED: "Imported Data",
};

/**
 * Stage 7.3 — data behind an ExternalSupplierProduct (AGENTS.md §10a
 * scenarios 2/4). Always reads sourceType/verificationStatus straight
 * off the entity rather than hardcoding them, so if a later stage ever
 * upgrades verificationStatus (e.g. a real supplier "claiming" the
 * record), this badge reflects that automatically without a code
 * change here.
 */
export function buildExternalSupplierProvenance(
  externalProduct: {
    sourceType: DataSourceType;
    verificationStatus: VerificationStatus;
  },
  options: ProvenanceOptions = {}
): DataProvenance {
  const sourceName =
    externalProduct.sourceType === "MANUFACTURER_PROVIDED" ||
    externalProduct.sourceType === "IMPORTED"
      ? EXTERNAL_SOURCE_NAMES[externalProduct.sourceType]
      : "Manufacturer Provided"; // fallback; only these two sourceTypes are produced by this stage
  return {
    sourceType: externalProduct.sourceType,
    sourceName,
    verificationStatus: externalProduct.verificationStatus,
    ...options,
  };
}
