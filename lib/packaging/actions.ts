"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPackagingItem } from "@/lib/services/mockPackagingService";
import { CURRENT_MANUFACTURER_ORG_ID } from "@/lib/constants";

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
