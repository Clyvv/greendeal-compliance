import { dataRequests, organizations, supplierProducts } from "@/lib/mock-data";
import { MOCK_TODAY } from "@/lib/constants";
import type { DataRequest, DataRequestRequester } from "@/lib/types";

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

function today(): string {
  return MOCK_TODAY.toISOString().slice(0, 10);
}

// A public submission's id is deliberately NOT from the same "dr-N"
// sequence mockRequestService.createDataRequest uses — it needs to be
// a human-presentable reference number the requester can actually use
// (they have no Greendeal account/dashboard to look "dr-4" up in), per
// this stage's prompt: "Generate a reference number in the format
// REQ-XXXX". Using it as the record's own `id` (rather than adding a
// separate referenceNumber field alongside a "dr-N" id) means the
// confirmation screen can just show `request.id` directly — one
// identifier, not two that could drift apart. Independent namespace
// ("REQ-" vs "dr-") means no collision risk with mockRequestService's
// own counter.
let publicRequestSequence = 1;

function generatePublicRequestId(): string {
  const id = `REQ-${String(publicRequestSequence).padStart(4, "0")}`;
  publicRequestSequence += 1;
  return id;
}

export interface SubmitPublicDataRequestInput {
  supplierSlug: string;
  supplierProductId: string;
  requestedAttributes: string[];
  purpose: string;
  requester: DataRequestRequester;
}

// Deliberately minimal — enough for the public confirmation screen
// (AGENTS.md §10a: "a public link is a request endpoint, never a data
// page") and nothing else. Not even the full DataRequest record: an
// unauthenticated caller has no business reading requestedAttributes/
// purpose back once it's left their browser, let alone any compliance
// data — that boundary is enforced here by simply never returning it,
// not by masking it after the fact.
export interface SubmitPublicDataRequestResult {
  requestId: string;
  supplierName: string;
}

// Maps to: POST /api/v1/public/request/{supplierSlug}/submit
// Creates a DataRequest with origin: 'PUBLIC_REQUEST_LINK' and a
// `requester` object instead of a requestingOrgId (DOMAIN.md §8a — the
// requester may not be a registered Greendeal Organization at all) and
// no packagingItemId (this request isn't "for" any Greendeal packaging
// item — see lib/types/data-request.ts). Re-validates the slug/product
// server-side rather than trusting whatever the client last rendered —
// belt-and-suspenders, same discipline as
// lib/requests/actions.ts's submitDataRequestAction.
export async function submitPublicDataRequest(
  input: SubmitPublicDataRequestInput
): Promise<SubmitPublicDataRequestResult> {
  const profile = await getSupplierPublicProfile(input.supplierSlug);
  if (!profile) {
    throw new Error("Unknown supplier link.");
  }
  const product = profile.publishedProducts.find(
    (item) => item.productId === input.supplierProductId
  );
  if (!product) {
    throw new Error("Unknown or unpublished product.");
  }
  if (input.requestedAttributes.length === 0) {
    throw new Error("Select at least one field to request.");
  }

  const purpose = input.purpose.trim();
  const companyName = input.requester.companyName.trim();
  const contactName = input.requester.contactName.trim();
  const email = input.requester.email.trim();
  if (!purpose || !companyName || !contactName || !email) {
    throw new Error(
      "Company name, requester name, email, and purpose are required."
    );
  }

  const requester: DataRequestRequester = {
    companyName,
    contactName,
    email,
    country: input.requester.country?.trim() || undefined,
    referenceNumber: input.requester.referenceNumber?.trim() || undefined,
  };

  const request: DataRequest = {
    id: generatePublicRequestId(),
    // requestingOrgId / packagingItemId intentionally omitted — see
    // lib/types/data-request.ts.
    supplierOrgId: profile.organizationId,
    supplierProductId: product.productId,
    requestedAttributes: input.requestedAttributes,
    purpose,
    requestDate: today(),
    status: "PENDING",
    origin: "PUBLIC_REQUEST_LINK",
    requester,
  };
  dataRequests.push(request);

  return { requestId: request.id, supplierName: profile.supplierName };
}
