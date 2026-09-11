"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addPackagingComponent,
  createPackagingItem,
  removeComponent,
} from "@/lib/services/mockPackagingService";
import {
  createExternalSupplierProduct,
  requestInformationFromSupplier,
  updateExternalSupplierProduct,
} from "@/lib/services/mockExternalSupplierService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import type { ExternalSupplierProduct, FieldStatus, PackagingComponent } from "@/lib/types";
import type { RequestInformationResult } from "@/lib/services/mockExternalSupplierService";

// Invoked directly via a plain <form action={...}> (not a client
// component calling it), so redirect() here is safe — there's no
// client-side try/catch that could swallow Next's redirect signal.
// This is a simple form (per this stage's scope), so the extra
// client-driven pending-state machinery the Create Product wizard
// (Stage 1b) needed isn't warranted here.
export async function createPackagingItemAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const market = String(formData.get("market") ?? "").trim();
  const packagingType = String(formData.get("packagingType") ?? "").trim();

  // Belt-and-suspenders: the form's `required` inputs should already
  // prevent this, but never trust client-side validation alone.
  if (!name || !sku || !market || !packagingType) {
    throw new Error("Name, SKU, Market, and Packaging Type are required.");
  }

  const item = await createPackagingItem(CURRENT_MANUFACTURER_ORG_ID, {
    name,
    sku,
    market,
    packagingType,
  });

  revalidatePath("/manufacturer/packaging-items");
  revalidatePath("/manufacturer/dashboard");
  redirect(`/manufacturer/packaging-items/${item.id}`);
}

function revalidatePackagingItem(packagingItemId: string) {
  revalidatePath(`/manufacturer/packaging-items/${packagingItemId}`);
  revalidatePath("/manufacturer/packaging-items");
  revalidatePath("/manufacturer/dashboard");
}

export interface AddSupplierProductComponentInput {
  packagingItemId: string;
  role: string;
  supplierProductId: string;
  productVersionId: string;
}

// Stage 7.3 — "Find Greendeal Supplier Product" path of the Add
// Component flow. Invoked directly from the client AddComponentFlow
// component (not a plain <form action>), matching
// lib/requests/actions.ts's pattern, so the flow controls its own
// step/pending/error UI and navigates itself once a success toast has
// been shown.
export async function addSupplierProductComponentAction(
  input: AddSupplierProductComponentInput
): Promise<PackagingComponent> {
  const role = input.role.trim();
  if (!role) {
    throw new Error("Component role is required.");
  }

  const component = await addPackagingComponent(input.packagingItemId, {
    source: "SUPPLIER_PRODUCT",
    role,
    supplierProductId: input.supplierProductId,
    productVersionId: input.productVersionId,
  });

  revalidatePackagingItem(input.packagingItemId);
  return component;
}

