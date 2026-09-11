import type { DataRequestStatus, ExternalSupplierProduct } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/status-pill";
import { REQUESTABLE_FIELD_SECTIONS } from "@/lib/requests/fields";

// Stage 6 — Packaging Data Completeness.
//
// The minimum field set a PPWR assessment actually needs, per this
// stage's prompt: DOMAIN.md §2 Section 3 (Circularity & PPWR Metrics)
// and Section 4 (Chemical Safety & Substance Restrictions) — the
// recycled-content/DfR figures the PPWR calculation itself runs on
// (see DOMAIN.md §7's worked example), plus the substance-restriction
// declarations (PFAS/REACH/SCIP/RoHS) a PPWR assessment must clear.
// This is deliberately the *minimum* the prompt asks for — Physical
// fields (e.g. Net Weight, also used by DOMAIN.md §7's calculation)
// and Identification/Specialized-Domain fields aren't gated on here;
// a later stage can extend this list if the calculation engine needs
// more, but Stage 6's readiness gate is scoped to exactly these two
// sections. Uses the same short field-key labels Stage 4/5 already
// request/approve fields by (see lib/requests/fields.ts), so a
// required field here is directly comparable to a DataRequest's
// requestedAttributes / a DataApproval's approvedAttributes.
export const REQUIRED_PPWR_FIELDS: string[] = REQUESTABLE_FIELD_SECTIONS.filter(
  (section) => section.key === "CIRCULARITY" || section.key === "CHEMICAL"
).flatMap((section) => section.fields);

/**
 * Besides the named fields above, a PPWR assessment also needs at
 * least one supporting evidence document authorized — Evidence &
 * Provenance is one of AGENTS.md §4's core experience pillars, not an
 * optional extra. Evidence document names are per-product and never
 * enumerable statically (see lib/requests/fields.ts's comment on why),
 * so this is tracked as a single synthetic requirement — "is at least
 * one evidence document for this component's product authorized?" —
 * rather than a named field.
 */
export const EVIDENCE_REQUIREMENT_LABEL = "Evidence";

export type ReadinessFieldState =
  | "AUTHORIZED"
  | "PENDING"
  | "DENIED"
  | "NOT_REQUESTED";

export interface RequiredFieldReadiness {
  field: string;
  state: ReadinessFieldState;
}

export interface ComponentReadiness {
  requiredFields: RequiredFieldReadiness[]; // one entry per REQUIRED_PPWR_FIELDS
  evidence: { state: ReadinessFieldState };
  requiredCount: number; // REQUIRED_PPWR_FIELDS.length + 1 (the evidence requirement)
  satisfiedCount: number;
  // Stage 7.8 — UNVERIFIED added for components backed by an
  // ExternalSupplierProduct (Stage 7.3) rather than a real
  // SupplierProduct. COMPLETE/PARTIAL/NOT_READY all describe a point
  // along the native request→authorization pipeline (AGENTS.md §7) —
  // that pipeline doesn't exist for an external component at all
  // (there's no supplier org to request anything from), so forcing one
  // of those three onto it would misrepresent manufacturer-provided
  // data as either fully-authorized supplier data (COMPLETE) or merely
  // "not yet requested" (NOT_READY, which implies a request could fix
  // it). UNVERIFIED is its own honest state instead — see
  // computeExternalComponentReadiness below.
  //
  // Stage 7.10 — SUPPLIER_RESPONSE added for an external component
  // whose supplier has completed the Supplier Response Link
  // (ExternalSupplierProduct.responseStatus === 'COMPLETED') AND every
  // REQUIRED_PPWR_FIELDS value + evidence is now actually present.
  // Deliberately its own state, not reused as COMPLETE — a completed
  // supplier response is real, judgment-backed data (see
  // getExternalSupplierProvidedFields below), meaningfully better than
  // UNVERIFIED, but it never went through the native request/
  // authorization pipeline and isn't a registered Greendeal Supplier
  // Product, so treating it identically to COMPLETE would overstate its
  // trust level (AGENTS.md's "Supplier Response Link" section is
  // explicit that it must not be conflated with a fully onboarded
  // SupplierProduct).
  //
  // Stage 7.11 — UNVERIFIED_COMPLETE added for a `hasSupplier: false`
  // component (no supplier entity at all — "Use Existing Manufacturer-
  // Provided Data") once every REQUIRED_PPWR_FIELDS value + evidence is
  // present. NOT the same as SUPPLIER_RESPONSE: nobody ever confirmed
  // this data, and nobody ever will (there's no supplier to). It's also
  // NOT plain UNVERIFIED: that would erase the real, useful distinction
  // between "the manufacturer entered nothing" and "the manufacturer
  // entered everything, it's just never going to be verified" — the
  // whole point of this state is to keep completeness honestly visible
  // while verification stays permanently absent.
  overallStatus:
    | "COMPLETE"
    | "PARTIAL"
    | "NOT_READY"
    | "UNVERIFIED"
    | "SUPPLIER_RESPONSE"
    | "UNVERIFIED_COMPLETE";
}

