// Field-level status enum — see AGENTS.md §8 and DOMAIN.md §2. Never
// collapse this into a boolean; NOT_APPLICABLE and NOT_PROVIDED are
// meaningfully different states.
export type FieldStatus =
  | "NOT_APPLICABLE"
  | "NOT_PROVIDED"
  | "PROVIDED"
  | "EXPIRED"
  | "PENDING_VERIFICATION"
  | "VERIFIED";
