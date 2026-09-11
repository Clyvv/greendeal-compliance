export type OrganizationType = "MANUFACTURER" | "SUPPLIER";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  country?: string;
  // Stage 7.4 — only meaningful for SUPPLIER orgs (DOMAIN.md §8a's
  // "Public Request Link" concept: no dedicated persisted entity, just
  // a slug on the Supplier). Kept on the shared Organization type
  // rather than a supplier-only subtype, consistent with `country`
  // above already being optional/type-agnostic here. See
  // lib/organization-utils.ts for how it's generated.
  slug?: string;
};
