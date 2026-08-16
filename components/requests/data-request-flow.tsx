"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/providers/toast-provider";
import { REQUESTABLE_FIELD_SECTIONS } from "@/lib/requests/fields";
import { submitDataRequestAction } from "@/lib/requests/actions";
import type { Evidence } from "@/lib/types";

type Step = "SELECT" | "SUMMARY";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export interface DataRequestFlowProps {
  packagingItemId: string;
  packagingItemName: string;
  packagingComponentId: string;
  componentRole: string;
  supplierProductId: string;
  supplierProductName: string;
  supplierOrgId: string;
  supplierOrgName: string;
  versionLabel?: string;
  evidenceItems: Evidence[];
  defaultSelectedFields: string[];
  defaultSelectedEvidenceDocumentNames: string[];
}

export function DataRequestFlow({
  packagingItemId,
  packagingItemName,
  packagingComponentId,
  componentRole,
  supplierProductId,
  supplierProductName,
  supplierOrgId,
  supplierOrgName,
  versionLabel,
  evidenceItems,
  defaultSelectedFields,
  defaultSelectedEvidenceDocumentNames,
}: DataRequestFlowProps) {
  const [step, setStep] = useState<Step>("SELECT");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    () => new Set(defaultSelectedFields)
  );
  const [selectedEvidence, setSelectedEvidence] = useState<Set<string>>(
    () =>
      new Set(
        evidenceItems
          .map((item) => item.documentName)
          .filter((name) => defaultSelectedEvidenceDocumentNames.includes(name))
      )
  );
  const [purpose, setPurpose] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const totalSelectedCount = selectedFields.size + selectedEvidence.size;
  const canReview = purpose.trim().length > 0 && totalSelectedCount > 0;

  function toggleField(field: string) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function toggleEvidence(documentName: string) {
    setSelectedEvidence((prev) => {
      const next = new Set(prev);
      if (next.has(documentName)) next.delete(documentName);
      else next.add(documentName);
      return next;
    });
  }

  // What the Request Summary screen shows and what actually gets
  // submitted — grouped by section, only the checked items, exactly
  // per AGENTS.md's provenance principle (never "everything").
  const selectedBySection = useMemo(() => {
    return REQUESTABLE_FIELD_SECTIONS.map((section) => ({
      ...section,
      selected: section.fields.filter((field) => selectedFields.has(field)),
    })).filter((section) => section.selected.length > 0);
  }, [selectedFields]);

  const selectedEvidenceNames = useMemo(
    () => evidenceItems.map((item) => item.documentName).filter((name) => selectedEvidence.has(name)),
    [evidenceItems, selectedEvidence]
  );

  const requestedAttributes = useMemo(
    () => [...selectedFields, ...selectedEvidenceNames],
    [selectedFields, selectedEvidenceNames]
  );

  function handleSubmit() {
    startTransition(async () => {
      try {
        await submitDataRequestAction({
          packagingItemId,
          packagingComponentId,
          supplierProductId,
          supplierOrgId,
          requestedAttributes,
          purpose,
        });
        toast({
          title: "Data request sent",
          description: `Request sent to ${supplierOrgName} for ${supplierProductName}.`,
          variant: "success",
        });
        router.push(`/manufacturer/packaging-items/${packagingItemId}`);
      } catch (error) {
        toast({
          title: "Couldn't send data request",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/manufacturer/packaging-items/${packagingItemId}`}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to {packagingItemName}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Request Data
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {componentRole}: {supplierProductName}
          {versionLabel ? ` v${versionLabel}` : ""} · {supplierOrgName}
        </p>
      </div>

      {step === "SELECT" ? (
        <SelectFieldsStep
          purpose={purpose}
          onPurposeChange={setPurpose}
          selectedFields={selectedFields}
          onToggleField={toggleField}
          evidenceItems={evidenceItems}
          selectedEvidence={selectedEvidence}
          onToggleEvidence={toggleEvidence}
          canReview={canReview}
          packagingItemId={packagingItemId}
          onReview={() => setStep("SUMMARY")}
        />
      ) : (
        <SummaryStep
          purpose={purpose}
          supplierOrgName={supplierOrgName}
          supplierProductName={supplierProductName}
          selectedBySection={selectedBySection}
          selectedEvidenceNames={selectedEvidenceNames}
          isPending={isPending}
          onBack={() => setStep("SELECT")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function SelectFieldsStep({
  purpose,
  onPurposeChange,
  selectedFields,
  onToggleField,
  evidenceItems,
  selectedEvidence,
  onToggleEvidence,
  canReview,
  packagingItemId,
  onReview,
}: {
  purpose: string;
  onPurposeChange: (value: string) => void;
  selectedFields: Set<string>;
  onToggleField: (field: string) => void;
  evidenceItems: Evidence[];
  selectedEvidence: Set<string>;
  onToggleEvidence: (documentName: string) => void;
  canReview: boolean;
  packagingItemId: string;
  onReview: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="request-purpose">
            Why is this data being requested? *
          </Label>
          <Textarea
            id="request-purpose"
            rows={2}
            value={purpose}
            onChange={(event) => onPurposeChange(event.target.value)}
            placeholder="e.g. PPWR assessment for Coca-Cola 500ml"
          />
        </CardContent>
      </Card>

      {REQUESTABLE_FIELD_SECTIONS.map((section) => (
        <Card key={section.key}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{section.title}</CardTitle>
            <Badge tone="neutral">
              {section.fields.filter((field) => selectedFields.has(field)).length}{" "}
              of {section.fields.length} selected
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {section.fields.map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <Checkbox
                    checked={selectedFields.has(field)}
                    onChange={() => onToggleField(field)}
                  />
                  {field}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evidence</CardTitle>
          <Badge tone="neutral">
            {selectedEvidence.size} of {evidenceItems.length} selected
          </Badge>
        </CardHeader>
        <CardContent>
          {evidenceItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              No evidence documents are on file for this product yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {evidenceItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <Checkbox
                    checked={selectedEvidence.has(item.documentName)}
                    onChange={() => onToggleEvidence(item.documentName)}
                  />
                  {item.documentName}
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/manufacturer/packaging-items/${packagingItemId}`}>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <div className="text-right">
            <Button type="button" onClick={onReview} disabled={!canReview}>
              Review Request
            </Button>
            {!canReview && (
              <p className="mt-1 text-xs text-slate-500">
                Enter a purpose and select at least one field to continue.
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function SummaryStep({
  purpose,
  supplierOrgName,
  supplierProductName,
  selectedBySection,
  selectedEvidenceNames,
  isPending,
  onBack,
  onSubmit,
}: {
  purpose: string;
  supplierOrgName: string;
  supplierProductName: string;
  selectedBySection: { key: string; title: string; selected: string[] }[];
  selectedEvidenceNames: string[];
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Sending to
          </p>
          <p className="mt-0.5 text-sm text-slate-900">
            {supplierOrgName} — {supplierProductName}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Purpose
          </p>
          <p className="mt-0.5 text-sm text-slate-900">{purpose}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Requested fields
          </p>
          {selectedBySection.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">None selected.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {selectedBySection.map((section) => (
                <div key={section.key}>
                  <p className="text-sm font-semibold text-slate-900">
                    {section.title}
                  </p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {section.selected.map((field) => (
                      <li key={field}>
                        <Badge tone="success">{field}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Requested evidence
          </p>
          {selectedEvidenceNames.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">None selected.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {selectedEvidenceNames.map((name) => (
                <li key={name}>
                  <Badge tone="success">{name}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          type="button"
          onClick={onBack}
          disabled={isPending}
        >
          Back to Edit Selection
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? "Sending…" : "Confirm & Send Request"}
        </Button>
      </CardFooter>
    </Card>
  );
}
