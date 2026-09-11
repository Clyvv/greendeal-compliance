import type { ExternalSupplierProduct, FieldStatus } from "@/lib/types";
import { externalSupplierProducts } from "@/lib/mock-data";
import { getOrganization } from "@/lib/services/mockOrganizationService";

let externalProductSequence = externalSupplierProducts.length + 1;

function generateExternalSupplierProductId(): string {
  const id = `ext-${externalProductSequence}`;
  externalProductSequence += 1;
  return id;
}

export interface CreateExternalSupplierProductInput {
  hasSupplier: boolean;
  /** Required by caller/action validation when hasSupplier is true;
   * never collected (and always ignored below) when hasSupplier is
   * false — see lib/types/external-supplier-product.ts. */
  supplierCompanyName?: string;
  supplierContactName?: string;
  supplierEmail?: string;
  supplierCountry?: string;
  productName: string;
  supplierSku?: string;
  gtin?: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: number;
  knownDimensions?: string;
  knownThicknessMm?: number;
  knownPackagingFunction?: string;
  totalRecycledContentPercent?: number;
  pcrYieldPercent?: number;
  preConsumerYieldPercent?: number;
  dfrGrade?: string;
  heavyMetalPpm?: number;
  pfasStatus?: FieldStatus;
  reachSvhcStatus?: FieldStatus;
  scipCode?: string;
  rohsStatus?: FieldStatus;
  fcmStatus?: FieldStatus;
  omlTestScore?: string;
  sterilizationProfile?: string;
  evidenceDocumentNames?: string[];
}

// Maps to: POST /api/v1/manufacturers/{manufacturerId}/external-supplier-products
// TODO: derive manufacturerId from auth context once real auth exists.
//
// Stage 7.11 — sourceType is always MANUFACTURER_PROVIDED here for BOTH
// Add Component paths (the caller no longer decides it — see
// CreateExternalSupplierProductInput's old comment, now superseded);
// only a hasSupplier:true record can later move to
// EXTERNAL_REQUEST_RESPONSE (requestInformationFromSupplier/
// submitSupplierResponse below). verificationStatus always starts
// UNVERIFIED and, for hasSupplier:false, stays that way permanently —
// there is no supplier who could ever approve it. A real Supplier later
// "claiming" a hasSupplier:true record (setting claimedBySupplierId) is
// not built here (AGENTS.md §11).
//
// Supplier-identity fields (company name/contact/email/country/SKU)
// are force-blanked when hasSupplier is false, even if a caller
// mistakenly passes them — belt-and-suspenders, matching this file's
// other defensive checks.
export async function createExternalSupplierProduct(
  manufacturerId: string,
  input: CreateExternalSupplierProductInput
): Promise<ExternalSupplierProduct> {
  const product: ExternalSupplierProduct = {
    id: generateExternalSupplierProductId(),
    createdByManufacturerId: manufacturerId,
    hasSupplier: input.hasSupplier,
    supplierCompanyName: input.hasSupplier
      ? input.supplierCompanyName || undefined
      : undefined,
    supplierContactName: input.hasSupplier
      ? input.supplierContactName || undefined
      : undefined,
    supplierEmail: input.hasSupplier ? input.supplierEmail || undefined : undefined,
    supplierCountry: input.hasSupplier
      ? input.supplierCountry || undefined
      : undefined,
    productName: input.productName,
    supplierSku: input.hasSupplier ? input.supplierSku || undefined : undefined,
    gtin: input.gtin || undefined,
    knownMaterialFamily: input.knownMaterialFamily || undefined,
    knownMaterialComposition: input.knownMaterialComposition || undefined,
    knownWeightGrams: input.knownWeightGrams,
    knownDimensions: input.knownDimensions || undefined,
    knownThicknessMm: input.knownThicknessMm,
    knownPackagingFunction: input.knownPackagingFunction || undefined,
    totalRecycledContentPercent: input.totalRecycledContentPercent,
    pcrYieldPercent: input.pcrYieldPercent,
    preConsumerYieldPercent: input.preConsumerYieldPercent,
    dfrGrade: input.dfrGrade || undefined,
    heavyMetalPpm: input.heavyMetalPpm,
    pfasStatus: input.pfasStatus,
    reachSvhcStatus: input.reachSvhcStatus,
    scipCode: input.scipCode || undefined,
    rohsStatus: input.rohsStatus,
    fcmStatus: input.fcmStatus,
    omlTestScore: input.omlTestScore || undefined,
    sterilizationProfile: input.sterilizationProfile || undefined,
    evidenceDocumentNames: input.evidenceDocumentNames?.length
      ? input.evidenceDocumentNames
      : undefined,
    sourceType: "MANUFACTURER_PROVIDED",
    verificationStatus: "UNVERIFIED",
    responseStatus: "NOT_SENT",
  };
  externalSupplierProducts.push(product);
  return product;
}

