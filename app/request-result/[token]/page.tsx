import { notFound } from "next/navigation";
import { getRequestResult } from "@/lib/services/mockRequestService";
import { groupRequestedAttributesBySection, EVIDENCE_GROUP_KEY } from "@/lib/requests/fields";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceDownloadButton } from "@/components/request-result/evidence-download-button";

export const dynamic = "force-dynamic";

export default async function RequestResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Unknown/never-generated token (or one whose request somehow isn't
  // a currently-APPROVED PUBLIC_REQUEST_LINK request — see
  // getRequestResult's own re-check) 404s the same way an unknown
  // Public Request Link slug or Supplier Response token does — never
  // leaks whether a token ever existed.
  const data = await getRequestResult(token);
  if (!data) notFound();

  // EVIDENCE_GROUP_KEY is rendered separately below with real Evidence
  // records (document type, issuing authority, a Download action) —
  // not repeated here as a bare field-label badge.
  const groupedApproved = groupRequestedAttributesBySection(
    data.approvedAttributes
  ).filter((group) => group.key !== EVIDENCE_GROUP_KEY);

  const nothingApproved =
    groupedApproved.length === 0 && data.approvedEvidence.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Your Requested Information
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          <strong>{data.supplierName}</strong> approved your request for{" "}
          <strong>{data.productName}</strong>.
        </p>
      </div>

      <Card>
        <CardContent className="py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Purpose
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">{data.purpose}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Reference
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">{data.requestId}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* AGENTS.md — "a read-only snapshot at approval time, not a
          live view": a later re-approval or data change never
          retroactively updates what this page shows. */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm text-slate-600">
          This information reflects what was approved on{" "}
          {formatDate(data.resultGeneratedAt)}.
        </p>
      </div>

      {nothingApproved ? (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">
              No information was approved for sharing on this request.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {groupedApproved.map((group) => (
            <Card key={group.key}>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-wrap gap-1.5">
                  {group.attributes.map((attribute) => (
                    <li key={attribute}>
                      <Badge tone="success">✓ {attribute}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {data.approvedEvidence.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No evidence documents were approved for this request.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.approvedEvidence.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.documentName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.evidenceType}
                          {item.issuingAuthority ? ` · ${item.issuingAuthority}` : ""}
                        </p>
                      </div>
                      <EvidenceDownloadButton documentName={item.documentName} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
