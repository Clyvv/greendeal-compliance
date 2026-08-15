"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import {
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_TO_PILL,
  getEffectiveEvidenceStatus,
} from "@/lib/evidence-utils";
import { DetailField } from "./detail-field";
import type { Evidence } from "@/lib/types";

export function EvidenceSection({
  evidenceItems,
}: {
  evidenceItems: Evidence[];
}) {
  if (evidenceItems.length === 0) {
    return (
      <EmptyState
        title="No evidence on file"
        description="Supporting documents will appear here once added."
      />
    );
  }

  return (
    <div className="space-y-3">
      {evidenceItems.map((item) => {
        // Computed, not trusted blindly — a stored "VALID" that has
        // actually passed its expiration date still shows as Expired.
        const effectiveStatus = getEffectiveEvidenceStatus(item);
        return (
          <Card key={item.id}>
            <CardContent className="space-y-3 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.documentName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.evidenceType}
                  </p>
                </div>
                <StatusPill
                  status={EVIDENCE_STATUS_TO_PILL[effectiveStatus]}
                  label={EVIDENCE_STATUS_LABELS[effectiveStatus]}
                />
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DetailField
                  label="Issuing Authority"
                  value={item.issuingAuthority}
                />
                <DetailField
                  label="Issue Date"
                  value={formatDate(item.issueDate)}
                />
                <DetailField
                  label="Expiration Date"
                  value={formatDate(item.expirationDate)}
                />
              </dl>

              {item.supportedAttributes.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Supports
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {item.supportedAttributes.map((attribute) => (
                      <Badge key={attribute} tone="neutral">
                        {attribute}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
