import type { Evidence, EvidenceStatus } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/status-pill";
import { MOCK_TODAY } from "@/lib/constants";

const EXPIRING_SOON_WINDOW_DAYS = 60;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * True when evidence is still valid but its expiration date falls
 * within the next N days of the reference date (default: the
 * prototype's fixed "today"). Already-expired or pending-verification
 * evidence is excluded — those are distinct states, not "expiring soon".
 */
export function isExpiringSoon(
  evidenceItem: Evidence,
  referenceDate: Date = MOCK_TODAY
): boolean {
  if (evidenceItem.status !== "VALID") return false;
  const expiration = new Date(evidenceItem.expirationDate);
  const diffDays = (expiration.getTime() - referenceDate.getTime()) / MS_PER_DAY;
  return diffDays >= 0 && diffDays <= EXPIRING_SOON_WINDOW_DAYS;
}

/**
 * The Evidence's *effective* status — computed by comparing
 * expirationDate against the reference date, rather than trusting the
 * stored `status` field blindly (Stage 2 prompt). If the expiration
 * date has passed, the evidence is EXPIRED regardless of what's
 * stored (a stale "VALID" doesn't make an expired document valid).
 * Otherwise the stored workflow status (VALID / PENDING_VERIFICATION)
 * is trusted, except a stored EXPIRED with a still-future expiration
 * date (a data inconsistency) falls back to VALID.
 */
export function getEffectiveEvidenceStatus(
  evidenceItem: Evidence,
  referenceDate: Date = MOCK_TODAY
): EvidenceStatus {
  const expiration = new Date(evidenceItem.expirationDate);
  const isPastExpiration = expiration.getTime() < referenceDate.getTime();
  if (isPastExpiration) return "EXPIRED";
  return evidenceItem.status === "EXPIRED" ? "VALID" : evidenceItem.status;
}

/** Maps EvidenceStatus onto the sanctioned status-icon set (AGENTS.md §4). */
export const EVIDENCE_STATUS_TO_PILL: Record<EvidenceStatus, StatusPillStatus> = {
  VALID: "complete",
  EXPIRED: "expired",
  PENDING_VERIFICATION: "pending",
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  VALID: "Valid",
  EXPIRED: "Expired",
  PENDING_VERIFICATION: "Pending Verification",
};
