"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs } from "@/components/ui/tabs";
import { CopyLinkRow } from "@/components/public-request/copy-link-row";
import { formatDate } from "@/lib/utils";
import { IdentificationSection } from "./detail-sections/identification-section";
import { PhysicalSection } from "./detail-sections/physical-section";
import { CircularitySection } from "./detail-sections/circularity-section";
import { ChemicalSafetySection } from "./detail-sections/chemical-safety-section";
import { SpecializedDomainSection } from "./detail-sections/specialized-domain-section";
import { EvidenceSection } from "./detail-sections/evidence-section";
import { VersionHistorySection } from "./detail-sections/version-history-section";
import type { Evidence, ProductVersion, SupplierProduct } from "@/lib/types";

export function ProductDetailsView({
  product,
  currentVersion,
  versions,
  evidenceItems,
  supplierName,
  supplierSlug,
}: {
  product: SupplierProduct;
  currentVersion: ProductVersion | undefined;
  versions: ProductVersion[];
  evidenceItems: Evidence[];
  supplierName?: string;
  /** Stage 7.4 — only used to build this product's Public Request Link
   * below; undefined suppliers (shouldn't happen for a seeded supplier,
   * but the type is optional — see lib/types/organization.ts) simply
   * don't get the section rendered. */
  supplierSlug?: string;
}) {
  return (
    <div className="space-y-6">
      <Link
        href="/supplier/products"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to Products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            SKU {product.sku}
            {product.gtin ? ` · GTIN ${product.gtin}` : ""}
            {product.countryOfOrigin ? ` · ${product.countryOfOrigin}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <HeaderStat label="Status">
            <StatusPill
              status={product.status === "PUBLISHED" ? "complete" : "pending"}
              label={product.status === "PUBLISHED" ? "Published" : "Draft"}
            />
          </HeaderStat>
          <HeaderStat label="Version">
            {currentVersion ? `Version ${currentVersion.versionLabel}` : "—"}
          </HeaderStat>
          <HeaderStat label="Data Completeness">
            {product.completenessPercent}%
          </HeaderStat>
          <HeaderStat label="Last Updated">
            {formatDate(product.lastUpdated)}
          </HeaderStat>
        </div>
      </div>

      {/* Stage 7.4 — public request link for this specific product
          (original requirements doc: product-level link alongside the
          supplier-level one on /supplier/request-links). Only shown
          once the product is actually PUBLISHED — a link to a DRAFT
          product would 404 on the public side (mockPublicRequestService
          only ever resolves PUBLISHED products), and would be
          confusing to hand out before then anyway. */}
      {product.status === "PUBLISHED" && supplierSlug && (
        <Card>
          <CardContent className="space-y-2 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Public Request Link
              </p>
              <p className="text-xs text-slate-500">
                Share this link so a customer can request compliance
                information for this product directly, without needing
                a Greendeal account.
              </p>
            </div>
            <CopyLinkRow
              path={`/request/${supplierSlug}/${product.id}`}
              copyLabel="Copy Product Link"
            />
          </CardContent>
        </Card>
      )}

      <Tabs
        tabs={[
          {
            id: "identification",
            label: "Identification",
            content: (
              <IdentificationSection
                product={product}
                supplierName={supplierName}
              />
            ),
          },
          {
            id: "physical",
            label: "Physical Properties",
            content: (
              <PhysicalSection
                version={currentVersion}
                supplierName={supplierName}
              />
            ),
          },
          {
            id: "circularity",
            label: "Circularity & PPWR",
            content: (
              <CircularitySection
                version={currentVersion}
                supplierName={supplierName}
              />
            ),
          },
          {
            id: "chemical-safety",
            label: "Chemical Safety",
            content: (
              <ChemicalSafetySection
                version={currentVersion}
                supplierName={supplierName}
              />
            ),
          },
          {
            id: "specialized-domain",
            label: "Specialized Domain",
            content: (
              <SpecializedDomainSection
                version={currentVersion}
                supplierName={supplierName}
              />
            ),
          },
          {
            id: "evidence",
            label: "Evidence",
            badge: evidenceItems.length,
            content: (
              <EvidenceSection
                evidenceItems={evidenceItems}
                supplierName={supplierName}
              />
            ),
          },
          {
            id: "version-history",
            label: "Version History",
            badge: versions.length,
            content: <VersionHistorySection versions={versions} />,
          },
        ]}
      />
    </div>
  );
}

function HeaderStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-slate-900">
        {children}
      </div>
    </div>
  );
}
