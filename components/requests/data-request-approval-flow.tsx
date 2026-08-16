"use client";

import { useState, useTransition } from "react";
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
import { useToast } from "@/components/providers/toast-provider";
import {
  approveDataRequestAction,
  rejectDataRequestAction,
} from "@/lib/requests/actions";
import { formatDate } from "@/lib/utils";
import type { DataRequest, DataRequestStatus } from "@/lib/types";
import type { GroupedRequestedAttributes } from "@/lib/requests/fields";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export interface DataRequestApprovalFlowProps {
  request: DataRequest;
  requestingOrgName: string;
  supplierProductName: string;
  packagingItemName: string;
  groupedRequested: GroupedRequestedAttributes[];
  /** Only set when request.status === "APPROVED" (see the page loader). */
  approvedAttributes?: string[];
}

export function DataRequestApprovalFlow({
  request,
  requestingOrgName,
  supplierProductName,
  packagingItemName,
  groupedRequested,
  approvedAttributes,
}: DataRequestApprovalFlowProps) {
  const [status, setStatus] = useState<DataRequestStatus>(request.status);
  const [resolvedApprovedAttributes, setResolvedApprovedAttributes] =
    useState<string[] | undefined>(approvedAttributes);
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
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Data Request
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Requested {formatDate(request.requestDate)}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Requested by
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {requestingOrgName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Packaging item
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {packagingItemName}
              </dd>
            </div>
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

      {status === "PENDING" && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">
            This approval will allow {requestingOrgName} to access only the
            selected information below.
          </p>
        </div>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requested Data</CardTitle>
          {status === "PENDING" && (
            <Badge tone="neutral">
              {totalCheckedCount} of {totalRequestedCount} approved
            </Badge>
          )}
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
                      {attribute}
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
        {status === "PENDING" && (
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
                {isPending ? "Approving…" : `Approve (${totalCheckedCount})`}
              </Button>
              {totalCheckedCount === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Check at least one field to approve, or use Reject to
                  decline the whole request.
                </p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