/**
 * Computes one component's readiness against REQUIRED_PPWR_FIELDS,
 * from its actual current authorization state — never hardcoded.
 * `requestStatus`/`requestedAttributes` come from the single DataRequest
 * raised against this component, if any (Stage 4); `authorizedAttributes`
 * comes from `mockRequestService.getAuthorizedData` (Stage 5), the same
 * source of truth the manufacturer's real data access is gated by.
 *
 * A field/evidence item is:
 * - AUTHORIZED    — present in authorizedAttributes
 * - DENIED         — requested, and the request is resolved (APPROVED
 *                    without this field, i.e. a partial approval that
 *                    left it out — or REJECTED outright), but never
 *                    authorized
 * - PENDING        — requested, and the request is still PENDING
 * - NOT_REQUESTED  — never part of any requestedAttributes at all
 */
export function computeComponentReadiness(params: {
  requestedAttributes: string[];
  requestStatus: DataRequestStatus | undefined;
  authorizedAttributes: string[];
  evidenceDocumentNames: string[];
}): ComponentReadiness {
  const { requestedAttributes, requestStatus, authorizedAttributes, evidenceDocumentNames } =
    params;

  function fieldState(field: string): ReadinessFieldState {
    if (authorizedAttributes.includes(field)) return "AUTHORIZED";
    if (requestStatus && requestedAttributes.includes(field)) {
      return requestStatus === "PENDING" ? "PENDING" : "DENIED";
    }
    return "NOT_REQUESTED";
  }

  const requiredFields: RequiredFieldReadiness[] = REQUIRED_PPWR_FIELDS.map((field) => ({
    field,
    state: fieldState(field),
  }));

  let evidenceState: ReadinessFieldState;
  if (evidenceDocumentNames.some((name) => authorizedAttributes.includes(name))) {
    evidenceState = "AUTHORIZED";
  } else if (
    requestStatus &&
    evidenceDocumentNames.some((name) => requestedAttributes.includes(name))
  ) {
    evidenceState = requestStatus === "PENDING" ? "PENDING" : "DENIED";
  } else {
    // Also covers the (not currently occurring) case of a product with
    // zero evidence documents on file at all — conservatively treated
    // as still missing rather than vacuously satisfied.
    evidenceState = "NOT_REQUESTED";
  }

  const satisfiedCount =
    requiredFields.filter((entry) => entry.state === "AUTHORIZED").length +
    (evidenceState === "AUTHORIZED" ? 1 : 0);
  const requiredCount = requiredFields.length + 1;

  const overallStatus: ComponentReadiness["overallStatus"] =
    satisfiedCount === requiredCount
      ? "COMPLETE"
      : satisfiedCount > 0
        ? "PARTIAL"
        : "NOT_READY";

  return {
    requiredFields,
    evidence: { state: evidenceState },
    requiredCount,
    satisfiedCount,
    overallStatus,
  };
}

