"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FIELD_STATUS_OPTIONS } from "@/lib/field-status-labels";
import type { ProductWizardFormState, WizardFieldSetter } from "@/lib/wizard/types";

export function Step5SpecializedDomain({
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
          Specialized Domain Metrics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          If food-contact rules genuinely don&apos;t apply (e.g. an outer
          label), choose &quot;Not Applicable&quot; rather than leaving
          this as &quot;Not Provided&quot;.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wizard-fcm">
            Food Contact Material (FCM) Approval Status
          </Label>
          <Select
            id="wizard-fcm"
            value={form.fcmStatus}
            onChange={(event) =>
              onFieldChange(
                "fcmStatus",
                event.target.value as ProductWizardFormState["fcmStatus"]
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
          <Label htmlFor="wizard-oml">
            Overall Migration Limit (OML) Test Score
          </Label>
          <Input
            id="wizard-oml"
            value={form.omlTestScore}
            onChange={(event) =>
              onFieldChange("omlTestScore", event.target.value)
            }
            placeholder="e.g. Pass — 8mg/dm²"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="wizard-sterilization">
          Sterilization Method Compatibility Profile
        </Label>
        <Textarea
          id="wizard-sterilization"
          rows={3}
          value={form.sterilizationProfile}
          onChange={(event) =>
            onFieldChange("sterilizationProfile", event.target.value)
          }
          placeholder="e.g. Compatible with steam autoclaving up to 121°C"
        />
      </div>
    </div>
  );
}
