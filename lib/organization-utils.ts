// Stage 7.4 — deterministic slug generation for a Supplier's Public
// Request Link (DOMAIN.md §8a: "no dedicated persisted entity needed
// beyond a slug on the Supplier/Product"). Strips common legal-entity
// suffixes so "PET Solutions GmbH" -> "pet-solutions" rather than
// "pet-solutions-gmbh" — a real backend would very likely want the
// same normalization (nobody wants "gmbh" cluttering a link they paste
// into an email), so this lives here rather than being inlined once
// into the seed data.
const LEGAL_SUFFIX_WORDS = new Set([
  "gmbh",
  "ltd",
  "inc",
  "llc",
  "corp",
  "co",
  "ag",
  "plc",
  "sa",
  "srl",
  "bv",
  "kg",
  "ohg",
]);

export function generateSupplierSlug(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter((word) => word.length > 0 && !LEGAL_SUFFIX_WORDS.has(word));
  const slug = words.join("-");
  return slug || "supplier";
}
