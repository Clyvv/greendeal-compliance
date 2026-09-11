import type { DataSourceType, ExternalSupplierProduct } from "@/lib/types";
import { externalSupplierProducts } from "@/lib/mock-data";
import { MOCK_TODAY } from "@/lib/constants";

function today(): string {
  return MOCK_TODAY.toISOString().slice(0, 10);
}

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

export interface InviteSupplierResult {
  externalSupplierProductId: string;
  invitedEmail: string;
  sentAt: string;
}

// Maps to: POST /api/v1/external-supplier-products/{id}/invite
// Simulated only — no real email is sent (API_CONTRACT.md). Per this
// stage's explicit scope, this is deliberately just a confirmation
// stub: it does NOT build the claim/onboarding workflow (a real
// Supplier account picking this record up, reviewing the manufacturer-
// entered data, and taking ownership of it) — that's a later stage.
// Nothing is persisted on the record itself here; a real backend would
// likely log invite history / a "last invited at" field.
export async function inviteSupplier(
  externalSupplierProductId: string,
  email: string
): Promise<InviteSupplierResult> {
  const product = externalSupplierProducts.find(
    (item) => item.id === externalSupplierProductId
  );
  if (!product) {
    throw new Error(
      `Unknown external supplier product: ${externalSupplierProductId}`
    );
  }
  if (!email.trim()) {
    throw new Error("An email address is required to send an invite.");
  }
  return {
    externalSupplierProductId,
    invitedEmail: email.trim(),
    sentAt: today(),
  };
}
