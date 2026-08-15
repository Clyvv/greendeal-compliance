import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductEvidence,
  getProductVersion,
  getSupplierProduct,
} from "@/lib/services/mockProductService";
import { formatDate } from "@/lib/utils";
import { FIELD_STATUS_LABELS } from "@/lib/field-status-labels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

// Always render fresh — products created via the wizard must show up
// immediately (see Stage 1b prompt), and this route has no
// generateStaticParams, so nothing here should be build-time cached.
export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getSupplierProduct(productId);
  if (!product) notFound();

  const version = await getProductVersion(product.currentVersionId);
  const evidenceItems = version ? await getProductEvidence(version.id) : [];

  return (
    <div className="space-y-6">
      <Link
        href="/supplier/products"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to Products
      </Link>

      <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        This is a placeholder Product Details view. The full experience
        (edit history, version comparisons, evidence management) arrives
        in Stage 2.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {product.name}
          </h1>
          <p className="text-sm text-slate-500">
            SKU {product.sku}
            {product.gtin ? ` · GTIN ${product.gtin}` : ""}
            {product.countryOfOrigin ? ` · ${product.countryOfOrigin}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill
            status={product.status === "PUBLISHED" ? "complete" : "pending"}
            label={product.status === "PUBLISHED" ? "Published" : "Draft"}
          />
          <span className="text-sm text-slate-500">
            {product.completenessPercent}% complete
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version {version?.versionLabel ?? "—"}</CardTitle>
          <CardDescription>
            Last updated {formatDate(product.lastUpdated)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {version && (
            <>
              <DetailSection
                title="Physical & Structural"
                rows={[
                  ["Material Family", version.physical.materialFamily],
                  [
                    "Specific Material Composition",
                    version.physical.specificMaterial,
                  ],
                  [
                    "Component Net Weight",
                    `${version.physical.netWeightGrams}g`,
                  ],
                  ["Dimensions", version.physical.dimensions],
                  ["Thickness", `${version.physical.thicknessMm}mm`],
                  [
                    "Packaging Function Type",
                    version.physical.packagingFunction,
                  ],
                ]}
              />
              <DetailSection
                title="Circularity & PPWR"
                rows={[
                  [
                    "Total Recycled Content %",
                    `${version.circularity.totalRecycledContentPercent}%`,
                  ],
                  [
                    "PCR Yield %",
                    `${version.circularity.pcrYieldPercent}%`,
                  ],
                  [
                    "Pre-Consumer Yield %",
                    `${version.circularity.preConsumerYieldPercent}%`,
                  ],
                  ["DfR Grade", version.circularity.dfrGrade],
                  [
                    "Reusability Status",
                    version.circularity.reusabilityStatus,
                  ],
                ]}
              />
              <DetailSection
                title="Chemical Safety"
                rows={[
                  [
                    "Heavy Metal PPM Concentration",
                    version.chemicalSafety.heavyMetalPpm?.toString() ?? "—",
                  ],
                  [
                    "Intentionally Added PFAS",
                    version.chemicalSafety.pfasIntentionallyAdded === null
                      ? "Unknown"
                      : version.chemicalSafety.pfasIntentionallyAdded
                        ? "Yes"
                        : "No",
                  ],
                  [
                    "PFAS Declaration Status",
                    FIELD_STATUS_LABELS[version.chemicalSafety.pfasStatus],
                  ],
                  [
                    "REACH SVHC Declaration Status",
                    FIELD_STATUS_LABELS[version.chemicalSafety.reachSvhcStatus],
                  ],
                  [
                    "ECHA SCIP Registration Code",
                    version.chemicalSafety.scipCode ?? "—",
                  ],
                  [
                    "RoHS Directive Compliance Status",
                    FIELD_STATUS_LABELS[version.chemicalSafety.rohsStatus],
                  ],
                ]}
              />
              <DetailSection
                title="Specialized Domain"
                rows={[
                  [
                    "FCM Approval Status",
                    FIELD_STATUS_LABELS[version.specializedDomain.fcmStatus],
                  ],
                  [
                    "OML Test Score",
                    version.specializedDomain.omlTestScore ?? "—",
                  ],
                  [
                    "Sterilization Method Compatibility Profile",
                    version.specializedDomain.sterilizationProfile ?? "—",
                  ],
                ]}
              />
            </>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Evidence ({evidenceItems.length})
            </h3>
            {evidenceItems.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                No evidence on file.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {evidenceItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-slate-200 p-3 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {item.documentName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.evidenceType} · {item.issuingAuthority} · Expires{" "}
                      {formatDate(item.expirationDate)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailSection({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm text-slate-900">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
