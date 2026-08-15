"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getEnteredFieldLabels } from "@/lib/wizard/mapping";
import type {
  EvidenceDraft,
  ProductWizardFormState,
  WizardFieldSetter,
} from "@/lib/wizard/types";

type DraftEntry = Omit<EvidenceDraft, "id">;

const EMPTY_ENTRY: DraftEntry = {
  documentName: "",
  evidenceType: "",
  issuingAuthority: "",
  issueDate: "",
  expirationDate: "",
  supportedAttributes: [],
};

function generateLocalId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `evidence-${Date.now()}-${Math.random()}`;
}

export function Step6Evidence({
  form,
  onFieldChange,
}: {
  form: ProductWizardFormState;
  onFieldChange: WizardFieldSetter;
}) {
  const [entry, setEntry] = useState<DraftEntry>(EMPTY_ENTRY);
  const enteredFieldLabels = getEnteredFieldLabels(form);
  const canAdd =
    entry.documentName.trim().length > 0 &&
    entry.evidenceType.trim().length > 0;

  function toggleAttribute(label: string) {
    setEntry((prev) => ({
      ...prev,
      supportedAttributes: prev.supportedAttributes.includes(label)
        ? prev.supportedAttributes.filter((item) => item !== label)
        : [...prev.supportedAttributes, label],
    }));
  }

  function handleAdd() {
    if (!canAdd) return;
    const newItem: EvidenceDraft = { id: generateLocalId(), ...entry };
    onFieldChange("evidenceDrafts", [...form.evidenceDrafts, newItem]);
    setEntry(EMPTY_ENTRY);
  }

  function handleRemove(id: string) {
    onFieldChange(
      "evidenceDrafts",
      form.evidenceDrafts.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Evidence &amp; Governance
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Add one or more supporting documents. File upload is mocked for
          this prototype — selecting a file only captures its filename,
          nothing is actually uploaded.
        </p>
      </div>

      {form.evidenceDrafts.length > 0 && (
        <ul className="space-y-2">
          {form.evidenceDrafts.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-slate-200 p-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.documentName}
                </p>
                <p className="text-xs text-slate-500">
                  {item.evidenceType} · {item.issuingAuthority || "—"} ·
                  Issued {item.issueDate || "—"} · Expires{" "}
                  {item.expirationDate || "—"}
                </p>
                {item.supportedAttributes.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Supports: {item.supportedAttributes.join(", ")}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-slate-300 p-4">
        <p className="text-sm font-medium text-slate-900">Add Evidence</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="evidence-file">Attach file (mock)</Label>
            <input
              id="evidence-file"
              type="file"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setEntry((prev) => ({ ...prev, documentName: file.name }));
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="evidence-name">Document Name *</Label>
            <Input
              id="evidence-name"
              value={entry.documentName}
              onChange={(event) =>
                setEntry((prev) => ({
                  ...prev,
                  documentName: event.target.value,
                }))
              }
              placeholder="e.g. Recycled Content Certificate.pdf"
            />
          </div>
          <div>
            <Label htmlFor="evidence-type">Evidence Type *</Label>
            <Input
              id="evidence-type"
              value={entry.evidenceType}
              onChange={(event) =>
                setEntry((prev) => ({
                  ...prev,
                  evidenceType: event.target.value,
                }))
              }
              placeholder="e.g. Recycled Content"
            />
          </div>
          <div>
            <Label htmlFor="evidence-authority">
              Issuing Laboratory Authority Name
            </Label>
            <Input
              id="evidence-authority"
              value={entry.issuingAuthority}
              onChange={(event) =>
                setEntry((prev) => ({
                  ...prev,
                  issuingAuthority: event.target.value,
                }))
              }
              placeholder="e.g. TÜV Rheinland"
            />
          </div>
          <div>
            <Label htmlFor="evidence-issue-date">Document Issue Date</Label>
            <Input
              id="evidence-issue-date"
              type="date"
              value={entry.issueDate}
              onChange={(event) =>
                setEntry((prev) => ({ ...prev, issueDate: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="evidence-expiration-date">
              Data Validity Expiration Date
            </Label>
            <Input
              id="evidence-expiration-date"
              type="date"
              value={entry.expirationDate}
              onChange={(event) =>
                setEntry((prev) => ({
                  ...prev,
                  expirationDate: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Supports which fields already entered?</Label>
          {enteredFieldLabels.length === 0 ? (
            <p className="text-sm text-slate-500">
              Fill in fields in the previous steps to link evidence to
              them.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {enteredFieldLabels.map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <Checkbox
                    checked={entry.supportedAttributes.includes(label)}
                    onChange={() => toggleAttribute(label)}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            Add Evidence
          </Button>
          {!canAdd && (
            <p className="mt-1 text-xs text-slate-500">
              Enter a document name and evidence type to add it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
