"use client";

import {
  DetailField,
  FieldStatusValue,
  NoVersionMessage,
  OptionalValue,
} from "./detail-field";
import { SectionProvenance } from "./section-provenance";
import type { ProductVersion } from "@/lib/types";

export function SpecializedDomainSection({
  version,
  supplierName,
}: {
  version?: ProductVersion;
  supplierName?: string;
}) {
  if (!version) return <NoVersionMessage />;
  const { specializedDomain } = version;

  return (
    <div className="space-y-4">
      <SectionProvenance supplierName={supplierName} />
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField
          label="FCM Approval Status"
          value={<FieldStatusValue status={specializedDomain.fcmStatus} />}
        />
        <DetailField
          label="OML Test Score"
          value={<OptionalValue value={specializedDomain.omlTestScore} />}
        />
        <DetailField
          label="Sterilization Method Compatibility Profile"
          value={
            <OptionalValue value={specializedDomain.sterilizationProfile} />
          }
        />
      </dl>
    </div>
  );
}
