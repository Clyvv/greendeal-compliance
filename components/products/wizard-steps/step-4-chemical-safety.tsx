"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FIELD_STATUS_OPTIONS } from "@/lib/field-status-labels";
import type { ProductWizardFormState, WizardFieldSetter } from "@/lib/wizard/types";

export function Step4ChemicalSafety({
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
          Chemical Safety &amp; Substance Restrictions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Use &quot;Not Applicable&quot; when a substance genuinely
          doesn&apos;t apply to this product, and &quot;Not
          Provided&quot; when the determination simply hasn&apos;t been
          made yet — they&apos;re different states.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wizard-heavy-metal">
            Heavy Metal PPM Concentration
          </Label>
          <Input
            id="wizard-heavy-metal"
            type="number"
            min="0"
            step="any"
            value={form.heavyMetalPpm}
            onChange={(event) =>
              onFieldChange("heavyMetalPpm", event.target.value)
            }
            placeholder="e.g. 12"
          />
        </div>
        <div>
          <Label htmlFor="wizard-pfas-added">Intentionally Added PFAS</Label>
          <Select
            id="wizard-pfas-added"
            value={form.pfasIntentionallyAdded}
            onChange={(event) =>
              onFieldChange(
                "pfasIntentionallyAdded",
                event.target.value as ProductWizardFormState["pfasIntentionallyAdded"]
              )
            }
          >
            <option value="">Unknown / Not provided</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="wizard-pfas-status">
            Intentionally Added PFAS — Declaration Status
          </Label>
          <Select
            id="wizard-pfas-status"
            value={form.pfasStatus}
            onChange={(event) =>
              onFieldChange(
                "pfasStatus",
                event.target.value as ProductWizardFormState["pfasStatus"]
              )
            }
          >
            {FIELD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="wizard-reach">
            REACH SVHC Declaration Status
          </Label>
          <Select
            id="wizard-reach"
            value={form.reachSvhcStatus}
            onChange={(event) =>
              onFieldChange(
                "reachSvhcStatus",
                event.target.value as ProductWizardFormState["reachSvhcStatus"]
              )
            }
          >
            {FIELD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="wizard-scip">ECHA SCIP Registration Code</Label>
          <Input
            id="wizard-scip"
            value={form.scipCode}
            onChange={(event) => onFieldChange("scipCode", event.target.value)}
            placeholder="e.g. SCIP-0123456"
          />
        </div>
        <div>
          <Label htmlFor="wizard-rohs">
            RoHS Directive Compliance Status
          </Label>
          <Select
            id="wizard-rohs"
            value={form.rohsStatus}
            onChange={(event) =>
              onFieldChange(
                "rohsStatus",
                event.target.value as ProductWizardFormState["rohsStatus"]
              )
            }
          >
            {FIELD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
