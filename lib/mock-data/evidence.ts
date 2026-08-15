import type { Evidence } from "@/lib/types";

// Evidence documents for the sample supplier products — see
// DOMAIN.md §5. Dates are chosen relative to the prototype's fixed
// "today" (2026-08-15, see /lib/constants.ts) to exercise the
// dashboard's "expiring soon" and already-"EXPIRED" states.
export const evidence: Evidence[] = [
  // PET Bottle 500ml (PET Solutions GmbH)
  {
    id: "ev-pet-bottle-recycled-cert",
    productVersionId: "pv-pet-bottle-500-v1",
    documentName: "Recycled Content Certificate.pdf",
    evidenceType: "Recycled Content",
    issuingAuthority: "TÜV Rheinland",
    issueDate: "2025-09-01",
    expirationDate: "2026-09-01", // expires within 60 days of MOCK_TODAY
    status: "VALID",
    supportedAttributes: [
      "Total Recycled Content",
      "PCR Content",
      "Pre-Consumer Recycled Content",
    ],
  },
  {
    id: "ev-pet-bottle-material-cert",
    productVersionId: "pv-pet-bottle-500-v1",
    documentName: "Material Certificate.pdf",
    evidenceType: "Material Composition",
    issuingAuthority: "SGS",
    issueDate: "2025-01-15",
    expirationDate: "2027-01-15",
    status: "VALID",
    supportedAttributes: ["Material Family", "Specific Material Composition"],
  },
  {
    id: "ev-pet-bottle-tds",
    productVersionId: "pv-pet-bottle-500-v1",
    documentName: "Technical Data Sheet.pdf",
    evidenceType: "Technical Specification",
    issuingAuthority: "PET Solutions GmbH",
    issueDate: "2025-01-10",
    expirationDate: "2028-01-10",
    status: "VALID",
    supportedAttributes: ["Dimensions", "Thickness", "Component Net Weight"],
  },

  // Coca-Cola Label 500ml (LabelTech GmbH)
  {
    id: "ev-label-material-cert",
    productVersionId: "pv-coca-cola-label-500-v1",
    documentName: "Material Certificate.pdf",
    evidenceType: "Material Composition",
    issuingAuthority: "SGS",
    issueDate: "2024-06-01",
    expirationDate: "2026-06-01", // already expired as of MOCK_TODAY
    status: "EXPIRED",
    supportedAttributes: ["Material Family"],
  },
  {
    id: "ev-label-tds",
    productVersionId: "pv-coca-cola-label-500-v1",
    documentName: "Technical Data Sheet.pdf",
    evidenceType: "Technical Specification",
    issuingAuthority: "LabelTech GmbH",
    issueDate: "2025-06-01",
    expirationDate: "2027-06-01",
    status: "VALID",
    supportedAttributes: ["Component Net Weight"],
  },

  // PP Cap 28mm (PolyCap GmbH)
  {
    id: "ev-cap-material-cert",
    productVersionId: "pv-pp-cap-28-v1",
    documentName: "Material Certificate.pdf",
    evidenceType: "Material Composition",
    issuingAuthority: "SGS",
    issueDate: "2025-03-01",
    expirationDate: "2027-03-01",
    status: "PENDING_VERIFICATION",
    supportedAttributes: ["Material Family", "Specific Material Composition"],
  },
  {
    id: "ev-cap-recycled-cert",
    productVersionId: "pv-pp-cap-28-v1",
    documentName: "Recycled Content Certificate.pdf",
    evidenceType: "Recycled Content",
    issuingAuthority: "TÜV Rheinland",
    issueDate: "2025-08-20",
    expirationDate: "2026-08-20", // expires within 60 days of MOCK_TODAY
    status: "VALID",
    supportedAttributes: ["Total Recycled Content", "PCR Content"],
  },
];
