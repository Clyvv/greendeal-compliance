"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FIELD_STATUS_OPTIONS } from "@/lib/field-status-labels";
import type { FieldStatus } from "@/lib/types";

export interface ManufacturerProvidedDataValues {
  productName: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: number;
  knownDimensions?: string;
  knownThicknessMm?: number;
  knownPackagingFunction?: string;
  totalRecycledContentPercent?: number;
  pcrYieldPercent?: number;
  preConsumerYieldPercent?: number;
  dfrGrade?: string;
  heavyMetalPpm?: number;
  pfasStatus?: FieldStatus;
  reachSvhcStatus?: FieldStatus;
  scipCode?: string;
  rohsStatus?: FieldStatus;
  fcmStatus?: FieldStatus;
  omlTestScore?: string;
  sterilizationProfile?: string;
  gtin?: string;
  evidenceDocumentNames?: string[];
}

interface FormState {
  productName: string;
  gtin: string;
  knownMaterialFamily: string;
  knownMaterialComposition: string;
  knownWeightGrams: string;
  knownDimensions: string;
  knownThicknessMm: string;
  knownPackagingFunction: string;
  totalRecycledContentPercent: string;
  pcrYieldPercent: string;
  preConsumerYieldPercent: string;
  dfrGrade: string;
  heavyMetalPpm: string;
  pfasStatus: FieldStatus;
  reachSvhcStatus: FieldStatus;
  scipCode: string;
  rohsStatus: FieldStatus;
  fcmStatus: FieldStatus;
  omlTestScore: string;
  sterilizationProfile: string;
}

const EMPTY_FORM: FormState = {
  productName: "",
  gtin: "",
  knownMaterialFamily: "",
  knownMaterialComposition: "",
  knownWeightGrams: "",
  knownDimensions: "",
  knownThicknessMm: "",
  knownPackagingFunction: "",
  totalRecycledContentPercent: "",
  pcrYieldPercent: "",
  preConsumerYieldPercent: "",
  dfrGrade: "",
  heavyMetalPpm: "",
  pfasStatus: "NOT_PROVIDED",
  reachSvhcStatus: "NOT_PROVIDED",
  scipCode: "",
  rohsStatus: "NOT_PROVIDED",
  fcmStatus: "NOT_PROVIDED",
  omlTestScore: "",
  sterilizationProfile: "",
};

function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Stage 7.11 — "Use Existing Manufacturer-Provided Data" (hasSupplier:
 * false). Rebuilt from Stage 7.3's "lighter-weight" variant of the
 * "Add External Supplier Product" form into a genuinely full data-entry
 * form: no supplier fields are collected at all (there's no supplier
 * entity in this scenario — see lib/types/external-supplier-product.ts),
 * but every compliance section is here, since the manufacturer is
 * entering everything themselves and this data will never be completed
 * later by anyone else. Sections mirror the Stage 7.10 Supplier
 * Response form's structure (components/supplier-response/supplier-response-form.tsx):
 * Product Identification, Physical, Circularity & PPWR, Chemical
 * Safety, Specialized Domain, plus a mocked evidence upload area.
 */