// Stage 7.10 — maps each REQUEST_PPWR_FIELDS-and-beyond label to the
// ExternalSupplierProduct property that a completed Supplier Response
// (lib/services/mockExternalSupplierService.submitSupplierResponse)
// populates it from, and whether that property currently holds a real
// value. Exported so mockAssessmentService can reuse the exact same
// notion of "provided" for authorizedAttributes — one definition of
// "known" for a completed response, not two that could drift apart.
const EXTERNAL_FIELD_PROVIDED_CHECKS: Record<
  string,
  (product: ExternalSupplierProduct) => boolean
> = {
  "Material Composition": (p) => Boolean(p.knownMaterialComposition?.trim()),
  "Net Weight": (p) => p.knownWeightGrams !== undefined,
  Dimensions: (p) => Boolean(p.knownDimensions?.trim()),
  Thickness: (p) => p.knownThicknessMm !== undefined,
  "Total Recycled Content": (p) => p.totalRecycledContentPercent !== undefined,
  PCR: (p) => p.pcrYieldPercent !== undefined,
  "Pre-Consumer Recycled Content": (p) => p.preConsumerYieldPercent !== undefined,
  "DfR Grade": (p) => Boolean(p.dfrGrade?.trim()),
  "Heavy Metals": (p) => p.heavyMetalPpm !== undefined,
  PFAS: (p) => Boolean(p.pfasStatus && p.pfasStatus !== "NOT_PROVIDED"),
  REACH: (p) => Boolean(p.reachSvhcStatus && p.reachSvhcStatus !== "NOT_PROVIDED"),
  SCIP: (p) => Boolean(p.scipCode?.trim()),
  RoHS: (p) => Boolean(p.rohsStatus && p.rohsStatus !== "NOT_PROVIDED"),
};

/**
 * Stage 7.11 — whether an ExternalSupplierProduct's compliance fields
 * are ever legitimately readable at all, regardless of whether any
 * individual field actually holds a value yet:
 * - hasSupplier: false ("Use Existing Manufacturer-Provided Data") —
 *   there's no separate response step; whatever the manufacturer
 *   entered at creation IS the permanent, sole record, immediately.
 * - hasSupplier: true ("Add External Supplier Product") — the
 *   manufacturer's own guesses at creation are NOT usable; only once
 *   the actual supplier completes a response (`responseStatus ===
 *   'COMPLETED'`) does this data become real (Stage 7.10).
 * Exported so mockAssessmentService can reuse the exact same gate for
 * evidence, not just named fields.
 */
export function isExternalSupplierDataUsable(
  product: ExternalSupplierProduct | undefined
): boolean {
  if (!product) return false;
  return product.hasSupplier === false || product.responseStatus === "COMPLETED";
}

/**
 * Every field label (across all sections, not just REQUIRED_PPWR_FIELDS)
 * that this ExternalSupplierProduct has actually provided a real value
 * for — gated by isExternalSupplierDataUsable above, so a hasSupplier:
 * true record's manufacturer-guessed fields never count before the
 * actual supplier confirms them, while a hasSupplier:false record's
 * fields count immediately (there's nothing else to wait for).
 */
export function getExternalSupplierProvidedFields(
  product: ExternalSupplierProduct | undefined
): string[] {
  if (!product || !isExternalSupplierDataUsable(product)) return [];
  return Object.entries(EXTERNAL_FIELD_PROVIDED_CHECKS)
    .filter(([, isProvided]) => isProvided(product))
    .map(([field]) => field);
}