export interface AddExternalSupplierProductComponentInput {
  packagingItemId: string;
  role: string;
  /** Stage 7.11 — the real discriminator between the two Add Component
   * paths (see components/packaging/add-component-flow.tsx and
   * lib/types/external-supplier-product.ts). `sourceType` is no longer
   * caller-decided — createExternalSupplierProduct always sets it to
   * MANUFACTURER_PROVIDED at creation regardless of this flag. */
  hasSupplier: boolean;
  /** Required (and validated below) when hasSupplier is true; never
   * collected — and ignored even if passed — when hasSupplier is false. */
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

// Stage 7.3 (rebuilt in Stage 7.11) — "Add External Supplier Product"
// (hasSupplier: true) / "Use Existing Manufacturer-Provided Data"
// (hasSupplier: false) paths of the Add Component flow. Creates the
// ExternalSupplierProduct record first, then the component that
// references it — two service calls, same two-step shape
// createDataRequest/updateComponentAuthorizationStatus already uses
// elsewhere in this file's sibling (lib/requests/actions.ts), kept as
// separate calls so mockExternalSupplierService and mockPackagingService
// don't reach into each other's owned data.
export async function addExternalSupplierProductComponentAction(
  input: AddExternalSupplierProductComponentInput
): Promise<PackagingComponent> {
  const role = input.role.trim();
  const productName = input.productName.trim();

  if (!role) {
    throw new Error("Component role is required.");
  }
  if (!productName) {
    throw new Error("Product name is required.");
  }

  // Belt-and-suspenders: supplier identity is only ever meaningful (and
  // only ever required) when hasSupplier is true — a hasSupplier:false
  // record never collects it, no matter what a caller passes.
  let supplierCompanyName: string | undefined;
  if (input.hasSupplier) {
    supplierCompanyName = input.supplierCompanyName?.trim();
    if (!supplierCompanyName) {
      throw new Error("Supplier company name is required.");
    }
  }

  const externalProduct = await createExternalSupplierProduct(
    CURRENT_MANUFACTURER_ORG_ID,
    {
      hasSupplier: input.hasSupplier,
      supplierCompanyName,
      supplierContactName: input.hasSupplier
        ? input.supplierContactName?.trim()
        : undefined,
      supplierEmail: input.hasSupplier ? input.supplierEmail?.trim() : undefined,
      supplierCountry: input.hasSupplier
        ? input.supplierCountry?.trim()
        : undefined,
      productName,
      supplierSku: input.hasSupplier ? input.supplierSku?.trim() : undefined,
      gtin: input.gtin?.trim(),
      knownMaterialFamily: input.knownMaterialFamily?.trim(),
      knownMaterialComposition: input.knownMaterialComposition?.trim(),
      knownWeightGrams: input.knownWeightGrams,
      knownDimensions: input.knownDimensions?.trim(),
      knownThicknessMm: input.knownThicknessMm,
      knownPackagingFunction: input.knownPackagingFunction?.trim(),
      totalRecycledContentPercent: input.totalRecycledContentPercent,
      pcrYieldPercent: input.pcrYieldPercent,
      preConsumerYieldPercent: input.preConsumerYieldPercent,
      dfrGrade: input.dfrGrade?.trim(),
      heavyMetalPpm: input.heavyMetalPpm,
      pfasStatus: input.pfasStatus,
      reachSvhcStatus: input.reachSvhcStatus,
      scipCode: input.scipCode?.trim(),
      rohsStatus: input.rohsStatus,
      fcmStatus: input.fcmStatus,
      omlTestScore: input.omlTestScore?.trim(),
      sterilizationProfile: input.sterilizationProfile?.trim(),
      evidenceDocumentNames: input.evidenceDocumentNames,
    }
  );

  const component = await addPackagingComponent(input.packagingItemId, {
    source: "EXTERNAL_SUPPLIER_PRODUCT",
    role,
    externalSupplierProductId: externalProduct.id,
  });

  revalidatePackagingItem(input.packagingItemId);
  return component;
}

// Lets a manufacturer undo adding a component by mistake — invoked
// directly from the client RemoveComponentButton (not a plain
// <form action>), matching this file's other actions, so the card can
// show its own inline confirm/pending state before calling this.
export async function removeComponentAction(
  componentId: string,
  packagingItemId: string
): Promise<void> {
  await removeComponent(componentId);
  revalidatePackagingItem(packagingItemId);
}

// Stage 7.10 — "Request Information from Supplier" affordance on an
// External Supplier Product's component card, replacing Stage 7.3's
// "Invite Supplier" (removed — see mockExternalSupplierService's
// requestInformationFromSupplier comment). Simulated only — no real
// email is sent; this just generates the response link + email
// content for the confirmation dialog. Revalidates the packaging item
// so the card's "Response requested" indicator reflects the new
// responseStatus immediately.
export async function requestInformationFromSupplierAction(
  externalSupplierProductId: string,
  packagingItemId: string,
  email?: string
): Promise<RequestInformationResult> {
  const result = await requestInformationFromSupplier(
    externalSupplierProductId,
    email
  );
  revalidatePackagingItem(packagingItemId);
  return result;
}

export interface UpdateExternalSupplierProductActionInput {
  packagingItemId: string;
  externalSupplierProductId: string;
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

// The "View / Edit Details" affordance on an External Supplier
// Product's component card — invoked directly from the client
// ExternalSupplierProductDetailForm, matching this file's other
// actions. See mockExternalSupplierService.updateExternalSupplierProduct
// for why this refuses to change anything once a hasSupplier:true
// record's Supplier Response has been completed.
export async function updateExternalSupplierProductAction(
  input: UpdateExternalSupplierProductActionInput
): Promise<ExternalSupplierProduct> {
  const productName = input.productName.trim();
  if (!productName) {
    throw new Error("Product name is required.");
  }

  const updated = await updateExternalSupplierProduct(
    input.externalSupplierProductId,
    { ...input, productName }
  );

  revalidatePackagingItem(input.packagingItemId);
  return updated;
}