export function ManufacturerProvidedDataStep({
  role,
  onRoleChange,
  isPending,
  onBack,
  onSubmit,
}: {
  role: string;
  onRoleChange: (value: string) => void;
  isPending: boolean;
  onBack: () => void;
  onSubmit: (values: ManufacturerProvidedDataValues) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [evidenceNames, setEvidenceNames] = useState<string[]>([]);
  const [pendingEvidenceName, setPendingEvidenceName] = useState("");

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEvidenceFile(file: File | undefined) {
    if (!file) return;
    setPendingEvidenceName(file.name);
  }

  function confirmAddEvidence() {
    const trimmed = pendingEvidenceName.trim();
    if (!trimmed) return;
    setEvidenceNames((prev) => [...prev, trimmed]);
    setPendingEvidenceName("");
  }

  function removeEvidence(name: string) {
    setEvidenceNames((prev) => prev.filter((item) => item !== name));
  }

  const canSubmit = role.trim().length > 0 && form.productName.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      productName: form.productName.trim(),
      gtin: form.gtin.trim() || undefined,
      knownMaterialFamily: form.knownMaterialFamily.trim() || undefined,
      knownMaterialComposition: form.knownMaterialComposition.trim() || undefined,
      knownWeightGrams: toNumber(form.knownWeightGrams),
      knownDimensions: form.knownDimensions.trim() || undefined,
      knownThicknessMm: toNumber(form.knownThicknessMm),
      knownPackagingFunction: form.knownPackagingFunction.trim() || undefined,
      totalRecycledContentPercent: toNumber(form.totalRecycledContentPercent),
      pcrYieldPercent: toNumber(form.pcrYieldPercent),
      preConsumerYieldPercent: toNumber(form.preConsumerYieldPercent),
      dfrGrade: form.dfrGrade.trim() || undefined,
      heavyMetalPpm: toNumber(form.heavyMetalPpm),
      pfasStatus: form.pfasStatus,
      reachSvhcStatus: form.reachSvhcStatus,
      scipCode: form.scipCode.trim() || undefined,
      rohsStatus: form.rohsStatus,
      fcmStatus: form.fcmStatus,
      omlTestScore: form.omlTestScore.trim() || undefined,
      sterilizationProfile: form.sterilizationProfile.trim() || undefined,
      evidenceDocumentNames: evidenceNames.length ? evidenceNames : undefined,
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Use Existing Manufacturer-Provided Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            No supplier information is collected here — there is no
            supplier entity in Greendeal for this record. This data is
            self-reported by your organization and will always display
            as Manufacturer Provided · Unverified; it never becomes
            supplier-verified.
          </p>
          <div>
            <Label htmlFor="mpd-component-role">Component Role *</Label>
            <Input
              id="mpd-component-role"
              value={role}
              onChange={(event) => onRoleChange(event.target.value)}
              placeholder="e.g. Bottle, Label, Cap"
              list="mpd-component-role-suggestions"
              disabled={isPending}
            />
            <datalist id="mpd-component-role-suggestions">
              <option value="Bottle" />
              <option value="Label" />
              <option value="Cap" />
              <option value="Closure" />
              <option value="Secondary Packaging" />
            </datalist>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Identification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="mpd-product-name">Product Name *</Label>
            <Input
              id="mpd-product-name"
              value={form.productName}
              onChange={(event) => setField("productName", event.target.value)}
              placeholder="e.g. Recycled PET Bottle 500ml"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-gtin">GTIN</Label>
            <Input
              id="mpd-gtin"
              value={form.gtin}
              onChange={(event) => setField("gtin", event.target.value)}
              placeholder="e.g. 04012345678901"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical &amp; Structural Properties</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mpd-material-family">Material Family</Label>
            <Input
              id="mpd-material-family"
              value={form.knownMaterialFamily}
              onChange={(event) =>
                setField("knownMaterialFamily", event.target.value)
              }
              placeholder="e.g. Plastic"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-material-composition">
              Material Composition
            </Label>
            <Input
              id="mpd-material-composition"
              value={form.knownMaterialComposition}
              onChange={(event) =>
                setField("knownMaterialComposition", event.target.value)
              }
              placeholder="e.g. PET"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-weight">Net Weight (g)</Label>
            <Input
              id="mpd-weight"
              type="number"
              min="0"
              step="any"
              value={form.knownWeightGrams}
              onChange={(event) => setField("knownWeightGrams", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-dimensions">Dimensions</Label>
            <Input
              id="mpd-dimensions"
              value={form.knownDimensions}
              onChange={(event) => setField("knownDimensions", event.target.value)}
              placeholder="e.g. 65mm × 65mm × 210mm"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-thickness">Thickness (mm)</Label>
            <Input
              id="mpd-thickness"
              type="number"
              min="0"
              step="any"
              value={form.knownThicknessMm}
              onChange={(event) => setField("knownThicknessMm", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-packaging-function">
              Packaging Function Type
            </Label>
            <Input
              id="mpd-packaging-function"
              value={form.knownPackagingFunction}
              onChange={(event) =>
                setField("knownPackagingFunction", event.target.value)
              }
              placeholder="e.g. Primary Packaging"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Circularity &amp; PPWR Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mpd-recycled-content">
              Total Recycled Content %
            </Label>
            <Input
              id="mpd-recycled-content"
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.totalRecycledContentPercent}
              onChange={(event) =>
                setField("totalRecycledContentPercent", event.target.value)
              }
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-pcr">PCR Yield %</Label>
            <Input
              id="mpd-pcr"
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.pcrYieldPercent}
              onChange={(event) => setField("pcrYieldPercent", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-pre-consumer">Pre-Consumer Yield %</Label>
            <Input
              id="mpd-pre-consumer"
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.preConsumerYieldPercent}
              onChange={(event) =>
                setField("preConsumerYieldPercent", event.target.value)
              }
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-dfr">DfR Grade</Label>
            <Input
              id="mpd-dfr"
              value={form.dfrGrade}
              onChange={(event) => setField("dfrGrade", event.target.value)}
              placeholder="e.g. A"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chemical Safety &amp; Substance Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mpd-heavy-metal">
              Heavy Metal PPM Concentration
            </Label>
            <Input
              id="mpd-heavy-metal"
              type="number"
              min="0"
              step="any"
              value={form.heavyMetalPpm}
              onChange={(event) => setField("heavyMetalPpm", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-pfas-status">
              Intentionally Added PFAS — Declaration Status
            </Label>
            <Select
              id="mpd-pfas-status"
              value={form.pfasStatus}
              onChange={(event) =>
                setField("pfasStatus", event.target.value as FieldStatus)
              }
              disabled={isPending}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="mpd-reach">REACH SVHC Declaration Status</Label>
            <Select
              id="mpd-reach"
              value={form.reachSvhcStatus}
              onChange={(event) =>
                setField("reachSvhcStatus", event.target.value as FieldStatus)
              }
              disabled={isPending}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="mpd-scip">ECHA SCIP Registration Code</Label>
            <Input
              id="mpd-scip"
              value={form.scipCode}
              onChange={(event) => setField("scipCode", event.target.value)}
              placeholder="e.g. SCIP-0123456"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="mpd-rohs">RoHS Directive Compliance Status</Label>
            <Select
              id="mpd-rohs"
              value={form.rohsStatus}
              onChange={(event) =>
                setField("rohsStatus", event.target.value as FieldStatus)
              }
              disabled={isPending}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specialized Domain Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mpd-fcm">
              Food Contact Material (FCM) Approval Status
            </Label>
            <Select
              id="mpd-fcm"
              value={form.fcmStatus}
              onChange={(event) =>
                setField("fcmStatus", event.target.value as FieldStatus)
              }
              disabled={isPending}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="mpd-oml">
              Overall Migration Limit (OML) Test Score
            </Label>
            <Input
              id="mpd-oml"
              value={form.omlTestScore}
              onChange={(event) => setField("omlTestScore", event.target.value)}
              placeholder="e.g. Pass — 8mg/dm²"
              disabled={isPending}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="mpd-sterilization">
              Sterilization Method Compatibility Profile
            </Label>
            <Textarea
              id="mpd-sterilization"
              rows={3}
              value={form.sterilizationProfile}
              onChange={(event) =>
                setField("sterilizationProfile", event.target.value)
              }
              placeholder="e.g. Compatible with steam autoclaving up to 121°C"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">
            File upload is mocked for this prototype — selecting a file
            only captures its filename, nothing is actually uploaded.
          </p>

          {evidenceNames.length > 0 && (
            <ul className="space-y-2">
              {evidenceNames.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-2"
                >
                  <p className="text-sm text-slate-900">{name}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidence(name)}
                    disabled={isPending}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              id="mpd-evidence-file"
              type="file"
              className="block text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
              onChange={(event) => handleEvidenceFile(event.target.files?.[0])}
              disabled={isPending}
            />
            {pendingEvidenceName && (
              <>
                <span className="text-sm text-slate-700">
                  {pendingEvidenceName}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={confirmAddEvidence}
                  disabled={isPending}
                >
                  Add
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <Button variant="ghost" type="button" onClick={onBack} disabled={isPending}>
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
          >
            {isPending ? "Adding…" : "Add Component"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
