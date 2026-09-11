"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { FIELD_STATUS_OPTIONS } from "@/lib/field-status-labels";
import { submitSupplierResponseAction } from "@/lib/supplier-response/actions";
import type { ExternalSupplierProduct, FieldStatus } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

interface FormState {
  supplierCompanyName: string;
  supplierContactName: string;
  productName: string;
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
}

function toInitialState(product: ExternalSupplierProduct): FormState {
  return {
    supplierCompanyName: product.supplierCompanyName,
    supplierContactName: product.supplierContactName ?? "",
    productName: product.productName,
    knownMaterialFamily: product.knownMaterialFamily ?? "",
    knownMaterialComposition: product.knownMaterialComposition ?? "",
    knownWeightGrams:
      product.knownWeightGrams !== undefined ? String(product.knownWeightGrams) : "",
    knownDimensions: product.knownDimensions ?? "",
    knownThicknessMm:
      product.knownThicknessMm !== undefined ? String(product.knownThicknessMm) : "",
    knownPackagingFunction: product.knownPackagingFunction ?? "",
    totalRecycledContentPercent:
      product.totalRecycledContentPercent !== undefined
        ? String(product.totalRecycledContentPercent)
        : "",
    pcrYieldPercent:
      product.pcrYieldPercent !== undefined ? String(product.pcrYieldPercent) : "",
    preConsumerYieldPercent:
      product.preConsumerYieldPercent !== undefined
        ? String(product.preConsumerYieldPercent)
        : "",
    dfrGrade: product.dfrGrade ?? "",
    heavyMetalPpm:
      product.heavyMetalPpm !== undefined ? String(product.heavyMetalPpm) : "",
    pfasStatus: product.pfasStatus ?? "NOT_PROVIDED",
    reachSvhcStatus: product.reachSvhcStatus ?? "NOT_PROVIDED",
    scipCode: product.scipCode ?? "",
    rohsStatus: product.rohsStatus ?? "NOT_PROVIDED",
  };
}

/**
 * Stage 7.10 — the Supplier Response form itself. Pre-filled (editable,
 * not read-only) with whatever the manufacturer already entered on the
 * ExternalSupplierProduct, grouped the same way as the Create Product
 * wizard's sections (DOMAIN.md §2 / components/products/wizard-steps),
 * though deliberately not full wizard parity — no Identification/
 * Specialized Domain sections, since AGENTS.md's Supplier Response Link
 * spec scopes this to Physical + Circularity + Chemical Safety plus
 * evidence. On submit this stays an ExternalSupplierProduct (never
 * converts into a real SupplierProduct — AGENTS.md §11 is still out of
 * scope), just an upgraded one.
 */
