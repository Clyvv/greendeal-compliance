import type { DataRequest } from "@/lib/types";

/**
 * Stage 7.5 — resolves a display name for whoever is on the
 * "requesting" side of a DataRequest. A GREENDEAL-origin request
 * always has a real requestingOrgId to resolve via getOrganization()
 * (unchanged); a PUBLIC_REQUEST_LINK request never does (DOMAIN.md
 * §8a) — it has a self-entered `requester` object instead. Every call
 * site that used to assume requestingOrgId always resolves to a real
 * Organization goes through this rather than rendering
 * getOrganization(undefined)'s result blindly.
 *
 * Intentionally a minimal, non-crashing fallback for Stage 7.5 — the
 * Supplier Request Inbox's fuller treatment of external requests (a
 * dedicated origin badge, existing-data coverage comparison, ...) is
 * Stage 7.6's job, not this function's.
 */
export function formatRequestingPartyName(
  request: Pick<DataRequest, "requestingOrgId" | "requester">,
  resolvedOrgName: string | undefined
): string {
  if (request.requestingOrgId) {
    return resolvedOrgName ?? "Unknown organization";
  }
  if (request.requester) {
    return `${request.requester.companyName} (External Request)`;
  }
  return "Unknown requester";
}
