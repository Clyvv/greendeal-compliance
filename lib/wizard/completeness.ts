import type { FieldStatus } from "@/lib/types";
import type { ProductWizardFormState } from "./types";

/**
 * Data Completeness % — judgment call, documented here since DOMAIN.md
 * doesn't specify a weighting, and the Stage 1b prompt flags this logic
 * as something Stage 6/7 (packaging/assessment completeness) will
 * likely reuse the same shape of.
 *
 * Counts 22 independently-scoreable fields across DOMAIN.md §2's
 * Sections 1–6 (Batch/Lot Number excluded — it's Production Batch data,
 * not product-level, per this stage's prompt):
 *
 *   Section 1 (Identification) — 2 fields: GTIN, Country of Origin.
 *     Product Name and Supplier SKU are required just to leave Step 1,
 *     so they're always "filled" and scoring them would be pointless.
 *   Section 2 (Physical & Structural) — 6 fields (all of them).
 *   Section 3 (Circularity & PPWR) — 5 fields (all of them).
 *   Section 4 (Chemical Safety) — 5 fields: heavyMetalPpm, pfasStatus,
 *     reachSvhcStatus, scipCode, rohsStatus. Matches DOMAIN.md §2's own
 *     5-row table for this section — the PFAS boolean flag rides along
 *     with pfasStatus rather than being scored as a separate field.
 *   Section 5 (Specialized Domain) — 3 fields (all of them).
 *   Section 6 (Evidence & Governance) — 1 field: "has at least one
 *     Evidence record been added?". Evidence is a repeatable list, not
 *     fixed product-level fields, so it's scored as a single checkbox
 *     rather than trying to score each evidence record's sub-fields.
 *
 *   Total: 2 + 6 + 5 + 5 + 3 + 1 = 22 units.
 *
 * A FieldStatus field counts as "filled" for any value other than
 * NOT_PROVIDED — NOT_APPLICABLE is a genuine, complete answer (AGENTS.md
 * §8), not a gap. A plain field counts as filled when non-empty; the
 * wizard's draft state keeps every field as a raw string specifically
 * so "empty" is unambiguous (see lib/wizard/types.ts).
 */
const TOTAL_COMPLETENESS_UNITS = 22;

/**
 * Minimum Data Completeness % required to Publish (vs. only being able
 * to Save Draft). Judgment call: chosen so that a product with
 * Identification + Physical + Circularity fully filled and at least one
 * Evidence record attached — but every Chemical Safety / Specialized
 * Domain field left at the default NOT_PROVIDED — sits just *under*
 * this bar. That's deliberate: it means at least a few Chemical
 * Safety / Specialized Domain fields need an actual decision (including
 * legitimately marking them NOT_APPLICABLE) before publishing, without
 * requiring every single optional field to be resolved.
 */
export const PUBLISH_COMPLETENESS_THRESHOLD = 70;

function isFilledText(value: string): boolean {
  return value.trim().length > 0;
}

function isFilledStatus(value: FieldStatus): boolean {
  return value !== "NOT_PROVIDED";
}

export function calculateCompletenessPercent(
  form: ProductWizardFormState
): number {
  const checks: boolean[] = [
    // Section 1
    isFilledText(form.gtin),
    isFilledText(form.countryOfOrigin),
    // Section 2
    isFilledText(form.materialFamily),
    isFilledText(form.specificMaterial),
    isFilledText(form.netWeightGrams),
    isFilledText(form.dimensions),
    isFilledText(form.thicknessMm),
    isFilledText(form.packagingFunction),
    // Section 3
    isFilledText(form.totalRecycledContentPercent),
    isFilledText(form.pcrYieldPercent),
    isFilledText(form.preConsumerYieldPercent),
    isFilledText(form.dfrGrade),
    isFilledText(form.reusabilityStatus),
    // Section 4
    isFilledText(form.heavyMetalPpm),
    isFilledStatus(form.pfasStatus),
    isFilledStatus(form.reachSvhcStatus),
    isFilledText(form.scipCode),
    isFilledStatus(form.rohsStatus),
    // Section 5
    isFilledStatus(form.fcmStatus),
    isFilledText(form.omlTestScore),
    isFilledText(form.sterilizationProfile),
    // Section 6
    form.evidenceDrafts.length > 0,
  ];

  if (checks.length !== TOTAL_COMPLETENESS_UNITS) {
    // Guards against the doc comment above silently drifting from the
    // actual check list if this function is ever edited.
    throw new Error(
      `Completeness check list changed size (${checks.length}) without updating TOTAL_COMPLETENESS_UNITS`
    );
  }

  const filledCount = checks.filter(Boolean).length;
  return Math.round((filledCount / checks.length) * 100);
}
