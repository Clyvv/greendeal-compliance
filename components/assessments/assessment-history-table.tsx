import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import {
  OVERALL_RESULT_LABELS,
  OVERALL_RESULT_TO_PILL,
} from "@/lib/assessment-findings";
import type { ComplianceAssessment } from "@/lib/types";

export interface AssessmentHistoryRow {
  assessment: ComplianceAssessment;
  /** Only needed when showPackagingItemColumn is true (the global
   * Assessments list, which spans every packaging item). */
  packagingItemName?: string;
}

/**
 * Every assessment ever run — for one packaging item (Packaging Item
 * Details page) or across all of them (the Manufacturer nav's
 * Assessments list). Supports 0..n correctly: running an assessment
 * again always appends a new row here, never replaces the previous
 * one (see mockAssessmentService.runAssessment).
 */
export function AssessmentHistoryTable({
  rows,
  showPackagingItemColumn = false,
  emptyStateDescription = "Assessments will appear here once run.",
}: {
  rows: AssessmentHistoryRow[];
  showPackagingItemColumn?: boolean;
  emptyStateDescription?: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No assessments yet"
        description={emptyStateDescription}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assessment ID</TableHead>
          {showPackagingItemColumn && <TableHead>Packaging Item</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Overall Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ assessment, packagingItemName }) => (
          <TableRow key={assessment.id}>
            <TableCell className="font-medium text-slate-900">
              {assessment.id}
            </TableCell>
            {showPackagingItemColumn && (
              <TableCell>{packagingItemName ?? "—"}</TableCell>
            )}
            <TableCell>{formatDateTime(assessment.createdAt)}</TableCell>
            <TableCell>
              <StatusPill
                status={OVERALL_RESULT_TO_PILL[assessment.overallResult]}
                label={OVERALL_RESULT_LABELS[assessment.overallResult]}
              />
            </TableCell>
            <TableCell>
              <Link
                href={`/manufacturer/assessments/${assessment.id}`}
                className="font-medium text-emerald-700 hover:underline"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
