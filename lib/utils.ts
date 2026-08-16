/**
 * Joins conditional class names together, filtering out falsy values.
 * Kept dependency-free (no clsx/tailwind-merge) for this prototype.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** Formats an ISO date string for display (e.g. "10 Aug 2026"). */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Formats an ISO date-time string for display (e.g. "15 Aug 2026, 14:32") —
 * for records that store a full timestamp, not just a date (e.g.
 * ComplianceAssessment.createdAt). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
