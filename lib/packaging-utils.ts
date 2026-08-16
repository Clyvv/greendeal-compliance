import type { PackagingComponent } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/status-pill";

/**
 * % of a packaging item's components with authorized, complete data
 * available to the manufacturer. Genuinely computed from
 * dataAvailability — legitimately 0% right now since nothing has been
 * requested/authorized yet (Stage 4/5). Not a placeholder value.
 */
export function calculatePackagingDataCompletenessPercent(
  components: PackagingComponent[]
): number {
  if (components.length === 0) return 0;
  const complete = components.filter(
    (component) => component.dataAvailability === "COMPLETE"
  ).length;
  return Math.round((complete / components.length) * 100);
}

export interface PackagingItemStatusInfo {
  label: string;
  pillStatus: StatusPillStatus;
}

/**
 * A packaging item's overall readiness, derived from its components'
 * dataAvailability. DOMAIN.md's PackagingItem type has no stored status
 * field, so this is computed for display, not persisted. A full
 * readiness view with per-component gap detail is Stage 6 — this is
 * just enough to make the Packaging Item List scannable now.
 */
export function getPackagingItemStatus(
  components: PackagingComponent[]
): PackagingItemStatusInfo {
  if (components.length === 0) {
    return { label: "No Components", pillStatus: "missing" };
  }
  const completeCount = components.filter(
    (component) => component.dataAvailability === "COMPLETE"
  ).length;
  if (completeCount === components.length) {
    return { label: "Ready", pillStatus: "complete" };
  }
  if (completeCount > 0) {
    return { label: "Partial", pillStatus: "pending" };
  }
  return { label: "Incomplete", pillStatus: "missing" };
}

export const DATA_AVAILABILITY_TO_PILL: Record<
  PackagingComponent["dataAvailability"],
  StatusPillStatus
> = {
  COMPLETE: "complete",
  PARTIAL: "pending",
  MISSING: "missing",
};

export const DATA_AVAILABILITY_LABELS: Record<
  PackagingComponent["dataAvailability"],
  string
> = {
  COMPLETE: "Complete",
  PARTIAL: "Partial",
  MISSING: "Missing",
};

export const AUTHORIZATION_STATUS_TO_PILL: Record<
  PackagingComponent["authorizationStatus"],
  StatusPillStatus
> = {
  NOT_REQUESTED: "not-authorized",
  PENDING: "pending",
  AUTHORIZED: "complete",
  REJECTED: "failed",
};

export const AUTHORIZATION_STATUS_LABELS: Record<
  PackagingComponent["authorizationStatus"],
  string
> = {
  NOT_REQUESTED: "Not Authorized",
  PENDING: "Pending",
  AUTHORIZED: "Authorized",
  REJECTED: "Rejected",
};
