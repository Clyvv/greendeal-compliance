"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ProductWizardFormState, WizardFieldSetter } from "@/lib/wizard/types";

export function Step2Physical({
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
          Physical &amp; Structural Properties
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wizard-material-family">Material Family</Label>
          <Input
            id="wizard-material-family"
            value={form.materialFamily}
            onChange={(event) =>
              onFieldChange("materialFamily", event.target.value)
            }
            placeholder="e.g. Plastic"
          />
        </div>
        <div>
          <Label htmlFor="wizard-specific-material">
            Specific Material Composition
          </Label>
          <Input
            id="wizard-specific-material"
            value={form.specificMaterial}
            onChange={(event) =>
              onFieldChange("specificMaterial", event.target.value)
            }
            placeholder="e.g. PET"
          />
        </div>
        <div>
          <Label htmlFor="wizard-net-weight">Component Net Weight (g)</Label>
          <Input
            id="wizard-net-weight"
            type="number"
            min="0"
            step="any"
            value={form.netWeightGrams}
            onChange={(event) =>
              onFieldChange("netWeightGrams", event.target.value)
            }
            placeholder="e.g. 18.2"
          />
        </div>
        <div>
          <Label htmlFor="wizard-dimensions">Dimensions</Label>
          <Input
            id="wizard-dimensions"
            value={form.dimensions}
            onChange={(event) =>
              onFieldChange("dimensions", event.target.value)
            }
            placeholder="e.g. 65mm × 65mm × 210mm"
          />
        </div>
        <div>
          <Label htmlFor="wizard-thickness">Thickness (mm)</Label>
          <Input
            id="wizard-thickness"
            type="number"
            min="0"
            step="any"
            value={form.thicknessMm}
            onChange={(event) =>
              onFieldChange("thicknessMm", event.target.value)
            }
            placeholder="e.g. 0.35"
          />
        </div>
        <div>
          <Label htmlFor="wizard-packaging-function">
            Packaging Function Type
          </Label>
          <Input
            id="wizard-packaging-function"
            value={form.packagingFunction}
            onChange={(event) =>
              onFieldChange("packagingFunction", event.target.value)
            }
            placeholder="e.g. Primary Packaging"
          />
        </div>
      </div>
    </div>
  );
}
