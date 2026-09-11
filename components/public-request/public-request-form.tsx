"use client";

import { useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/providers/toast-provider";
// Reused, not duplicated a third time — REQUESTABLE_FIELD_SECTIONS is
// already a shared constant (Stage 4 factored it into lib/requests/fields.ts,
// also reused by Stage 5's approval screen and Stage 6's readiness
// gate), not hardcoded inline in a manufacturer-only component, so
// there's nothing to extract here — just import it.
import {
  PUBLIC_REQUEST_EVIDENCE_LABEL,
  REQUESTABLE_FIELD_SECTIONS,
} from "@/lib/requests/fields";
import { submitPublicDataRequestAction } from "@/lib/public-request/actions";

// A single, generic "please also share supporting evidence" checkbox —
// deliberately NOT a per-document list like Stage 4's internal flow
// (which lists an authenticated manufacturer's actual Evidence records
// by name, e.g. "Recycled Content Certificate.pdf"). This is a public,
// unauthenticated page: mockPublicRequestService never exposes a
// product's real evidence document names (that's identity-adjacent
// metadata this stage's boundary deliberately keeps out of the public
// response), so this section can only ever be a general request, not a
// real checklist. It groups into the same "Evidence" bucket
// lib/requests/fields.ts's groupRequestedAttributesBySection already
// produces for any unrecognized attribute — no extra plumbing needed
// wherever a supplier eventually reviews this (Stage 7.6).
const EVIDENCE_REQUEST_LABEL = PUBLIC_REQUEST_EVIDENCE_LABEL;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

interface FormErrors {
  companyName?: string;
  contactName?: string;
  email?: string;
  purpose?: string;
  fields?: string;
}

export function PublicRequestForm({
  supplierSlug,
  supplierName,
  productId,
  productName,
}: {
  supplierSlug: string;
  supplierName: string;
  productId: string;
  productName: string;
}) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    () => new Set()
  );
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmation, setConfirmation] = useState<{
    requestId: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function toggleField(field: string) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!companyName.trim()) {
      nextErrors.companyName = "Company name is required.";
    }
    if (!contactName.trim()) {
      nextErrors.contactName = "Requester name is required.";
    }
    if (!email.trim()) {
      nextErrors.email = "Business email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!purpose.trim()) {
      nextErrors.purpose = "Purpose is required.";
    }
    if (selectedFields.size === 0) {
      nextErrors.fields = "Select at least one field to request.";
    }
    return nextErrors;
  }

  function handleSubmit() {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    startTransition(async () => {
      try {
        const result = await submitPublicDataRequestAction({
          supplierSlug,
          supplierProductId: productId,
          requestedAttributes: Array.from(selectedFields),
          purpose: purpose.trim(),
          requester: {
            companyName: companyName.trim(),
            contactName: contactName.trim(),
            email: email.trim(),
            country: country.trim() || undefined,
            referenceNumber: referenceNumber.trim() || undefined,
          },
        });
        setConfirmation({ requestId: result.requestId });
      } catch (error) {
        toast({
          title: "Couldn't submit request",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  if (confirmation) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="space-y-2 py-5">
          <p className="text-sm font-semibold text-emerald-900">
            ✓ Request Submitted
          </p>
          <p className="text-sm text-emerald-800">
            Your request has been sent to {supplierName}. The supplier
            will review your request before any information is shared.
          </p>
          <p className="text-xs font-medium text-emerald-700">
            Reference: {confirmation.requestId}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="requester-company">Company Name *</Label>
            <Input
              id="requester-company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              error={errors.companyName}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="requester-name">Requester Name *</Label>
            <Input
              id="requester-name"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              error={errors.contactName}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="requester-email">Business Email *</Label>
            <Input
              id="requester-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="requester-country">Country</Label>
            <Input
              id="requester-country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="requester-reference">Reference Number</Label>
            <Input
              id="requester-reference"
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              placeholder="Optional — your own internal reference"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Requested Information
        </p>

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
                      onChange={() => toggleField(field)}
                      disabled={isPending}
                    />
                    {field}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={selectedFields.has(EVIDENCE_REQUEST_LABEL)}
                onChange={() => toggleField(EVIDENCE_REQUEST_LABEL)}
                disabled={isPending}
              />
              {EVIDENCE_REQUEST_LABEL}
            </label>
          </CardContent>
        </Card>

        {errors.fields && (
          <p className="text-xs text-red-600">{errors.fields}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="request-purpose">
            Why do you need this information? *
          </Label>
          <Textarea
            id="request-purpose"
            rows={3}
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            error={errors.purpose}
            disabled={isPending}
            placeholder={`e.g. Packaging compliance assessment involving ${productName}`}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting…" : "Submit Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
