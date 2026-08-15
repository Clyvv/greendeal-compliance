"use client";

import type { ReactNode } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { FIELD_STATUS_LABELS, FIELD_STATUS_TO_PILL } from "@/lib/field-status-labels";
import type { FieldStatus } from "@/lib/types";

export function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  );
}

/**
 * Renders a plain optional value, or a "Missing" ⚠ pill when unset —
 * per AGENTS.md §4, missing data must never just render blank.
 */
export function OptionalValue({
  value,
  suffix = "",
}: {
  value?: string | number;
  suffix?: string;
}) {
  if (value === undefined || value === null || value === "") {
    return <StatusPill status="missing" label="Missing" />;
  }
  return (
    <>
      {value}
      {suffix}
    </>
  );
}

/**
 * Renders a FieldStatus value as its mapped StatusPill. NOT_PROVIDED
 * (⚠) and NOT_APPLICABLE (○) always render as visibly distinct pills,
 * never blank and never collapsed into one state (AGENTS.md §8).
 */
export function FieldStatusValue({ status }: { status: FieldStatus }) {
  return (
    <StatusPill
      status={FIELD_STATUS_TO_PILL[status]}
      label={FIELD_STATUS_LABELS[status]}
    />
  );
}

export function NoVersionMessage() {
  return (
    <p className="text-sm text-slate-500">
      No version data available for this product.
    </p>
  );
}
