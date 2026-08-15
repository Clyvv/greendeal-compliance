import { FIELD_STATUS_LABELS } from "@/lib/field-status-labels";
import { PUBLISH_COMPLETENESS_THRESHOLD } from "@/lib/wizard/completeness";
import type { ProductWizardFormState } from "@/lib/wizard/types";

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const display =
    value === undefined || value === null || value === ""
      ? "—"
      : String(value);
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-900">{display}</dd>
    </div>
  );
}

function pfasFlagLabel(value: ProductWizardFormState["pfasIntentionallyAdded"]) {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return "Unknown";
}

export function Step7Review({
  form,
  completeness,
}: {
  form: ProductWizardFormState;
  completeness: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Review &amp; Publish
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Check the compliance profile below before saving or publishing.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Data Completeness
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {completeness}%
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Publishing requires at least {PUBLISH_COMPLETENESS_THRESHOLD}%
          (see lib/wizard/completeness.ts for the exact weighting). Saving
          as a draft never requires a minimum.
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          Identification
        </h3>
        <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Product Name" value={form.name} />
          <Field label="Supplier SKU" value={form.sku} />
          <Field label="GTIN / EAN" value={form.gtin} />
          <Field label="Country of Origin" value={form.countryOfOrigin} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          Physical &amp; Structural
        </h3>
        <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Material Family" value={form.materialFamily} />
          <Field
            label="Specific Material Composition"
            value={form.specificMaterial}
          />
          <Field
            label="Component Net Weight"
            value={form.netWeightGrams ? `${form.netWeightGrams}g` : ""}
          />
          <Field label="Dimensions" value={form.dimensions} />
          <Field
            label="Thickness"
            value={form.thicknessMm ? `${form.thicknessMm}mm` : ""}
          />
          <Field
            label="Packaging Function Type"
            value={form.packagingFunction}
          />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          Circularity &amp; PPWR
        </h3>
        <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Total Recycled Content %"
            value={
              form.totalRecycledContentPercent
                ? `${form.totalRecycledContentPercent}%`
                : ""
            }
          />
          <Field
            label="PCR Yield %"
            value={form.pcrYieldPercent ? `${form.pcrYieldPercent}%` : ""}
          />
          <Field
            label="Pre-Consumer Yield %"
            value={
              form.preConsumerYieldPercent
                ? `${form.preConsumerYieldPercent}%`
                : ""
            }
          />
          <Field label="DfR Grade" value={form.dfrGrade} />
          <Field label="Reusability Status" value={form.reusabilityStatus} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          Chemical Safety
        </h3>
        <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Heavy Metal PPM Concentration"
            value={form.heavyMetalPpm}
          />
          <Field
            label="Intentionally Added PFAS"
            value={pfasFlagLabel(form.pfasIntentionallyAdded)}
          />
          <Field
            label="PFAS Declaration Status"
            value={FIELD_STATUS_LABELS[form.pfasStatus]}
          />
          <Field
            label="REACH SVHC Declaration Status"
            value={FIELD_STATUS_LABELS[form.reachSvhcStatus]}
          />
          <Field label="ECHA SCIP Registration Code" value={form.scipCode} />
          <Field
            label="RoHS Directive Compliance Status"
            value={FIELD_STATUS_LABELS[form.rohsStatus]}
          />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          Specialized Domain
        </h3>
        <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="FCM Approval Status"
            value={FIELD_STATUS_LABELS[form.fcmStatus]}
          />
          <Field label="OML Test Score" value={form.omlTestScore} />
          <Field
            label="Sterilization Method Compatibility Profile"
            value={form.sterilizationProfile}
          />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          Evidence &amp; Governance ({form.evidenceDrafts.length})
        </h3>
        {form.evidenceDrafts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No evidence added.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {form.evidenceDrafts.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-slate-200 p-3 text-sm"
              >
                <p className="font-medium text-slate-900">
                  {item.documentName || "Untitled document"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.evidenceType || "—"} · {item.issuingAuthority || "—"} ·
                  Expires {item.expirationDate || "—"}
                </p>
                {item.supportedAttributes.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Supports: {item.supportedAttributes.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
