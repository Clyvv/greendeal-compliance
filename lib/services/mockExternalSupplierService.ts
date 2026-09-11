import type {
  DataSourceType,
  ExternalSupplierProduct,
  FieldStatus,
} from "@/lib/types";
import { externalSupplierProducts } from "@/lib/mock-data";
import { getOrganization } from "@/lib/services/mockOrganizationService";

let externalProductSequence = externalSupplierProducts.length + 1;

function generateExternalSupplierProductId(): string {
  const id = `ext-${externalProductSequence}`;
  externalProductSequence += 1;
  return id;
}

export interface CreateExternalSupplierProductInput {
  supplierCompanyName: string;
  supplierContactName?: string;
  supplierEmail?: string;
  supplierCountry?: string;
  productName: string;
  supplierSku?: string;
  gtin?: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: number;
  /**
   * Caller decides MANUFACTURER_PROVIDED vs IMPORTED — see
   * components/packaging/add-component-flow.tsx (the "Add External
   * Supplier Product" path always passes MANUFACTURER_PROVIDED; "Use
   * Existing Manufacturer-Provided Data" always passes IMPORTED). This
   * service doesn't decide that judgment call itself, it just stores it.
   */
  sourceType: DataSourceType;
}

// Maps to: POST /api/v1/manufacturers/{manufacturerId}/external-supplier-products
// TODO: derive manufacturerId from auth context once real auth exists.
//
// Always starts UNVERIFIED (DOMAIN.md §8a) — nothing in this stage
// upgrades that. A real Supplier later "claiming" this record (setting
// claimedBySupplierId) is Stage 7.4/7.5+ territory, not built here.
export async function createExternalSupplierProduct(
  manufacturerId: string,
  input: CreateExternalSupplierProductInput
): Promise<ExternalSupplierProduct> {
  const product: ExternalSupplierProduct = {
    id: generateExternalSupplierProductId(),
    createdByManufacturerId: manufacturerId,
    supplierCompanyName: input.supplierCompanyName,
    supplierContactName: input.supplierContactName || undefined,
    supplierEmail: input.supplierEmail || undefined,
    supplierCountry: input.supplierCountry || undefined,
    productName: input.productName,
    supplierSku: input.supplierSku || undefined,
    gtin: input.gtin || undefined,
    knownMaterialFamily: input.knownMaterialFamily || undefined,
    knownMaterialComposition: input.knownMaterialComposition || undefined,
    knownWeightGrams: input.knownWeightGrams,
    sourceType: input.sourceType,
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
  // Records created via the "Use Existing Manufacturer-Provided Data"
  // path (sourceType 'IMPORTED') never collect a supplier email up
  // front — same as Stage 7.3's inviteSupplier, an email can be
  // supplied here and is stored onto the record for next time.
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
  responseEvidenceDocumentNames?: string[];
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
  product.responseEvidenceDocumentNames = input.responseEvidenceDocumentNames?.length
    ? input.responseEvidenceDocumentNames
    : undefined;

  product.responseStatus = "COMPLETED";
  product.sourceType = "EXTERNAL_REQUEST_RESPONSE";
  product.verificationStatus = "SUPPLIER_APPROVED";

  return product;
}
