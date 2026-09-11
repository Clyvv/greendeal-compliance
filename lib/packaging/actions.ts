"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addPackagingComponent,
  createPackagingItem,
} from "@/lib/services/mockPackagingService";
import {
  createExternalSupplierProduct,
  inviteSupplier,
} from "@/lib/services/mockExternalSupplierService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";
import type {
  DataSourceType,
  PackagingComponent,
} from "@/lib/types";
import type { InviteSupplierResult } from "@/lib/services/mockExternalSupplierService";

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
  /** Decided by the caller — see
   * components/packaging/add-component-flow.tsx for exactly which of
   * the two "Add External Supplier Product" / "Use Existing
   * Manufacturer-Provided Data" paths sets which value. */
  sourceType: DataSourceType;
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
}

// Stage 7.3 — "Add External Supplier Product" / "Use Existing
// Manufacturer-Provided Data" paths of the Add Component flow. Creates
// the ExternalSupplierProduct record first, then the component that
// references it — two service calls, same two-step shape
// createDataRequest/updateComponentAuthorizationStatus already uses
// elsewhere in this file's sibling (lib/requests/actions.ts), kept as
// separate calls so mockExternalSupplierService and mockPackagingService
// don't reach into each other's owned data.
export async function addExternalSupplierProductComponentAction(
  input: AddExternalSupplierProductComponentInput
): Promise<PackagingComponent> {
  const role = input.role.trim();
  const supplierCompanyName = input.supplierCompanyName.trim();
  const productName = input.productName.trim();

  if (!role) {
    throw new Error("Component role is required.");
  }
  if (!supplierCompanyName) {
    throw new Error("Supplier / source name is required.");
  }
  if (!productName) {
    throw new Error("Product name is required.");
  }

  const externalProduct = await createExternalSupplierProduct(
    CURRENT_MANUFACTURER_ORG_ID,
    {
      supplierCompanyName,
      supplierContactName: input.supplierContactName?.trim(),
      supplierEmail: input.supplierEmail?.trim(),
      supplierCountry: input.supplierCountry?.trim(),
      productName,
      supplierSku: input.supplierSku?.trim(),
      gtin: input.gtin?.trim(),
      knownMaterialFamily: input.knownMaterialFamily?.trim(),
      knownMaterialComposition: input.knownMaterialComposition?.trim(),
      knownWeightGrams: input.knownWeightGrams,
      sourceType: input.sourceType,
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

// Stage 7.3 — "Invite Supplier" affordance on an External Supplier
// Product's component card (original requirements doc §11: "This
// product is not currently maintained by the supplier in Greendeal.
// [Invite Supplier]"). Simulated only, per this stage's explicit
// scope — no real email is sent, and this deliberately does NOT build
// the claim/onboarding flow a real invite would eventually trigger.
export async function inviteSupplierAction(
  externalSupplierProductId: string,
  email: string
): Promise<InviteSupplierResult> {
  return inviteSupplier(externalSupplierProductId, email);
}
