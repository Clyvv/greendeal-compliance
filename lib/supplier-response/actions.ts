"use server";

import { revalidatePath } from "next/cache";
import { submitSupplierResponse } from "@/lib/services/mockExternalSupplierService";
import type { FieldStatus } from "@/lib/types";

export interface SubmitSupplierResponseActionInput {
  supplierCompanyName: string;
  supplierContactName?: string;
  productName: string;
  knownMaterialFamily?: string;
  knownMaterialComposition?: string;
  knownWeightGrams?: string;
  knownDimensions?: string;
  knownThicknessMm?: string;
  knownPackagingFunction?: string;
  totalRecycledContentPercent?: string;
  pcrYieldPercent?: string;
  preConsumerYieldPercent?: string;
  dfrGrade?: string;
  heavyMetalPpm?: string;
  pfasStatus?: FieldStatus;
  reachSvhcStatus?: FieldStatus;
  scipCode?: string;
  rohsStatus?: FieldStatus;
  responseEvidenceDocumentNames?: string[];
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Stage 7.10 — the public, unauthenticated Supplier Response form
// (app/supplier-response/[token]) calls this directly, matching
// lib/requests/actions.ts's pattern so the form controls its own
// pending/error/confirmation UI. Belt-and-suspenders: re-validates the
// required fields server-side even though the client form already
// marks them required, per this codebase's standing convention (never
// trust client-side validation alone).
export async function submitSupplierResponseAction(
  token: string,
  input: SubmitSupplierResponseActionInput
) {
  const supplierCompanyName = input.supplierCompanyName.trim();
  const productName = input.productName.trim();
  if (!supplierCompanyName) {
    throw new Error("Supplier company name is required.");
  }
  if (!productName) {
    throw new Error("Product name is required.");
  }

  const updated = await submitSupplierResponse(token, {
    supplierCompanyName,
    supplierContactName: input.supplierContactName,
    productName,
    knownMaterialFamily: input.knownMaterialFamily,
    knownMaterialComposition: input.knownMaterialComposition,
    knownWeightGrams: toNumber(input.knownWeightGrams),
    knownDimensions: input.knownDimensions,
    knownThicknessMm: toNumber(input.knownThicknessMm),
    knownPackagingFunction: input.knownPackagingFunction,
    totalRecycledContentPercent: toNumber(input.totalRecycledContentPercent),
    pcrYieldPercent: toNumber(input.pcrYieldPercent),
    preConsumerYieldPercent: toNumber(input.preConsumerYieldPercent),
    dfrGrade: input.dfrGrade,
    heavyMetalPpm: toNumber(input.heavyMetalPpm),
    pfasStatus: input.pfasStatus,
    reachSvhcStatus: input.reachSvhcStatus,
    scipCode: input.scipCode,
    rohsStatus: input.rohsStatus,
    responseEvidenceDocumentNames: input.responseEvidenceDocumentNames,
  });

  // The manufacturer-side packaging item page reads this record's
  // provenance/readiness live (server-rendered) — revalidate it so the
  // upgrade shows up immediately without a manual refresh, even though
  // the submitting supplier never navigates there themselves.
  revalidatePath("/manufacturer/packaging-items", "layout");

  return updated;
}
