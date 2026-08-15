"use client";

import { DetailField, NoVersionMessage } from "./detail-field";
import type { ProductVersion } from "@/lib/types";

export function PhysicalSection({
  version,
}: {
  version?: ProductVersion;
}) {
  if (!version) return <NoVersionMessage />;
  const { physical } = version;

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DetailField label="Material Family" value={physical.materialFamily} />
      <DetailField
        label="Specific Material Composition"
        value={physical.specificMaterial}
      />
      <DetailField
        label="Component Net Weight"
        value={`${physical.netWeightGrams}g`}
      />
      <DetailField label="Dimensions" value={physical.dimensions} />
      <DetailField label="Thickness" value={`${physical.thicknessMm}mm`} />
      <DetailField
        label="Packaging Function Type"
        value={physical.packagingFunction}
      />
    </dl>
  );
}