/**
 * Stage 7.8 — readiness for a component backed by an
 * ExternalSupplierProduct (Stage 7.3) instead of a real SupplierProduct.
 * There's no DataRequest/DataApproval pipeline possible against it at
 * all (no supplier org to request from), so a required field is never
 * AUTHORIZED via that pipeline. Two real ways a field can still become
 * genuinely known instead (see isExternalSupplierDataUsable above):
 * the actual supplier completing the Supplier Response Link
 * (`hasSupplier: true`, `responseStatus === 'COMPLETED'`; Stage 7.10),
 * or the manufacturer entering it directly with no supplier involved at
 * all (`hasSupplier: false`; Stage 7.11). Absent either, every required
 * field and the evidence requirement stays NOT_REQUESTED (accurate:
 * never part of any request, because no request is possible) and
 * satisfiedCount is 0. This still contributes its real requiredCount to
 * summarizeReadiness below either way, so a packaging item's overall %
 * honestly reflects this component's actual state.
 */
export function computeExternalComponentReadiness(
  externalProduct?: ExternalSupplierProduct
): ComponentReadiness {
  const providedFields = getExternalSupplierProvidedFields(externalProduct);
  const hasEvidence =
    isExternalSupplierDataUsable(externalProduct) &&
    (externalProduct?.evidenceDocumentNames?.length ?? 0) > 0;

  const requiredFields: RequiredFieldReadiness[] = REQUIRED_PPWR_FIELDS.map((field) => ({
    field,
    // Reusing "AUTHORIZED" here is deliberate, not a stretch: once this
    // data is usable (see isExternalSupplierDataUsable), the value is
    // either supplier-confirmed (hasSupplier: true, COMPLETED) or the
    // manufacturer's own sole-source record (hasSupplier: false) — both
    // are genuinely known values, a different and more meaningful state
    // than "not requested". The distinction between those two — and
    // from a natively-authorized field — lives in overallStatus below,
    // not in per-field state naming.
    state: providedFields.includes(field) ? "AUTHORIZED" : "NOT_REQUESTED",
  }));

  const satisfiedCount =
    requiredFields.filter((entry) => entry.state === "AUTHORIZED").length +
    (hasEvidence ? 1 : 0);
  const requiredCount = requiredFields.length + 1;

  let overallStatus: ComponentReadiness["overallStatus"];
  if (satisfiedCount === 0) {
    overallStatus = "UNVERIFIED";
  } else if (satisfiedCount === requiredCount) {
    // Stage 7.11 — a hasSupplier:false component can only ever land on
    // UNVERIFIED or UNVERIFIED_COMPLETE (never SUPPLIER_RESPONSE — no
    // supplier ever confirmed anything here) or PARTIAL in between,
    // same three-tier shape as a hasSupplier:true component, just with
    // a different (permanently unverified) terminal label.
    overallStatus =
      externalProduct?.hasSupplier === false ? "UNVERIFIED_COMPLETE" : "SUPPLIER_RESPONSE";
  } else {
    overallStatus = "PARTIAL";
  }

  return {
    requiredFields,
    evidence: { state: hasEvidence ? "AUTHORIZED" : "NOT_REQUESTED" },
    requiredCount,
    satisfiedCount,
    overallStatus,
  };
}

export const COMPONENT_READINESS_TO_PILL: Record<
  ComponentReadiness["overallStatus"],
  StatusPillStatus
> = {
  COMPLETE: "complete",
  PARTIAL: "missing",
  NOT_READY: "not-authorized",
  // Same icon PARTIAL uses (⚠) — AGENTS.md §4 forbids inventing new
  // icons, and ⚠ is the closest sanctioned meaning for "some data
  // present, but not verified/authoritative". Distinguished from
  // PARTIAL by label text ("Unverified" vs "Partial"), same precedent
  // lib/assessment-findings.ts already uses for WARNING vs MISSING.
  UNVERIFIED: "missing",
  // Genuinely good news (every required field came from the actual
  // supplier via a completed response) — reuses the "complete" (✓)
  // icon, same precedent components/provenance/provenance-badge.tsx
  // already sets for VERIFIED vs SUPPLIER_APPROVED sharing one icon.
  // The label text ("Supplier-Provided" vs "Complete") is what keeps
  // this from reading as equivalent to native COMPLETE.
  SUPPLIER_RESPONSE: "complete",
  // Stage 7.11 — deliberately the SAME icon family as PARTIAL/UNVERIFIED
  // (⚠), not SUPPLIER_RESPONSE's ✓ — this data was never confirmed by
  // anyone but the manufacturer itself, and never will be, no matter how
  // complete it is. The label text ("Complete — Unverified") is what
  // carries the completeness signal instead.
  UNVERIFIED_COMPLETE: "missing",
};

