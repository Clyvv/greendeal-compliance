import { StatusPill, type StatusPillStatus } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { DataProvenance, DataSourceType, VerificationStatus } from "@/lib/types";

// Display labels for DataSourceType (DOMAIN.md §8a) — not a status, so
// rendered as plain muted text rather than a StatusPill (AGENTS.md §4
// reserves StatusPill's fixed icon set for status values).
const SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  SUPPLIER_MAINTAINED: "Supplier-Maintained",
  SUPPLIER_APPROVED: "Supplier-Approved",
  MANUFACTURER_PROVIDED: "Manufacturer-Provided",
  IMPORTED: "Imported",
  EXTERNAL_REQUEST_RESPONSE: "External Request Response",
};

// VerificationStatus maps onto the existing AGENTS.md §4 icon set —
// no new icons are invented here. VERIFIED and SUPPLIER_APPROVED both
// mean "this value can be trusted as-is" (✓ Complete/Approved).
// UNVERIFIED (⏳, verification still outstanding) and EXPIRED (⌛) are
// not produced by this stage's data but are mapped now so later
// stages (external/manufacturer-provided data) don't need to revisit
// this component.
const VERIFICATION_STATUS_TO_PILL: Record<VerificationStatus, StatusPillStatus> = {
  VERIFIED: "complete",
  SUPPLIER_APPROVED: "complete",
  UNVERIFIED: "pending",
  EXPIRED: "expired",
};

const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  VERIFIED: "Verified",
  SUPPLIER_APPROVED: "Supplier Approved",
  UNVERIFIED: "Unverified",
  EXPIRED: "Expired",
};

/**
 * Reusable provenance indicator (DOMAIN.md §8a) — source name/type as
 * plain text, verification status as the existing StatusPill icon set.
 * Deliberately reuses AGENTS.md §4's fixed visual language rather than
 * inventing a new one for provenance.
 */
export function ProvenanceBadge({
  provenance,
  className,
}: {
  provenance: DataProvenance;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-500",
        className
      )}
    >
      <span>
        Source: {provenance.sourceName} ·{" "}
        {SOURCE_TYPE_LABELS[provenance.sourceType]}
      </span>
      <StatusPill
        status={VERIFICATION_STATUS_TO_PILL[provenance.verificationStatus]}
        label={VERIFICATION_STATUS_LABELS[provenance.verificationStatus]}
      />
    </span>
  );
}