// Maps to: GET /api/v1/external-supplier-products/{id}
export async function getExternalSupplierProduct(
  id: string
): Promise<ExternalSupplierProduct | undefined> {
  return externalSupplierProducts.find((product) => product.id === id);
}

function generateResponseToken(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `resp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface RequestInformationEmail {
  to: string;
  from: string;
  subject: string;
  body: string;
}

export interface RequestInformationResult {
  externalSupplierProductId: string;
  responseToken: string;
  responseUrl: string; // relative path, e.g. "/supplier-response/{token}"
  email: RequestInformationEmail;
}

// Maps to: POST /api/v1/external-supplier-products/{id}/request-information
// Stage 7.10 — supersedes Stage 7.3's `inviteSupplier` (removed above).
// Simulated only — no real email is ever sent (API_CONTRACT.md); this
// generates the response link + the exact simulated email content for
// display in a dialog (components/packaging/request-information-button.tsx)
// with a "Copy Link" affordance, and flips responseStatus to 'SENT' so
// the manufacturer-side card can show that a response was requested.
// Re-requesting reuses the same token rather than minting a new one —
// a link already shared (e.g. copied into a real email by the
// manufacturer) must keep working.
//
// Stage 7.11 — belt-and-suspenders guard: the UI never renders this
// action for a hasSupplier:false record (there is no supplier to
// request anything from), but the service itself refuses too, in case
// it's ever called directly.
export async function requestInformationFromSupplier(
  externalSupplierProductId: string,
  supplierEmailOverride?: string
): Promise<RequestInformationResult> {
  const product = externalSupplierProducts.find(
    (item) => item.id === externalSupplierProductId
  );
  if (!product) {
    throw new Error(
      `Unknown external supplier product: ${externalSupplierProductId}`
    );
  }
  if (!product.hasSupplier) {
    throw new Error(
      "This record has no associated supplier — there is nothing to request."
    );
  }
  // Records created via the "Add External Supplier Product" path don't
  // always collect an email up front either — an email can be supplied
  // here and is stored onto the record for next time.
  if (supplierEmailOverride?.trim()) {
    product.supplierEmail = supplierEmailOverride.trim();
  }
  if (!product.supplierEmail?.trim()) {
    throw new Error(
      "This record has no supplier email on file — add one before requesting information."
    );
  }

  const token = product.responseToken ?? generateResponseToken();
  product.responseToken = token;
  if (product.responseStatus === "NOT_SENT") {
    product.responseStatus = "SENT";
  }

  const manufacturer = await getOrganization(product.createdByManufacturerId);
  const manufacturerName = manufacturer?.name ?? "A Greendeal Compliance manufacturer";
  const responseUrl = `/supplier-response/${token}`;

  const emailContent: RequestInformationEmail = {
    to: product.supplierEmail.trim(),
    from: "notifications@greendeal-compliance.example",
    subject: `${manufacturerName} is requesting product compliance information`,
    body: [
      `Hello${product.supplierContactName ? ` ${product.supplierContactName}` : ""},`,
      "",
      `${manufacturerName} uses Greendeal Compliance to manage product and packaging compliance data, and has listed your company (${product.supplierCompanyName}) as the source for the following product:`,
      "",
      `  ${product.productName}`,
      "",
      "They're asking you to review, correct, and complete the compliance information they currently have on file for this product. No account is required — just follow the secure link below:",
      "",
      `  {{RESPONSE_LINK}}`,
      "",
      "If you weren't expecting this request, you can safely ignore this email.",
      "",
      "— Greendeal Compliance",
    ].join("\n"),
  };

  return {
    externalSupplierProductId,
    responseToken: token,
    responseUrl,
    email: emailContent,
  };
}

export interface SupplierResponseData {
  externalSupplierProduct: ExternalSupplierProduct;
  manufacturerName: string;
}

// Maps to: GET /api/v1/public/supplier-response/{token} — no auth.
// Returns undefined for an unknown/never-generated token, exactly the
// same shape mockPublicRequestService uses for an unknown slug, so the
// page can 404 rather than leak whether a token ever existed.
export async function getSupplierResponseData(
  token: string
): Promise<SupplierResponseData | undefined> {
  const product = externalSupplierProducts.find(
    (item) => item.responseToken === token
  );
  if (!product) return undefined;

  const manufacturer = await getOrganization(product.createdByManufacturerId);
  return {
    externalSupplierProduct: product,
    manufacturerName: manufacturer?.name ?? "This manufacturer",
  };
}

export interface SubmitSupplierResponseInput {
  supplierCompanyName?: string;
  supplierContactName?: string;
  productName?: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: number;
  knownDimensions?: string;
  knownThicknessMm?: number;
  knownPackagingFunction?: string;
  totalRecycledContentPercent?: number;
  pcrYieldPercent?: number;
  preConsumerYieldPercent?: number;
  dfrGrade?: string;
  heavyMetalPpm?: number;
  pfasStatus?: FieldStatus;
  reachSvhcStatus?: FieldStatus;
  scipCode?: string;
  rohsStatus?: FieldStatus;
  evidenceDocumentNames?: string[];
}

// Maps to: POST /api/v1/public/supplier-response/{token}/submit — no auth.
// The core rule from AGENTS.md's "Supplier Response Link" section: once
// a real supplier stands behind this data, it's meaningfully more
// trusted than manufacturer-only entry (sourceType 'EXTERNAL_REQUEST_RESPONSE',
// verificationStatus 'SUPPLIER_APPROVED') — but this still isn't a real,
// onboarded SupplierProduct (claiming/onboarding is out of scope, see
// AGENTS.md §11); it stays an ExternalSupplierProduct, just an upgraded
// one. Resubmitting (e.g. the supplier revisits the link later to make
// a correction) is allowed — it simply overwrites the previous values.
//
// Stage 7.11 — a hasSupplier:false record never has a responseToken
// (requestInformationFromSupplier refuses to generate one for it), so
// this is naturally unreachable for it; the explicit check below is
// belt-and-suspenders, matching this file's other defensive guards.
export async function submitSupplierResponse(
  token: string,
  input: SubmitSupplierResponseInput
): Promise<ExternalSupplierProduct> {
  const product = externalSupplierProducts.find(
    (item) => item.responseToken === token
  );
  if (!product) {
    throw new Error("This response link is invalid or has expired.");
  }
  if (!product.hasSupplier) {
    throw new Error("This record has no associated supplier response to submit.");
  }

  if (input.supplierCompanyName?.trim()) {
    product.supplierCompanyName = input.supplierCompanyName.trim();
  }
  if (input.supplierContactName !== undefined) {
    product.supplierContactName = input.supplierContactName.trim() || undefined;
  }
  if (input.productName?.trim()) {
    product.productName = input.productName.trim();
  }
  product.knownMaterialFamily = input.knownMaterialFamily?.trim() || undefined;
  product.knownMaterialComposition =
    input.knownMaterialComposition?.trim() || undefined;
  product.knownWeightGrams = input.knownWeightGrams;
  product.knownDimensions = input.knownDimensions?.trim() || undefined;
  product.knownThicknessMm = input.knownThicknessMm;
  product.knownPackagingFunction =
    input.knownPackagingFunction?.trim() || undefined;
  product.totalRecycledContentPercent = input.totalRecycledContentPercent;
  product.pcrYieldPercent = input.pcrYieldPercent;
  product.preConsumerYieldPercent = input.preConsumerYieldPercent;
  product.dfrGrade = input.dfrGrade?.trim() || undefined;
  product.heavyMetalPpm = input.heavyMetalPpm;
  product.pfasStatus = input.pfasStatus;
  product.reachSvhcStatus = input.reachSvhcStatus;
  product.scipCode = input.scipCode?.trim() || undefined;
  product.rohsStatus = input.rohsStatus;
  product.evidenceDocumentNames = input.evidenceDocumentNames?.length
    ? input.evidenceDocumentNames
    : undefined;

  product.responseStatus = "COMPLETED";
  product.sourceType = "EXTERNAL_REQUEST_RESPONSE";
  product.verificationStatus = "SUPPLIER_APPROVED";

  return product;
}

export interface UpdateExternalSupplierProductInput {
  supplierCompanyName?: string;
  supplierContactName?: string;
  supplierEmail?: string;
  supplierCountry?: string;
  productName?: string;
  supplierSku?: string;
  gtin?: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: number;
  knownDimensions?: string;
  knownThicknessMm?: number;
  knownPackagingFunction?: string;
  totalRecycledContentPercent?: number;
  pcrYieldPercent?: number;
  preConsumerYieldPercent?: number;
  dfrGrade?: string;
  heavyMetalPpm?: number;
  pfasStatus?: FieldStatus;
  reachSvhcStatus?: FieldStatus;
  scipCode?: string;
  rohsStatus?: FieldStatus;
  fcmStatus?: FieldStatus;
  omlTestScore?: string;
  sterilizationProfile?: string;
  evidenceDocumentNames?: string[];
}

// Maps to: PATCH /api/v1/external-supplier-products/{id}
// Lets the manufacturer view/edit the full record after creation
// (previously creatable only — there was no way back in). Refuses to
// touch anything once a hasSupplier:true record's Supplier Response has
// been COMPLETED: at that point the compliance fields (and the
// supplier's own identity details) are supplier-owned/approved data
// (AGENTS.md §6 ownership rules) — the manufacturer silently overwriting
// them here would undermine that approval without the actual supplier's
// involvement. Editing is unrestricted before a response is completed,
// and always unrestricted for hasSupplier:false (no such concept
// applies — see lib/types/external-supplier-product.ts).
export async function updateExternalSupplierProduct(
  id: string,
  input: UpdateExternalSupplierProductInput
): Promise<ExternalSupplierProduct> {
  const product = externalSupplierProducts.find((item) => item.id === id);
  if (!product) {
    throw new Error(`Unknown external supplier product: ${id}`);
  }
  if (product.hasSupplier && product.responseStatus === "COMPLETED") {
    throw new Error(
      "This record's data was provided by the supplier via a completed response and can no longer be edited here."
    );
  }

  if (input.productName?.trim()) {
    product.productName = input.productName.trim();
  }
  // Supplier-identity fields only ever apply to a hasSupplier:true
  // record — force-blanked otherwise, same defensive pattern
  // createExternalSupplierProduct already uses.
  if (product.hasSupplier) {
    if (input.supplierCompanyName?.trim()) {
      product.supplierCompanyName = input.supplierCompanyName.trim();
    }
    product.supplierContactName = input.supplierContactName?.trim() || undefined;
    product.supplierEmail = input.supplierEmail?.trim() || undefined;
    product.supplierCountry = input.supplierCountry?.trim() || undefined;
    product.supplierSku = input.supplierSku?.trim() || undefined;
  }
  product.gtin = input.gtin?.trim() || undefined;
  product.knownMaterialFamily = input.knownMaterialFamily?.trim() || undefined;
  product.knownMaterialComposition =
    input.knownMaterialComposition?.trim() || undefined;
  product.knownWeightGrams = input.knownWeightGrams;
  product.knownDimensions = input.knownDimensions?.trim() || undefined;
  product.knownThicknessMm = input.knownThicknessMm;
  product.knownPackagingFunction =
    input.knownPackagingFunction?.trim() || undefined;
  product.totalRecycledContentPercent = input.totalRecycledContentPercent;
  product.pcrYieldPercent = input.pcrYieldPercent;
  product.preConsumerYieldPercent = input.preConsumerYieldPercent;
  product.dfrGrade = input.dfrGrade?.trim() || undefined;
  product.heavyMetalPpm = input.heavyMetalPpm;
  product.pfasStatus = input.pfasStatus;
  product.reachSvhcStatus = input.reachSvhcStatus;
  product.scipCode = input.scipCode?.trim() || undefined;
  product.rohsStatus = input.rohsStatus;
  product.fcmStatus = input.fcmStatus;
  product.omlTestScore = input.omlTestScore?.trim() || undefined;
  product.sterilizationProfile = input.sterilizationProfile?.trim() || undefined;
  product.evidenceDocumentNames = input.evidenceDocumentNames?.length
    ? input.evidenceDocumentNames
    : undefined;

  return product;
}
