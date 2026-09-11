export function SupplierRequestIntro({
  supplierName,
  description,
}: {
  supplierName: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Requesting from
      </p>
      <h1 className="text-xl font-semibold text-slate-900">{supplierName}</h1>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
