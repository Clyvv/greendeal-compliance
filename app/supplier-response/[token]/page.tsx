import { notFound } from "next/navigation";
import { getSupplierResponseData } from "@/lib/services/mockExternalSupplierService";
import { SupplierResponseForm } from "@/components/supplier-response/supplier-response-form";

export const dynamic = "force-dynamic";

export default async function SupplierResponsePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Unknown/never-generated token 404s the same way an unknown Public
  // Request Link slug does (app/request) — never leaks whether a token
  // ever existed.
  const data = await getSupplierResponseData(token);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Complete Your Product Information
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          <strong>{data.manufacturerName}</strong> is asking you to review,
          correct, and complete the compliance information they currently
          have on file for{" "}
          <strong>{data.externalSupplierProduct.productName}</strong>. No
          account is required.
        </p>
      </div>

      <SupplierResponseForm
        token={token}
        externalSupplierProduct={data.externalSupplierProduct}
        manufacturerName={data.manufacturerName}
      />
    </div>
  );
}
