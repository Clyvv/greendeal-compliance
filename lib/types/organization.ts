export type OrganizationType = "MANUFACTURER" | "SUPPLIER";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  country?: string;
};
