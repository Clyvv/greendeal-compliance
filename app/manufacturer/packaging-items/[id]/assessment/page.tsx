import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackagingItem } from "@/lib/services/mockPackagingService";
import { Card, CardContent } from "@/components/ui/card";

// Stage 6 corrective scope: this route is an honest placeholder only —
// "Run PPWR Assessment" on the Readiness panel needs somewhere to go
// now, but the actual assessment simulation/results are Stage 7's
// concern (Do not build here). Nothing here should be build-time
// cached, matching the packaging item details page it links from.
export const dynamic = "force-dynamic";

export default async function PackagingItemAssessmentPlaceholderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPackagingItem(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/manufacturer/packaging-items/${item.id}`}
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to {item.name}
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          PPWR Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-500">{item.name}</p>
      </div>

      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm font-medium text-slate-900">
            Assessment coming in the next stage
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {item.name}&rsquo;s packaging data is fully authorized and ready.
            Running the calculation, provenance breakdown, and generating a
            conformance document is built in Stage 7 — this page will
            become the real assessment result once that stage lands.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
