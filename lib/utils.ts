/**
 * Joins conditional class names together, filtering out falsy values.
 * Kept dependency-free (no clsx/tailwind-merge) for this prototype.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
