"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { ProvenanceBadge } from "@/components/provenance/provenance-badge";
import { RequestOriginBadge } from "@/components/requests/request-origin-badge";
import { RequestResultNotification } from "@/components/requests/request-result-notification";
import { useToast } from "@/components/providers/toast-provider";
import {
  approveDataRequestAction,
  rejectDataRequestAction,
} from "@/lib/requests/actions";
import { formatDate } from "@/lib/utils";
import { buildSupplierApprovedProvenance } from "@/lib/provenance";
import type { CoverageStatus } from "@/lib/services/mockRequestService";
import type { DataRequest, DataRequestStatus, RequestOrigin } from "@/lib/types";
import type { GroupedRequestedAttributes } from "@/lib/requests/fields";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export interface DataRequestApprovalFlowProps {
  request: DataRequest;
  /** Stage 7.6 — GREENDEAL vs PUBLIC_REQUEST_LINK (already resolved by
   * the page via lib/requests/origin.ts's getEffectiveOrigin, so this
   * component never has to guess a default for legacy seed data). */
  origin: RequestOrigin;
  requestingOrgName: string;
  supplierProductName: string;
  /** Undefined when request.packagingItemId itself is unset — a
   * PUBLIC_REQUEST_LINK request genuinely has no Greendeal packaging
   * item (Stage 7.5). Rendered conditionally, never defaulted to a
   * placeholder string, so it's not confused with a lookup failure. */
  packagingItemName?: string;
  /** The current org's own name — used only for the post-approval
   * provenance badge (DOMAIN.md §8a): this supplier is the source of
   * the data it just approved sharing. */
  supplierOrgName: string;
  groupedRequested: GroupedRequestedAttributes[];
  /** Only set when request.status === "APPROVED" (see the page loader). */
  approvedAttributes?: string[];
  /** Stage 7.6 — original requirements doc §8: per-field "already on
   * file" comparison from mockRequestService.getRequestCoverage,
   * keyed by the same attribute strings as requestedAttributes. */
  coverage?: Record<string, CoverageStatus>;
}

