import { organizations, supplierProducts } from "@/lib/mock-data";

// Stage 7.4 — no auth, public-facing (API_CONTRACT.md's
// mockPublicRequestService). Everything returned from this file is
// deliberately identity-only: WHO the visitor would be requesting
// from, and WHAT product(s) exist to request data about. NEVER any
// compliance field value (recycled content %, chemical safety
// statuses, evidence, ...) — that boundary is what the eventual
// request/approval flow (Stage 7.5/7.6) exists to gate, and it starts
// here by simply never fetching that data into these responses in the
// first place, not by masking it after the fact.

export interface PublicProductSummary {
  productId: string;
  name: string;
  sku: string;
}

export interface SupplierPublicProfile {
  organizationId: string;
  slug: string;
  supplierName: string;
  /** Only PUBLISHED products — a public visitor should never be able
   * to select (or even know about) a supplier's unpublished DRAFT
   * product (same boundary mockProductService.getPublishedSupplierProducts
   * enforces for the manufacturer-side Add Component flow, Stage 7.3). */
  publishedProducts: PublicProductSummary[];
}

// Maps to: GET /api/v1/public/request/{supplierSlug}
// Backs both the supplier-level page (/request/[slug] — shows the
// product list below as its selector) and is reused by
// getSupplierProductPublic below to resolve+validate a slug once
// rather than duplicating the lookup.
export async function getSupplierPublicProfile(
  supplierSlug: string
): Promise<SupplierPublicProfile | undefined> {
  const org = organizations.find(
    (candidate) => candidate.type === "SUPPLIER" && candidate.slug === supplierSlug
  );
  if (!org) return undefined;

  const publishedProducts: PublicProductSummary[] = supplierProducts
    .filter((product) => product.supplierId === org.id && product.status === "PUBLISHED")
    .map((product) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
    }));

  return {
    organizationId: org.id,
    slug: supplierSlug,
    supplierName: org.name,
    publishedProducts,
  };
}

// Maps to: GET /api/v1/public/request/{supplierSlug}/{productId}
// Only resolves a product if it's both PUBLISHED and actually belongs
// to the supplier identified by supplierSlug — a guessed productId
// from a different supplier (or an unpublished draft) must 404, not
// leak whether it exists.
export async function getSupplierProductPublic(
  supplierSlug: string,
  productId: string
): Promise<PublicProductSummary | undefined> {
  const profile = await getSupplierPublicProfile(supplierSlug);
  if (!profile) return undefined;
  return profile.publishedProducts.find((product) => product.productId === productId);
}

// Maps to: POST /api/v1/public/request/{supplierSlug}/submit
// Deliberately NOT implemented yet — Stage 7.5 builds the requester-
// details/field-selection/purpose form this would submit, and the
// DataRequest.origin: 'PUBLIC_REQUEST_LINK' + `requester` shape
// (DOMAIN.md §8a) it would construct. Declared here (unimplemented) so
// this file's shape matches API_CONTRACT.md's documented three
// functions, and so it's obvious where Stage 7.5 continues.
// export async function submitPublicDataRequest(...): Promise<...> { }
