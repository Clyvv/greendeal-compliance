"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { useToast } from "@/components/providers/toast-provider";
import { FIELD_STATUS_OPTIONS } from "@/lib/field-status-labels";
import { buildExternalSupplierProvenance } from "@/lib/provenance";
import { updateExternalSupplierProductAction } from "@/lib/packaging/actions";
import type { ExternalSupplierProduct, FieldStatus } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

interface FormState {
  supplierCompanyName: string;
  supplierContactName: string;
  supplierEmail: string;
  supplierCountry: string;
  productName: string;
  supplierSku: string;
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

function toFormState(product: ExternalSupplierProduct): FormState {
  return {
    supplierCompanyName: product.supplierCompanyName ?? "",
    supplierContactName: product.supplierContactName ?? "",
    supplierEmail: product.supplierEmail ?? "",
    supplierCountry: product.supplierCountry ?? "",
    productName: product.productName,
    supplierSku: product.supplierSku ?? "",
    gtin: product.gtin ?? "",
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
    fcmStatus: product.fcmStatus ?? "NOT_PROVIDED",
    omlTestScore: product.omlTestScore ?? "",
    sterilizationProfile: product.sterilizationProfile ?? "",
  };
}

function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * View / edit an ExternalSupplierProduct component's full record —
 * previously only creatable via the Add Component flow, with no way
 * back in to see or change what was entered. Shares its section
 * structure with components/packaging/manufacturer-provided-data-step.tsx
 * and components/supplier-response/supplier-response-form.tsx (Product
 * Identification, Physical, Circularity & PPWR, Chemical Safety,
 * Specialized Domain, Evidence).
 *
 * Read-only once a hasSupplier:true record's Supplier Response has been
 * COMPLETED — that data is supplier-owned/approved at that point (see
 * mockExternalSupplierService.updateExternalSupplierProduct), so this
 * form disables every field and hides Save rather than let the
 * manufacturer silently overwrite it. hasSupplier:false records (no
 * supplier fields shown at all, matching the creation flow) and any
 * hasSupplier:true record not yet completed stay fully editable.
 */
export function ExternalSupplierProductDetailForm({
  packagingItemId,
  packagingItemName,
  componentRole,
  externalSupplierProduct,
}: {
  packagingItemId: string;
  packagingItemName: string;
  componentRole: string;
  externalSupplierProduct: ExternalSupplierProduct;
}) {
  const { hasSupplier } = externalSupplierProduct;
  const isLocked =
    hasSupplier && externalSupplierProduct.responseStatus === "COMPLETED";

  const [form, setForm] = useState<FormState>(() =>
    toFormState(externalSupplierProduct)
  );
  const [evidenceNames, setEvidenceNames] = useState<string[]>(
    externalSupplierProduct.evidenceDocumentNames ?? []
  );
  const [pendingEvidenceName, setPendingEvidenceName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const provenance = buildExternalSupplierProvenance(externalSupplierProduct);
  const isEditable = !isLocked;

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

  function handleSave() {
    if (!form.productName.trim()) {
      toast({
        title: "Product name required",
        description: "Enter a product name before saving.",
        variant: "destructive",
      });
      return;
    }
    if (hasSupplier && !form.supplierCompanyName.trim()) {
      toast({
        title: "Supplier company name required",
        description: "Enter the supplier's company name before saving.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateExternalSupplierProductAction({
          packagingItemId,
          externalSupplierProductId: externalSupplierProduct.id,
          supplierCompanyName: form.supplierCompanyName,
          supplierContactName: form.supplierContactName,
          supplierEmail: form.supplierEmail,
          supplierCountry: form.supplierCountry,
          productName: form.productName,
          supplierSku: form.supplierSku,
          gtin: form.gtin,
          knownMaterialFamily: form.knownMaterialFamily,
          knownMaterialComposition: form.knownMaterialComposition,
          knownWeightGrams: toNumber(form.knownWeightGrams),
          knownDimensions: form.knownDimensions,
          knownThicknessMm: toNumber(form.knownThicknessMm),
          knownPackagingFunction: form.knownPackagingFunction,
          totalRecycledContentPercent: toNumber(form.totalRecycledContentPercent),
          pcrYieldPercent: toNumber(form.pcrYieldPercent),
          preConsumerYieldPercent: toNumber(form.preConsumerYieldPercent),
          dfrGrade: form.dfrGrade,
          heavyMetalPpm: toNumber(form.heavyMetalPpm),
          pfasStatus: form.pfasStatus,
          reachSvhcStatus: form.reachSvhcStatus,
          scipCode: form.scipCode,
          rohsStatus: form.rohsStatus,
          fcmStatus: form.fcmStatus,
          omlTestScore: form.omlTestScore,
          sterilizationProfile: form.sterilizationProfile,
          evidenceDocumentNames: evidenceNames,
        });
        toast({
          title: "Saved",
          description: "Component details updated.",
          variant: "success",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Couldn't save changes",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  const disabled = isPending || !isEditable;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/manufacturer/packaging-items/${packagingItemId}`}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to {packagingItemName}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {componentRole}: {externalSupplierProduct.productName}
          </h1>
          <Badge tone="warning">External Supplier Product</Badge>
        </div>
        <div className="mt-1">
          <ProvenanceBadge provenance={provenance} />
        </div>
      </div>

      {isLocked && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm text-emerald-800">
            ✓ This data was provided by the supplier via a completed
            response and can no longer be edited here — it&rsquo;s
            supplier-owned data now. Everything below is shown read-only.
          </p>
        </div>
      )}
      {!hasSupplier && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm text-slate-700">
            No supplier associated — this is self-reported data your
            organization entered directly. It will never become
            supplier-verified, but you can edit it any time.
          </p>
        </div>
      )}

      {hasSupplier && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier &amp; Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="detail-supplier-company">
                Supplier Company Name *
              </Label>
              <Input
                id="detail-supplier-company"
                value={form.supplierCompanyName}
                onChange={(event) =>
                  setField("supplierCompanyName", event.target.value)
                }
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="detail-contact-name">Contact Name</Label>
              <Input
                id="detail-contact-name"
                value={form.supplierContactName}
                onChange={(event) =>
                  setField("supplierContactName", event.target.value)
                }
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="detail-supplier-email">Email</Label>
              <Input
                id="detail-supplier-email"
                type="email"
                value={form.supplierEmail}
                onChange={(event) => setField("supplierEmail", event.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="detail-supplier-country">Country</Label>
              <Input
                id="detail-supplier-country"
                value={form.supplierCountry}
                onChange={(event) =>
                  setField("supplierCountry", event.target.value)
                }
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="detail-supplier-sku">Supplier SKU</Label>
              <Input
                id="detail-supplier-sku"
                value={form.supplierSku}
                onChange={(event) => setField("supplierSku", event.target.value)}
                disabled={disabled}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Identification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="detail-product-name">Product Name *</Label>
            <Input
              id="detail-product-name"
              value={form.productName}
              onChange={(event) => setField("productName", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-gtin">GTIN</Label>
            <Input
              id="detail-gtin"
              value={form.gtin}
              onChange={(event) => setField("gtin", event.target.value)}
              disabled={disabled}
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
            <Label htmlFor="detail-material-family">Material Family</Label>
            <Input
              id="detail-material-family"
              value={form.knownMaterialFamily}
              onChange={(event) =>
                setField("knownMaterialFamily", event.target.value)
              }
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-material-composition">
              Material Composition
            </Label>
            <Input
              id="detail-material-composition"
              value={form.knownMaterialComposition}
              onChange={(event) =>
                setField("knownMaterialComposition", event.target.value)
              }
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-weight">Net Weight (g)</Label>
            <Input
              id="detail-weight"
              type="number"
              min="0"
              step="any"
              value={form.knownWeightGrams}
              onChange={(event) => setField("knownWeightGrams", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-dimensions">Dimensions</Label>
            <Input
              id="detail-dimensions"
              value={form.knownDimensions}
              onChange={(event) => setField("knownDimensions", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-thickness">Thickness (mm)</Label>
            <Input
              id="detail-thickness"
              type="number"
              min="0"
              step="any"
              value={form.knownThicknessMm}
              onChange={(event) => setField("knownThicknessMm", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-packaging-function">
              Packaging Function Type
            </Label>
            <Input
              id="detail-packaging-function"
              value={form.knownPackagingFunction}
              onChange={(event) =>
                setField("knownPackagingFunction", event.target.value)
              }
              disabled={disabled}
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
            <Label htmlFor="detail-recycled-content">
              Total Recycled Content %
            </Label>
            <Input
              id="detail-recycled-content"
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.totalRecycledContentPercent}
              onChange={(event) =>
                setField("totalRecycledContentPercent", event.target.value)
              }
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-pcr">PCR Yield %</Label>
            <Input
              id="detail-pcr"
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.pcrYieldPercent}
              onChange={(event) => setField("pcrYieldPercent", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-pre-consumer">Pre-Consumer Yield %</Label>
            <Input
              id="detail-pre-consumer"
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.preConsumerYieldPercent}
              onChange={(event) =>
                setField("preConsumerYieldPercent", event.target.value)
              }
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-dfr">DfR Grade</Label>
            <Input
              id="detail-dfr"
              value={form.dfrGrade}
              onChange={(event) => setField("dfrGrade", event.target.value)}
              disabled={disabled}
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
            <Label htmlFor="detail-heavy-metal">
              Heavy Metal PPM Concentration
            </Label>
            <Input
              id="detail-heavy-metal"
              type="number"
              min="0"
              step="any"
              value={form.heavyMetalPpm}
              onChange={(event) => setField("heavyMetalPpm", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-pfas-status">
              Intentionally Added PFAS — Declaration Status
            </Label>
            <Select
              id="detail-pfas-status"
              value={form.pfasStatus}
              onChange={(event) =>
                setField("pfasStatus", event.target.value as FieldStatus)
              }
              disabled={disabled}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="detail-reach">REACH SVHC Declaration Status</Label>
            <Select
              id="detail-reach"
              value={form.reachSvhcStatus}
              onChange={(event) =>
                setField("reachSvhcStatus", event.target.value as FieldStatus)
              }
              disabled={disabled}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="detail-scip">ECHA SCIP Registration Code</Label>
            <Input
              id="detail-scip"
              value={form.scipCode}
              onChange={(event) => setField("scipCode", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="detail-rohs">RoHS Directive Compliance Status</Label>
            <Select
              id="detail-rohs"
              value={form.rohsStatus}
              onChange={(event) =>
                setField("rohsStatus", event.target.value as FieldStatus)
              }
              disabled={disabled}
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
            <Label htmlFor="detail-fcm">
              Food Contact Material (FCM) Approval Status
            </Label>
            <Select
              id="detail-fcm"
              value={form.fcmStatus}
              onChange={(event) =>
                setField("fcmStatus", event.target.value as FieldStatus)
              }
              disabled={disabled}
            >
              {FIELD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="detail-oml">
              Overall Migration Limit (OML) Test Score
            </Label>
            <Input
              id="detail-oml"
              value={form.omlTestScore}
              onChange={(event) => setField("omlTestScore", event.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="detail-sterilization">
              Sterilization Method Compatibility Profile
            </Label>
            <Textarea
              id="detail-sterilization"
              rows={3}
              value={form.sterilizationProfile}
              onChange={(event) =>
                setField("sterilizationProfile", event.target.value)
              }
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {evidenceNames.length === 0 ? (
            <p className="text-sm text-slate-500">No evidence on file.</p>
          ) : (
            <ul className="space-y-2">
              {evidenceNames.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-2"
                >
                  <p className="text-sm text-slate-900">{name}</p>
                  {isEditable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidence(name)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isEditable && (
            <>
              <p className="text-sm text-slate-500">
                File upload is mocked for this prototype — selecting a
                file only captures its filename, nothing is actually
                uploaded.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="detail-evidence-file"
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
            </>
          )}
        </CardContent>
      </Card>

      {isEditable && (
        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