export const COMPONENT_READINESS_LABELS: Record<
  ComponentReadiness["overallStatus"],
  string
> = {
  COMPLETE: "Complete",
  PARTIAL: "Partial",
  NOT_READY: "Not Requested",
  UNVERIFIED: "Unverified",
  SUPPLIER_RESPONSE: "Supplier-Provided",
  UNVERIFIED_COMPLETE: "Complete — Unverified",
};

export interface MissingGroup {
  state: "NOT_REQUESTED" | "PENDING" | "DENIED";
  icon: string;
  label: string;
  items: string[];
}

const MISSING_GROUP_ORDER: MissingGroup["state"][] = [
  "NOT_REQUESTED",
  "PENDING",
  "DENIED",
];

const MISSING_GROUP_META: Record<MissingGroup["state"], { icon: string; label: string }> = {
  NOT_REQUESTED: { icon: "🔒", label: "Not yet requested" },
  PENDING: { icon: "⏳", label: "Awaiting approval" },
  DENIED: { icon: "✕", label: "Denied by supplier" },
};

/**
 * Groups a component's missing (non-AUTHORIZED) required items by
 * *why* they're missing — NOT_REQUESTED / PENDING / DENIED are
 * meaningfully different states worth surfacing distinctly (this
 * stage's prompt, AGENTS.md §8), but repeating the same icon/label
 * next to every single field would be noisy, so items sharing a state
 * are grouped onto one line.
 */
export function getMissingGroups(readiness: ComponentReadiness): MissingGroup[] {
  const itemsByState: Record<MissingGroup["state"], string[]> = {
    NOT_REQUESTED: [],
    PENDING: [],
    DENIED: [],
  };

  for (const entry of readiness.requiredFields) {
    if (entry.state !== "AUTHORIZED") {
      itemsByState[entry.state].push(entry.field);
    }
  }
  if (readiness.evidence.state !== "AUTHORIZED") {
    itemsByState[readiness.evidence.state].push(EVIDENCE_REQUIREMENT_LABEL);
  }

  return MISSING_GROUP_ORDER.filter((state) => itemsByState[state].length > 0).map(
    (state) => ({
      state,
      icon: MISSING_GROUP_META[state].icon,
      label: MISSING_GROUP_META[state].label,
      items: itemsByState[state],
    })
  );
}

export interface PackagingReadinessSummary {
  overallPercent: number;
  totalRequired: number;
  totalSatisfied: number;
  isFullyComplete: boolean;
}

/**
 * Aggregates completeness across every component of a packaging item.
 * Every component has the same requiredCount (REQUIRED_PPWR_FIELDS
 * length + the evidence requirement), so summing satisfied/required
 * across components is equivalent to averaging each component's own
 * percentage — either way, this is computed from real authorization
 * state, never hardcoded to "100% ready".
 */
export function summarizeReadiness(
  componentReadinessList: ComponentReadiness[]
): PackagingReadinessSummary {
  const totalRequired = componentReadinessList.reduce(
    (sum, readiness) => sum + readiness.requiredCount,
    0
  );
  const totalSatisfied = componentReadinessList.reduce(
    (sum, readiness) => sum + readiness.satisfiedCount,
    0
  );
  const overallPercent =
    totalRequired === 0 ? 0 : Math.round((totalSatisfied / totalRequired) * 100);
  const isFullyComplete =
    componentReadinessList.length > 0 &&
    componentReadinessList.every((readiness) => readiness.overallStatus === "COMPLETE");

  return { overallPercent, totalRequired, totalSatisfied, isFullyComplete };
}