export function SupplierResponseForm({
  token,
  externalSupplierProduct,
  manufacturerName,
}: {
  token: string;
  externalSupplierProduct: ExternalSupplierProduct;
  manufacturerName: string;
}) {
  const [form, setForm] = useState<FormState>(() =>
    toInitialState(externalSupplierProduct)
  );
  const [evidenceNames, setEvidenceNames] = useState<string[]>(
    externalSupplierProduct.responseEvidenceDocumentNames ?? []
  );
  const [pendingEvidenceName, setPendingEvidenceName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(
    externalSupplierProduct.responseStatus === "COMPLETED"
  );
  const { toast } = useToast();

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddEvidence(file: File | undefined) {
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

  function handleSubmit() {
    if (!form.supplierCompanyName.trim() || !form.productName.trim()) {
      toast({
        title: "Missing required fields",
        description: "Supplier company name and product name are required.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      try {
        await submitSupplierResponseAction(token, {
          ...form,
          responseEvidenceDocumentNames: evidenceNames,
        });
        setSubmitted(true);
      } catch (error) {
        toast({
          title: "Couldn't submit your response",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="space-y-2 py-5">
          <p className="text-sm font-semibold text-emerald-900">
            ✓ Thank you
          </p>
          <p className="text-sm text-emerald-800">
            {manufacturerName} has been notified that you completed this
            product&rsquo;s compliance information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier &amp; Product</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="response-supplier-company">
              Supplier Company Name
            </Label>
            <Input
              id="response-supplier-company"
              value={form.supplierCompanyName}
              disabled
              title="Set by the manufacturer when this record was created"
            />
          </div>
          <div>
            <Label htmlFor="response-contact-name">Your Name</Label>
            <Input
              id="response-contact-name"
              value={form.supplierContactName}
              onChange={(event) =>
                setField("supplierContactName", event.target.value)
              }
              disabled={isPending}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="response-product-name">Product Name *</Label>
            <Input
              id="response-product-name"
              value={form.productName}
              onChange={(event) => setField("productName", event.target.value)}
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
            <Label htmlFor="response-material-family">Material Family</Label>
            <Input
              id="response-material-family"
              value={form.knownMaterialFamily}
              onChange={(event) =>
                setField("knownMaterialFamily", event.target.value)
              }
              placeholder="e.g. Plastic"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-material-composition">
              Material Composition
            </Label>
            <Input
              id="response-material-composition"
              value={form.knownMaterialComposition}
              onChange={(event) =>
                setField("knownMaterialComposition", event.target.value)
              }
              placeholder="e.g. PET"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-weight">Net Weight (g)</Label>
            <Input
              id="response-weight"
              type="number"
              min="0"
              step="any"
              value={form.knownWeightGrams}
              onChange={(event) => setField("knownWeightGrams", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-dimensions">Dimensions</Label>
            <Input
              id="response-dimensions"
              value={form.knownDimensions}
              onChange={(event) => setField("knownDimensions", event.target.value)}
              placeholder="e.g. 65mm × 65mm × 210mm"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-thickness">Thickness (mm)</Label>
            <Input
              id="response-thickness"
              type="number"
              min="0"
              step="any"
              value={form.knownThicknessMm}
              onChange={(event) => setField("knownThicknessMm", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-packaging-function">
              Packaging Function Type
            </Label>
            <Input
              id="response-packaging-function"
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
            <Label htmlFor="response-recycled-content">
              Total Recycled Content %
            </Label>
            <Input
              id="response-recycled-content"
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
            <Label htmlFor="response-pcr">PCR Yield %</Label>
            <Input
              id="response-pcr"
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
            <Label htmlFor="response-pre-consumer">
              Pre-Consumer Yield %
            </Label>
            <Input
              id="response-pre-consumer"
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
            <Label htmlFor="response-dfr">DfR Grade</Label>
            <Input
              id="response-dfr"
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
            <Label htmlFor="response-heavy-metal">
              Heavy Metal PPM Concentration
            </Label>
            <Input
              id="response-heavy-metal"
              type="number"
              min="0"
              step="any"
              value={form.heavyMetalPpm}
              onChange={(event) => setField("heavyMetalPpm", event.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-pfas-status">
              Intentionally Added PFAS — Declaration Status
            </Label>
            <Select
              id="response-pfas-status"
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
            <Label htmlFor="response-reach">REACH SVHC Declaration Status</Label>
            <Select
              id="response-reach"
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
            <Label htmlFor="response-scip">ECHA SCIP Registration Code</Label>
            <Input
              id="response-scip"
              value={form.scipCode}
              onChange={(event) => setField("scipCode", event.target.value)}
              placeholder="e.g. SCIP-0123456"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="response-rohs">
              RoHS Directive Compliance Status
            </Label>
            <Select
              id="response-rohs"
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
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">
            File upload is mocked for this prototype — selecting a file only
            captures its filename, nothing is actually uploaded.
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
              id="response-evidence-file"
              type="file"
              className="block text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
              onChange={(event) => handleAddEvidence(event.target.files?.[0])}
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

      <div className="flex justify-end">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Submitting…" : "Submit Information"}
        </Button>
      </div>
    </div>
  );
}
