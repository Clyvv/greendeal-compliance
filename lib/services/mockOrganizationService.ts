import type { Organization } from "@/lib/types";
import { organizations } from "@/lib/mock-data";

// Maps to: GET /api/v1/organizations
export async function getOrganizations(): Promise<Organization[]> {
  return organizations;
}

// Maps to: GET /api/v1/organizations/{orgId}
export async function getOrganization(
  orgId: string
): Promise<Organization | undefined> {
  return organizations.find((org) => org.id === orgId);
}
