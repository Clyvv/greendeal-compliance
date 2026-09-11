"use client";

import {
  DetailField,
  FieldStatusValue,
  NoVersionMessage,
  OptionalValue,
} from "./detail-field";
import { SectionProvenance } from "./section-provenance";
import type { ProductVersion } from "@/lib/types";

export function ChemicalSafetySection({
  version,
  supplierName,
}: {
  version?: ProductVersion;
  supplierName?: string;
}) {
  if (!version) return <NoVersionMessage />;
  const { chemicalSafety } = version;

  return (
    <div className="space-y-4">
      <SectionProvenance supplierName={supplierName} />
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField
          label="Heavy Metal PPM Concentration"
          value={<OptionalValue value={chemicalSafety.heavyMetalPpm} />}
        />
        <DetailField
          label="Intentionally Added PFAS"
          value={
            chemicalSafety.pfasIntentionallyAdded === null
              ? "Unknown"
              : chemicalSafety.pfasIntentionallyAdded
                ? "Yes"
                : "No"
          }
        />
        <DetailField
          label="PFAS Declaration Status"
          value={<FieldStatusValue status={chemicalSafety.pfasStatus} />}
        />
        <DetailField
          label="REACH SVHC Declaration Status"
          value={<FieldStatusValue status={chemicalSafety.reachSvhcStatus} />}
        />
        <DetailField
          label="ECHA SCIP Registration Code"
          value={<OptionalValue value={chemicalSafety.scipCode} />}
        />
        <DetailField
          label="RoHS Directive Compliance Status"
          value={<FieldStatusValue status={chemicalSafety.rohsStatus} />}
        />
      </dl>
    </div>
  );
}
