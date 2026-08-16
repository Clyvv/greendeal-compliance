// DOMAIN.md §3 — Data Approval (Supplier's response to a Data Request).
// Always scoped to a subset of the originating DataRequest's
// requestedAttributes — approval is field-level, never all-or-nothing
// (AGENTS.md §7).
export type DataApproval = {
  id: string;
  dataRequestId: string;
  approvedAttributes: string[]; // subset of requestedAttributes
  decidedAt: string;
  decidedBy?: string;
};
