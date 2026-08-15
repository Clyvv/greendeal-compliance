import type { Evidence } from "@/lib/types";
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
