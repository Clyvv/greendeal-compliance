// DOMAIN.md §2, Section 6 — Evidence is a first-class object, not a
// file attachment field.
export type EvidenceStatus = "VALID" | "EXPIRED" | "PENDING_VERIFICATION";

export type Evidence = {
  id: string;
  productVersionId: string;
  documentName: string;
  evidenceType: string; // e.g. "Recycled Content"
  issuingAuthority: string;
  issueDate: string; // ISO date
  expirationDate: string; // ISO date
  status: EvidenceStatus;
  supportedAttributes: string[]; // e.g. ["Total Recycled Content", "PCR Content"]
};
