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
 */
export function getRequestingPartyName(
  request: Pick<DataRequest, "requestingOrgId" | "requester">,
  resolvedOrgName: string | undefined
): string {
  if (request.requestingOrgId) {
    return resolvedOrgName ?? "Unknown organization";
  }
  if (request.requester) {
    return request.requester.companyName;
  }
  return "Unknown requester";
}

/**
 * Stage 7.5 — same resolution as getRequestingPartyName, with an
 * "(External Request)" suffix appended for external requests. Used
 * where there's no other origin context on screen (e.g. the Supplier
 * Data Requests list/table, Stage 7.6) to flag it inline. On the
 * request detail view (Stage 7.7's DataRequestApprovalFlow), the
 * origin badge + Requester Details card already establish that
 * context, so that screen uses the plain getRequestingPartyName
 * instead — repeating the suffix in every sentence there would be
 * redundant, and doesn't match the original spec's plain
 * "[Requester Company Name]" phrasing.
 */
export function formatRequestingPartyName(
  request: Pick<DataRequest, "requestingOrgId" | "requester">,
  resolvedOrgName: string | undefined
): string {
  const name = getRequestingPartyName(request, resolvedOrgName);
  const isExternal = !request.requestingOrgId && Boolean(request.requester);
  return isExternal ? `${name} (External Request)` : name;
}
