"use client";

import { DetailField, NoVersionMessage } from "./detail-field";
import { SectionProvenance } from "./section-provenance";
import type { ProductVersion } from "@/lib/types";

export function CircularitySection({
  version,
  supplierName,
}: {
  version?: ProductVersion;
  supplierName?: string;
}) {
  if (!version) return <NoVersionMessage />;
  const { circularity } = version;

  return (
    <div className="space-y-4">
      <SectionProvenance supplierName={supplierName} />
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField
          label="Total Recycled Content %"
          value={`${circularity.totalRecycledContentPercent}%`}
        />
        <DetailField
          label="PCR Yield %"
          value={`${circularity.pcrYieldPercent}%`}
        />
        <DetailField
          label="Pre-Consumer Yield %"
          value={`${circularity.preConsumerYieldPercent}%`}
        />
        <DetailField label="DfR Grade" value={circularity.dfrGrade} />
        <DetailField
          label="Reusability Status"
          value={circularity.reusabilityStatus}
        />
      </dl>
    </div>
  );
}
