import type {
  ChemicalSafetyData,
  CircularityMetrics,
  Evidence,
  PhysicalProperties,
  ProductVersion,
  SpecializedDomainData,
  SupplierProduct,
} from "@/lib/types";
import { evidence, productVersions, supplierProducts } from "@/lib/mock-data";
import { MOCK_TODAY } from "@/lib/constants";

// Maps to: GET /api/v1/suppliers/{supplierId}/products
// TODO: derive supplierId from auth context once real auth exists.
export async function getSupplierProducts(
  supplierId: string
): Promise<SupplierProduct[]> {
  return supplierProducts.filter((product) => product.supplierId === supplierId);
}

// Maps to: GET /api/v1/products?status=PUBLISHED
// Cross-supplier lookup (Stage 7.3) for the manufacturer-side "Find
// Greendeal Supplier Product" step of the Add Component flow —
// getSupplierProducts above is scoped to one supplier's own product
// list (used on supplier-facing screens); this is the
// manufacturer-facing equivalent, filtered to PUBLISHED only. A
// manufacturer should never be able to select a supplier's unpublished
// DRAFT product it can't legitimately see compliance data for yet.
export async function getPublishedSupplierProducts(): Promise<SupplierProduct[]> {
  return supplierProducts.filter((product) => product.status === "PUBLISHED");
}

// Maps to: GET /api/v1/products/{productId}
// Accepts `undefined` (Stage 7.3) so callers resolving a
// PackagingComponent's optional supplierProductId (unset for
// ExternalSupplierProduct-backed components) don't need a ternary at
// every call site — always returns undefined rather than throwing.
export async function getSupplierProduct(
  productId: string | undefined
): Promise<SupplierProduct | undefined> {
  if (!productId) return undefined;
  return supplierProducts.find((product) => product.id === productId);
}

// Maps to: GET /api/v1/products/{productId}/versions
export async function getProductVersions(
  productId: string
): Promise<ProductVersion[]> {
  return productVersions.filter((version) => version.productId === productId);
}

// Maps to: GET /api/v1/product-versions/{versionId}
// Accepts `undefined` — see getSupplierProduct's comment above; same
// reason (PackagingComponent.productVersionId is optional as of Stage 7.3).
export async function getProductVersion(
  versionId: string | undefined
): Promise<ProductVersion | undefined> {
  if (!versionId) return undefined;
  return productVersions.find((version) => version.id === versionId);
}

// Maps to: GET /api/v1/product-versions/{versionId}/evidence
// Accepts `undefined` — see getSupplierProduct's comment above.
export async function getProductEvidence(
  productVersionId: string | undefined
): Promise<Evidence[]> {
  if (!productVersionId) return [];
  return evidence.filter((item) => item.productVersionId === productVersionId);
}

export interface CreateSupplierProductInput {
  name: string;
  sku: string;
  gtin?: string;
  countryOfOrigin?: string;
  physical: PhysicalProperties;
  circularity: CircularityMetrics;
  chemicalSafety: ChemicalSafetyData;
  specializedDomain: SpecializedDomainData;
  evidence: Array<Omit<Evidence, "id" | "productVersionId">>;
  /**
   * Pre-computed by the Create Product wizard (see
   * lib/wizard/completeness.ts) and passed straight through. A real
   * backend would recompute this itself from the same submitted
   * fields rather than trust the client — the mock trusts the caller
   * since it's the only caller today.
   */
  completenessPercent: number;
}

let productSequence = supplierProducts.length + 1;

function generateProductId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = `prod-${slug || "product"}-${productSequence}`;
  productSequence += 1;
  return id;
}

function today(): string {
  return MOCK_TODAY.toISOString().slice(0, 10);
}

// Maps to: POST /api/v1/suppliers/{supplierId}/products
// TODO: derive supplierId from auth context once real auth exists.
//
// A real backend would likely split this into separate
// createSupplierProduct + createProductVersion + addEvidence calls (see
// API_CONTRACT.md) — the Create Product wizard (Stage 1b) submits all
// three together in one user action, so the mock bundles them here.
// Always creates the product as DRAFT with its v1.0 ProductVersion;
// publishProduct() below is the separate, explicit status transition.
export async function createSupplierProduct(
  supplierId: string,
  input: CreateSupplierProductInput
): Promise<SupplierProduct> {
  const createdAt = today();
  const productId = generateProductId(input.name);
  const versionId = `${productId}-v1`;

  const evidenceRecords: Evidence[] = input.evidence.map((item, index) => ({
    id: `${versionId}-ev-${index + 1}`,
    productVersionId: versionId,
    ...item,
  }));

  const version: ProductVersion = {
    id: versionId,
    productId,
    versionLabel: "1.0",
    createdAt,
    changeSummary: "Initial draft created via Create Product wizard.",
    physical: input.physical,
    circularity: input.circularity,
    chemicalSafety: input.chemicalSafety,
    specializedDomain: input.specializedDomain,
    evidenceIds: evidenceRecords.map((item) => item.id),
  };

  const product: SupplierProduct = {
    id: productId,
    supplierId,
    name: input.name,
    sku: input.sku,
    gtin: input.gtin || undefined,
    countryOfOrigin: input.countryOfOrigin || undefined,
    currentVersionId: versionId,
    status: "DRAFT",
    completenessPercent: input.completenessPercent,
    lastUpdated: createdAt,
  };

  supplierProducts.push(product);
  productVersions.push(version);
  evidence.push(...evidenceRecords);

  return product;
}

// Maps to: POST /api/v1/products/{productId}/publish
// Pure status transition — the ProductVersion already exists from
// createSupplierProduct(); publishing doesn't create a new one.
export async function publishProduct(
  productId: string
): Promise<SupplierProduct> {
  const product = supplierProducts.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Cannot publish unknown product: ${productId}`);
  }
  product.status = "PUBLISHED";
  product.lastUpdated = today();
  return product;
}

// Planned for a later stage (see API_CONTRACT.md → mockProductService):
//   updateProductDraft(productId, input)
//   createProductVersion(productId, input)
//   addEvidence(productVersionId, input)
