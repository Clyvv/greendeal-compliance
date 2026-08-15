"use client";

import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  compareProductVersions,
  sortVersionsAscending,
} from "@/lib/product-version-diff";
import type { ProductVersion } from "@/lib/types";

export function VersionHistorySection({
  versions,
}: {
  versions: ProductVersion[];
}) {
  const sortedAscending = sortVersionsAscending(versions);
  const sortedDescending = [...sortedAscending].reverse();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    sortedDescending[0]?.id
  );

  if (sortedDescending.length === 0) {
    return (
      <EmptyState
        title="No versions yet"
        description="Product versions will appear here once created."
      />
    );
  }

  const selectedIndex = sortedAscending.findIndex((v) => v.id === selectedId);
  const selected = sortedAscending[selectedIndex];
  const previous =
    selectedIndex > 0 ? sortedAscending[selectedIndex - 1] : undefined;
  const diffs = selected ? compareProductVersions(previous, selected) : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
      <ul className="space-y-2">
        {sortedDescending.map((version) => {
          const isSelected = version.id === selectedId;
          return (
            <li key={version.id}>
              <button
                type="button"
                onClick={() => setSelectedId(version.id)}
                aria-pressed={isSelected}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <p className="font-medium">Version {version.versionLabel}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(version.createdAt)}
                </p>
                {version.changeSummary && (
                  <p className="mt-1 text-xs text-slate-500">
                    {version.changeSummary}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        {!selected ? null : !previous ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Version {selected.versionLabel} is the initial version — there
            is no prior version to compare it against.
          </div>
        ) : diffs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            No compliance-data differences between Version{" "}
            {previous.versionLabel} and Version {selected.versionLabel}.
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-900">
              Changes from Version {previous.versionLabel} → Version{" "}
              {selected.versionLabel}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>Current</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffs.map((diff) => (
                  <TableRow key={`${diff.section}-${diff.label}`}>
                    <TableCell className="text-slate-500">
                      {diff.section}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {diff.label}
                    </TableCell>
                    <TableCell>{diff.previousValue}</TableCell>
                    <TableCell className="font-medium text-emerald-700">
                      {diff.currentValue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
