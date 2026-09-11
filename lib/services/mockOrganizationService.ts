import type { Organization } from "@/lib/types";
import { organizations } from "@/lib/mock-data";

// Maps to: GET /api/v1/organizations
export async function getOrganizations(): Promise<Organization[]> {
  return organizations;
}

// Maps to: GET /api/v1/organizations/{orgId}
// Accepts `undefined` (Stage 7.5) so callers resolving a DataRequest's
// now-optional requestingOrgId (unset for PUBLIC_REQUEST_LINK
// submissions — see lib/types/data-request.ts) don't need a ternary at
// every call site — always returns undefined rather than throwing,
// same pattern mockProductService's getters already use for optional
// PackagingComponent foreign keys (Stage 7.3).
export async function getOrganization(
  orgId: string | undefined
): Promise<Organization | undefined> {
  if (!orgId) return undefined;
  return organizations.find((org) => org.id === orgId);
}
