"use client";

import { DetailField, OptionalValue } from "./detail-field";
import { SectionProvenance } from "./section-provenance";
import type { SupplierProduct } from "@/lib/types";

export function IdentificationSection({
  product,
  supplierName,
}: {
  product: SupplierProduct;
  supplierName?: string;
}) {
  return (
    <div className="space-y-4">
      <SectionProvenance supplierName={supplierName} />
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Product Name" value={product.name} />
        <DetailField label="Supplier SKU" value={product.sku} />
        <DetailField
          label="GTIN / EAN"
          value={<OptionalValue value={product.gtin} />}
        />
        <DetailField
          label="Country of Origin"
          value={<OptionalValue value={product.countryOfOrigin} />}
        />
      </dl>
      <p className="text-xs text-slate-500">
        Production Batch / Lot Number is tracked per Production Batch, not
        at the product level — see DOMAIN.md §1.
      </p>
    </div>
  );
}
