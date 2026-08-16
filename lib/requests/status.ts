import type { DataRequestStatus } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/status-pill";

// Maps DataRequestStatus (AGENTS.md §8) onto the sanctioned
// status-icon set (AGENTS.md §4). DRAFT isn't produced by any current
// flow — Stage 4 always submits straight to PENDING — but is mapped
// here for type completeness/future use.
export const DATA_REQUEST_STATUS_TO_PILL: Record<
  DataRequestStatus,
  StatusPillStatus
> = {
  DRAFT: "not-authorized",
  PENDING: "pending",
  APPROVED: "complete",
  REJECTED: "failed",
  EXPIRED: "expired",
};

export const DATA_REQUEST_STATUS_LABELS: Record<DataRequestStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};
