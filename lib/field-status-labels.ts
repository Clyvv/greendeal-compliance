import type { FieldStatus } from "@/lib/types";

/**
 * Human-readable labels for the FieldStatus enum (AGENTS.md §8,
 * DOMAIN.md §2) — used anywhere a status-type field is rendered as a
 * <Select>, so NOT_APPLICABLE and NOT_PROVIDED always show as clearly
 * distinct, equally-legitimate choices rather than one being hidden or
 * implied as a "default".
 */
export const FIELD_STATUS_OPTIONS: { value: FieldStatus; label: string }[] = [
  { value: "NOT_PROVIDED", label: "Not Provided" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
  { value: "PROVIDED", label: "Provided" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "VERIFIED", label: "Verified" },
  { value: "EXPIRED", label: "Expired" },
];

export const FIELD_STATUS_LABELS: Record<FieldStatus, string> = Object.fromEntries(
  FIELD_STATUS_OPTIONS.map(({ value, label }) => [value, label])
) as Record<FieldStatus, string>;