export function DataRequestApprovalFlow({
  request,
  origin,
  requestingOrgName,
  supplierProductName,
  packagingItemName,
  supplierOrgName,
  groupedRequested,
  approvedAttributes,
  coverage,
}: DataRequestApprovalFlowProps) {
  const [status, setStatus] = useState<DataRequestStatus>(request.status);
  const [resolvedApprovedAttributes, setResolvedApprovedAttributes] =
    useState<string[] | undefined>(approvedAttributes);
  // Stage 7.12 — flips true exactly once, right when THIS session's
  // Approve click succeeds (handleApprove below), never on a page
  // load for a request that was already approved earlier — that's
  // what tells RequestResultNotification to auto-open its dialog
  // rather than silently generating a link nobody asked to see yet.
  const [justApproved, setJustApproved] = useState(false);
  // Default state: everything requested starts checked — the supplier
  // is reviewing what to grant starting from "grant what was asked",
  // not starting blank (this stage's prompt). Every checkbox stays
  // individually toggleable.
  const [checkedAttributes, setCheckedAttributes] = useState<Set<string>>(
    () => new Set(request.requestedAttributes)
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const totalRequestedCount = request.requestedAttributes.length;
  const totalCheckedCount = checkedAttributes.size;

  // Original requirements doc §9 — the live "will share / will NOT
  // share" breakdown, derived directly from checkedAttributes so it
  // updates the instant a checkbox is toggled, never a separate static
  // screen. Preserves request.requestedAttributes's own order rather
  // than groupedRequested's section grouping — the spec's example is a
  // flat list, not grouped.
  const sharedAttributes = useMemo(
    () => request.requestedAttributes.filter((attribute) => checkedAttributes.has(attribute)),
    [request.requestedAttributes, checkedAttributes]
  );
  const notSharedAttributes = useMemo(
    () => request.requestedAttributes.filter((attribute) => !checkedAttributes.has(attribute)),
    [request.requestedAttributes, checkedAttributes]
  );

  function toggleAttribute(attribute: string) {
    setCheckedAttributes((prev) => {
      const next = new Set(prev);
      if (next.has(attribute)) next.delete(attribute);
      else next.add(attribute);
      return next;
    });
  }

  function handleApprove() {
    startTransition(async () => {
      try {
        const approval = await approveDataRequestAction(
          request.id,
          Array.from(checkedAttributes)
        );
        setStatus("APPROVED");
        setResolvedApprovedAttributes(approval.approvedAttributes);
        // Stage 7.12 — only a PUBLIC_REQUEST_LINK-origin requester
        // needs a result link at all (see AGENTS.md's "Request Result
        // Link" section); a GREENDEAL-origin one already has a
        // working in-app view (Stage 5b), so this never fires for
        // that origin.
        if (origin === "PUBLIC_REQUEST_LINK") {
          setJustApproved(true);
        }
        toast({
          title: "Request approved",
          description: `Selected data for ${supplierProductName} is now available to ${requestingOrgName}.`,
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Couldn't approve request",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectDataRequestAction(request.id);
        setStatus("REJECTED");
        toast({
          title: "Request rejected",
          description: `${requestingOrgName}'s request for ${supplierProductName} was rejected. No data was shared.`,
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Couldn't reject request",
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
          href="/supplier/data-requests"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to Data Requests
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">
            Data Request
          </h1>
          <RequestOriginBadge request={{ origin }} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Requested {formatDate(request.requestDate)}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-4">
          <dl
            className={`grid grid-cols-1 gap-4 ${
              packagingItemName ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Requested by
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {requestingOrgName}
              </dd>
            </div>
            {/* Only rendered when request.packagingItemId is actually
                set — a PUBLIC_REQUEST_LINK request has none (Stage
                7.5), so this is omitted entirely rather than showing a
                misleading "Unknown packaging item" placeholder. */}
            {packagingItemName && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Packaging item
                </dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {packagingItemName}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Product
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {supplierProductName}
              </dd>
            </div>
          </dl>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Purpose
            </dt>
            <dd className="mt-0.5 text-sm text-slate-900">
              {request.purpose}
            </dd>
          </div>
        </CardContent>
      </Card>

      {/* Stage 7.6 — requester contact details, only present for a
          PUBLIC_REQUEST_LINK request (DOMAIN.md §8a). GREENDEAL
          requests keep showing just the resolved Organization name
          above, unchanged from Stage 5. */}
      {request.requester && (
        <Card>
          <CardHeader>
            <CardTitle>Requester Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Contact Name
                </dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {request.requester.contactName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {request.requester.email}
                </dd>
              </div>
              {request.requester.country && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Country
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {request.requester.country}
                  </dd>
                </div>
              )}
              {request.requester.referenceNumber && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Their Reference
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {request.requester.referenceNumber}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {status === "APPROVED" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ Approved — Selected product data is now available to{" "}
            {requestingOrgName}.
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            {supplierProductName} remains owned and maintained by your
            organization. {requestingOrgName} receives authorized access to
            the approved fields only — not a copy or transfer of ownership.
          </p>
          <div className="mt-2">
            <ProvenanceBadge
              provenance={buildSupplierApprovedProvenance(supplierOrgName)}
            />
          </div>
          {/* Stage 7.12 — only for a PUBLIC_REQUEST_LINK-origin
              request (AGENTS.md's "Request Result Link" section): the
              requester has no Greendeal account, so this is their only
              way to actually retrieve what was just approved. Auto-
              opens once right after approval (justApproved); the
              button itself stays available afterward too, so the
              supplier isn't stuck if they close the dialog first. */}
          {origin === "PUBLIC_REQUEST_LINK" && (
            <div className="mt-3">
              <RequestResultNotification
                requestId={request.id}
                autoTrigger={justApproved}
              />
            </div>
          )}
        </div>
      )}

      {status === "REJECTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            ✕ Rejected — no data was shared with {requestingOrgName}.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Requested Data</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Stage 7.6 — original requirements doc §8: a quick
                "how much of this do I already have" summary, same
                Badge pattern as the existing approved-count badge
                below (not a new visual style). */}
            {status === "PENDING" && coverage && (
              <Badge tone="neutral">
                {Object.values(coverage).filter((value) => value === "AVAILABLE").length}{" "}
                of {totalRequestedCount} on file
              </Badge>
            )}
            {status === "PENDING" && (
              <Badge tone="neutral">
                {totalCheckedCount} of {totalRequestedCount} approved
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {groupedRequested.map((group) => (
            <div key={group.key}>
              <p className="text-sm font-semibold text-slate-900">
                {group.title}
              </p>
              {status === "PENDING" ? (
                <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {group.attributes.map((attribute) => (
                    <label
                      key={attribute}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <Checkbox
                        checked={checkedAttributes.has(attribute)}
                        onChange={() => toggleAttribute(attribute)}
                        disabled={isPending}
                      />
                      <span className="flex-1">{attribute}</span>
                      {/* Stage 7.6 — visible alongside the approve
                          checkbox, not blocking it: a MISSING field
                          can still be checked/approved for sharing
                          (this only surfaces that the supplier
                          doesn't currently have it on file — see
                          mockRequestService.getRequestCoverage). */}
                      {coverage?.[attribute] && (
                        <StatusPill
                          status={
                            coverage[attribute] === "AVAILABLE"
                              ? "complete"
                              : "missing"
                          }
                          label={
                            coverage[attribute] === "AVAILABLE"
                              ? "Available"
                              : "Missing"
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {group.attributes.map((attribute) => {
                    const isApproved =
                      resolvedApprovedAttributes?.includes(attribute) ??
                      false;
                    return (
                      <li key={attribute}>
                        <Badge tone={isApproved ? "success" : "neutral"}>
                          {isApproved ? "✓" : "🔒"} {attribute}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Original requirements doc §9 — the live "will share / will
          NOT share" breakdown, updating instantly as the checkboxes
          above are toggled (same checkedAttributes state, not a
          separate/parallel screen). Flat lists, not grouped by
          section, matching the spec's exact example format. */}
      {status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>Approve Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                The following information will be shared with{" "}
                {requestingOrgName}:
              </p>
              {sharedAttributes.length === 0 ? (
                <p className="mt-1.5 text-sm text-slate-500">
                  Nothing selected yet.
                </p>
              ) : (
                <ul className="mt-1.5 space-y-1">
                  {sharedAttributes.map((attribute) => (
                    <li
                      key={attribute}
                      className="text-sm text-emerald-700"
                    >
                      ✓ {attribute}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                The following requested information will NOT be shared:
              </p>
              {notSharedAttributes.length === 0 ? (
                <p className="mt-1.5 text-sm text-slate-500">
                  Everything requested is being shared.
                </p>
              ) : (
                <ul className="mt-1.5 space-y-1">
                  {notSharedAttributes.map((attribute) => (
                    <li key={attribute} className="text-sm text-slate-500">
                      — {attribute}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="destructive"
              type="button"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Working…" : "Reject"}
            </Button>
            <div className="text-right">
              <Button
                type="button"
                onClick={handleApprove}
                disabled={isPending || totalCheckedCount === 0}
              >
                {isPending ? "Approving…" : "Approve & Share"}
              </Button>
              {totalCheckedCount === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Check at least one field to approve, or use Reject to
                  decline the whole request.
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
