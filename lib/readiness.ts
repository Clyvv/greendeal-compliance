import type { DataRequestStatus } from "@/lib/types";
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
  overallStatus: "COMPLETE" | "PARTIAL" | "NOT_READY";
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

export const COMPONENT_READINESS_TO_PILL: Record<
  ComponentReadiness["overallStatus"],
  StatusPillStatus
> = {
  COMPLETE: "complete",
  PARTIAL: "missing",
  NOT_READY: "not-authorized",
};

export const COMPONENT_READINESS_LABELS: Record<
  ComponentReadiness["overallStatus"],
  string
> = {
  COMPLETE: "Complete",
  PARTIAL: "Partial",
  NOT_READY: "Not Requested",
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
