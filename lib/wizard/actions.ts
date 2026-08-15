"use server";

import { revalidatePath } from "next/cache";
import { createSupplierProduct, publishProduct } from "@/lib/services/mockProductService";
import { CURRENT_SUPPLIER_ORG_ID } from "@/lib/constants";
import { toCreateSupplierProductInput } from "./mapping";
import type { ProductWizardFormState } from "./types";

function revalidateProductRoutes() {
  revalidatePath("/supplier/products");
  revalidatePath("/supplier/dashboard");
}

// Server Actions, invoked directly from the client ProductWizard
// component (not via a plain <form action>), so the wizard can control
// its own pending/error UI. Both return a plain serializable result
// (rather than calling redirect() here) so the client can navigate
// itself with router.push() — calling redirect() inside a try/catch on
// the client would otherwise risk swallowing Next's redirect signal.
export async function createDraftProductAction(
  form: ProductWizardFormState
): Promise<{ productId: string }> {
  const input = toCreateSupplierProductInput(form);
  const product = await createSupplierProduct(CURRENT_SUPPLIER_ORG_ID, input);
  revalidateProductRoutes();
  return { productId: product.id };
}

export async function createAndPublishProductAction(
  form: ProductWizardFormState
): Promise<{ productId: string }> {
  const input = toCreateSupplierProductInput(form);
  const product = await createSupplierProduct(CURRENT_SUPPLIER_ORG_ID, input);
  await publishProduct(product.id);
  revalidateProductRoutes();
  return { productId: product.id };
}
