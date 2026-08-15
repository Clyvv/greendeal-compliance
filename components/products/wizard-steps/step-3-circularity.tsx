"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ProductWizardFormState, WizardFieldSetter } from "@/lib/wizard/types";

export function Step3Circularity({
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
          Circularity &amp; PPWR Metrics
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wizard-total-recycled">
            Total Recycled Content %
          </Label>
          <Input
            id="wizard-total-recycled"
            type="number"
            min="0"
            max="100"
            step="any"
            value={form.totalRecycledContentPercent}
            onChange={(event) =>
              onFieldChange("totalRecycledContentPercent", event.target.value)
            }
            placeholder="e.g. 35"
          />
        </div>
        <div>
          <Label htmlFor="wizard-pcr">PCR Yield %</Label>
          <Input
            id="wizard-pcr"
            type="number"
            min="0"
            max="100"
            step="any"
            value={form.pcrYieldPercent}
            onChange={(event) =>
              onFieldChange("pcrYieldPercent", event.target.value)
            }
            placeholder="e.g. 30"
          />
        </div>
        <div>
          <Label htmlFor="wizard-pre-consumer">Pre-Consumer Yield %</Label>
          <Input
            id="wizard-pre-consumer"
            type="number"
            min="0"
            max="100"
            step="any"
            value={form.preConsumerYieldPercent}
            onChange={(event) =>
              onFieldChange("preConsumerYieldPercent", event.target.value)
            }
            placeholder="e.g. 5"
          />
        </div>
        <div>
          <Label htmlFor="wizard-dfr">DfR Grade</Label>
          <Input
            id="wizard-dfr"
            value={form.dfrGrade}
            onChange={(event) => onFieldChange("dfrGrade", event.target.value)}
            placeholder="e.g. A"
          />
        </div>
        <div>
          <Label htmlFor="wizard-reusability">Reusability Status</Label>
          <Input
            id="wizard-reusability"
            value={form.reusabilityStatus}
            onChange={(event) =>
              onFieldChange("reusabilityStatus", event.target.value)
            }
            placeholder="e.g. Not reusable"
          />
        </div>
      </div>
    </div>
  );
}
