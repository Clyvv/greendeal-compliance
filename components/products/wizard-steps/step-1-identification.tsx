"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ProductWizardFormState, WizardFieldSetter } from "@/lib/wizard/types";

export function Step1Identification({
  form,
  onFieldChange,
}: {
  form: ProductWizardFormState;
  onFieldChange: WizardFieldSetter;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Product &amp; Supplier Identification
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Production Batch / Lot Number isn&apos;t collected here — it
          belongs to a Production Batch, not the product itself.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wizard-name">Product Name *</Label>
          <Input
            id="wizard-name"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="e.g. PET Bottle 500ml"
          />
        </div>
        <div>
          <Label htmlFor="wizard-sku">Supplier SKU *</Label>
          <Input
            id="wizard-sku"
            value={form.sku}
            onChange={(event) => onFieldChange("sku", event.target.value)}
            placeholder="e.g. PET-500"
          />
        </div>
        <div>
          <Label htmlFor="wizard-gtin">GTIN / EAN</Label>
          <Input
            id="wizard-gtin"
            value={form.gtin}
            onChange={(event) => onFieldChange("gtin", event.target.value)}
            placeholder="e.g. 04012345678901"
          />
        </div>
        <div>
          <Label htmlFor="wizard-country">Country of Origin</Label>
          <Input
            id="wizard-country"
            value={form.countryOfOrigin}
            onChange={(event) =>
              onFieldChange("countryOfOrigin", event.target.value)
            }
            placeholder="e.g. Germany"
          />
        </div>
      </div>
    </div>
  );
}
