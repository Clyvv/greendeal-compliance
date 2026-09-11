"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/providers/toast-provider";
import {
  addExternalSupplierProductComponentAction,
  addSupplierProductComponentAction,
} from "@/lib/packaging/actions";
import type { SupplierProduct } from "@/lib/types";

// The three source options, per AGENTS.md §10a / original requirements
// doc §13. "EXTERNAL_LIGHT" isn't a separate DataSourceType — see
// lib/services/mockExternalSupplierService.ts's CreateExternalSupplierProductInput
// comment for how it maps to sourceType: 'IMPORTED' vs the full
// "EXTERNAL_FULL" form's 'MANUFACTURER_PROVIDED'.
type SourceChoice =
  | "SUPPLIER_PRODUCT"
  | "EXTERNAL_FULL"
  | "EXTERNAL_LIGHT"
  | null;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export interface SupplierProductOption {
  product: SupplierProduct;
  supplierName: string;
}

interface ExternalFormState {
  supplierCompanyName: string;
  supplierContactName: string;
  supplierEmail: string;
  supplierCountry: string;
  productName: string;
  supplierSku: string;
  gtin: string;
  knownMaterialFamily: string;
  knownMaterialComposition: string;
  knownWeightGrams: string;
}

const EMPTY_EXTERNAL_FORM: ExternalFormState = {
  supplierCompanyName: "",
  supplierContactName: "",
  supplierEmail: "",
  supplierCountry: "",
  productName: "",
  supplierSku: "",
  gtin: "",
  knownMaterialFamily: "",
  knownMaterialComposition: "",
  knownWeightGrams: "",
};

export function AddComponentFlow({
  packagingItemId,
  packagingItemName,
  supplierProductOptions,
}: {
  packagingItemId: string;
  packagingItemName: string;
  supplierProductOptions: SupplierProductOption[];
}) {
  const [source, setSource] = useState<SourceChoice>(null);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [externalForm, setExternalForm] =
    useState<ExternalFormState>(EMPTY_EXTERNAL_FORM);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return supplierProductOptions;
    return supplierProductOptions.filter(
      ({ product, supplierName }) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        supplierName.toLowerCase().includes(query)
    );
  }, [search, supplierProductOptions]);

  function updateExternalField(
    field: keyof ExternalFormState,
    value: string
  ) {
    setExternalForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBackToSource() {
    setSource(null);
  }

  function handleSubmitSupplierProduct() {
    const trimmedRole = role.trim();
    const selected = supplierProductOptions.find(
      ({ product }) => product.id === selectedProductId
    );
    if (!trimmedRole || !selected) return;

    startTransition(async () => {
      try {
        await addSupplierProductComponentAction({
          packagingItemId,
          role: trimmedRole,
          supplierProductId: selected.product.id,
          productVersionId: selected.product.currentVersionId,
        });
        toast({
          title: "Component added",
          description: `${trimmedRole} now references ${selected.product.name} (${selected.supplierName}).`,
          variant: "success",
        });
        router.push(`/manufacturer/packaging-items/${packagingItemId}`);
      } catch (error) {
        toast({
          title: "Couldn't add component",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  function handleSubmitExternal(sourceType: "MANUFACTURER_PROVIDED" | "IMPORTED") {
    const trimmedRole = role.trim();
    if (!trimmedRole) return;
    if (!externalForm.supplierCompanyName.trim()) return;
    if (!externalForm.productName.trim()) return;

    startTransition(async () => {
      try {
        await addExternalSupplierProductComponentAction({
          packagingItemId,
          role: trimmedRole,
          sourceType,
          supplierCompanyName: externalForm.supplierCompanyName,
          supplierContactName: externalForm.supplierContactName || undefined,
          supplierEmail: externalForm.supplierEmail || undefined,
          supplierCountry: externalForm.supplierCountry || undefined,
          productName: externalForm.productName,
          supplierSku: externalForm.supplierSku || undefined,
          gtin: externalForm.gtin || undefined,
          knownMaterialFamily: externalForm.knownMaterialFamily || undefined,
          knownMaterialComposition:
            externalForm.knownMaterialComposition || undefined,
          knownWeightGrams: externalForm.knownWeightGrams
            ? Number(externalForm.knownWeightGrams)
            : undefined,
        });
        toast({
          title: "Component added",
          description: `${trimmedRole} now references ${externalForm.productName} — not yet a registered Greendeal supplier.`,
          variant: "success",
        });
        router.push(`/manufacturer/packaging-items/${packagingItemId}`);
      } catch (error) {
        toast({
          title: "Couldn't add component",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/manufacturer/packaging-items/${packagingItemId}`}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to {packagingItemName}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Add Component
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose where this component&rsquo;s data comes from.
        </p>
      </div>

      {source === null && <SourceChoiceStep onChoose={setSource} />}

      {source === "SUPPLIER_PRODUCT" && (
        <SupplierProductStep
          role={role}
          onRoleChange={setRole}
          search={search}
          onSearchChange={setSearch}
          products={filteredProducts}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
          isPending={isPending}
          onBack={handleBackToSource}
          onSubmit={handleSubmitSupplierProduct}
        />
      )}

      {source === "EXTERNAL_FULL" && (
        <ExternalSupplierFormStep
          variant="FULL"
          role={role}
          onRoleChange={setRole}
          form={externalForm}
          onFieldChange={updateExternalField}
          isPending={isPending}
          onBack={handleBackToSource}
          onSubmit={() => handleSubmitExternal("MANUFACTURER_PROVIDED")}
        />
      )}

      {source === "EXTERNAL_LIGHT" && (
        <ExternalSupplierFormStep
          variant="LIGHT"
          role={role}
          onRoleChange={setRole}
          form={externalForm}
          onFieldChange={updateExternalField}
          isPending={isPending}
          onBack={handleBackToSource}
          onSubmit={() => handleSubmitExternal("IMPORTED")}
        />
      )}
    </div>
  );
}

function SourceChoiceStep({
  onChoose,
}: {
  onChoose: (choice: Exclude<SourceChoice, null>) => void;
}) {
  const options: {
    id: Exclude<SourceChoice, null>;
    title: string;
    description: string;
  }[] = [
    {
      id: "SUPPLIER_PRODUCT",
      title: "Find Greendeal Supplier Product",
      description:
        "Search published products already maintained by a supplier on Greendeal. This is the normal path — the component references the supplier's real, versioned product data, and you can request specific fields from it afterward.",
    },
    {
      id: "EXTERNAL_FULL",
      title: "Add External Supplier Product",
      description:
        "The supplier isn't on Greendeal yet. Enter what you know about them and their product, then invite the supplier to claim and maintain it themselves.",
    },
    {
      id: "EXTERNAL_LIGHT",
      title: "Use Existing Manufacturer-Provided Data",
      description:
        "You already have this compliance data from somewhere else (email, PDF, ERP, spreadsheet) and just need to record it. This data is never presented as supplier-authoritative.",
    },
  ];

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChoose(option.id)}
          className="block w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          <p className="text-sm font-semibold text-slate-900">
            {option.title}
          </p>
          <p className="mt-1 text-sm text-slate-500">{option.description}</p>
        </button>
      ))}
    </div>
  );
}

function RoleField({
  role,
  onRoleChange,
}: {
  role: string;
  onRoleChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor="component-role">Component Role *</Label>
      <Input
        id="component-role"
        value={role}
        onChange={(event) => onRoleChange(event.target.value)}
        placeholder="e.g. Bottle, Label, Cap"
        list="component-role-suggestions"
      />
      <datalist id="component-role-suggestions">
        <option value="Bottle" />
        <option value="Label" />
        <option value="Cap" />
        <option value="Closure" />
        <option value="Secondary Packaging" />
      </datalist>
    </div>
  );
}

function SupplierProductStep({
  role,
  onRoleChange,
  search,
  onSearchChange,
  products,
  selectedProductId,
  onSelectProduct,
  isPending,
  onBack,
  onSubmit,
}: {
  role: string;
  onRoleChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  products: SupplierProductOption[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = role.trim().length > 0 && selectedProductId.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Greendeal Supplier Product</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleField role={role} onRoleChange={onRoleChange} />

        <div>
          <Label htmlFor="product-search">Search Published Products</Label>
          <Input
            id="product-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by product name, SKU, or supplier…"
          />
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-slate-500">
            No published supplier products match your search.
          </p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {products.map(({ product, supplierName }) => {
              const isSelected = product.id === selectedProductId;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelectProduct(product.id)}
                  className={`block w-full rounded-md border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <Badge tone="neutral">SKU {product.sku}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {supplierName} · {product.completenessPercent}% complete
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" type="button" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={!canSubmit || isPending}>
          {isPending ? "Adding…" : "Add Component"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ExternalSupplierFormStep({
  variant,
  role,
  onRoleChange,
  form,
  onFieldChange,
  isPending,
  onBack,
  onSubmit,
}: {
  variant: "FULL" | "LIGHT";
  role: string;
  onRoleChange: (value: string) => void;
  form: ExternalFormState;
  onFieldChange: (field: keyof ExternalFormState, value: string) => void;
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const isFull = variant === "FULL";
  const canSubmit =
    role.trim().length > 0 &&
    form.supplierCompanyName.trim().length > 0 &&
    form.productName.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isFull
            ? "Add External Supplier Product"
            : "Use Existing Manufacturer-Provided Data"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* LIGHT variant ("Use Existing Manufacturer-Provided Data") is
            a lighter-weight version of the FULL "Add External Supplier
            Product" form, for data the manufacturer already has on
            hand from another source. It will never be presented as
            supplier-authoritative (AGENTS.md §10a) — it's recorded
            with sourceType "IMPORTED" (see handleSubmitExternal above),
            distinct from FULL's "MANUFACTURER_PROVIDED", which stands
            in for a supplier the manufacturer intends to invite. */}

        <RoleField role={role} onRoleChange={onRoleChange} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="supplier-company-name">
              {isFull ? "Supplier Company Name *" : "Source / Supplier Name *"}
            </Label>
            <Input
              id="supplier-company-name"
              value={form.supplierCompanyName}
              onChange={(event) =>
                onFieldChange("supplierCompanyName", event.target.value)
              }
              placeholder={
                isFull ? "e.g. Acme Bottling Co." : "e.g. Acme Bottling Co., or “Internal ERP export”"
              }
            />
          </div>
          <div>
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={form.productName}
              onChange={(event) => onFieldChange("productName", event.target.value)}
              placeholder="e.g. Recycled PET Bottle 500ml"
            />
          </div>

          {isFull && (
            <>
              <div>
                <Label htmlFor="supplier-contact-name">Contact Name</Label>
                <Input
                  id="supplier-contact-name"
                  value={form.supplierContactName}
                  onChange={(event) =>
                    onFieldChange("supplierContactName", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="supplier-email">Email</Label>
                <Input
                  id="supplier-email"
                  type="email"
                  value={form.supplierEmail}
                  onChange={(event) =>
                    onFieldChange("supplierEmail", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="supplier-country">Country</Label>
                <Input
                  id="supplier-country"
                  value={form.supplierCountry}
                  onChange={(event) =>
                    onFieldChange("supplierCountry", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="supplier-sku">Supplier SKU</Label>
                <Input
                  id="supplier-sku"
                  value={form.supplierSku}
                  onChange={(event) =>
                    onFieldChange("supplierSku", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="gtin">GTIN</Label>
                <Input
                  id="gtin"
                  value={form.gtin}
                  onChange={(event) => onFieldChange("gtin", event.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="known-material-family">Known Material Family</Label>
            <Input
              id="known-material-family"
              value={form.knownMaterialFamily}
              onChange={(event) =>
                onFieldChange("knownMaterialFamily", event.target.value)
              }
              placeholder="e.g. Plastic"
            />
          </div>
          {isFull && (
            <div>
              <Label htmlFor="known-material-composition">
                Known Material Composition
              </Label>
              <Input
                id="known-material-composition"
                value={form.knownMaterialComposition}
                onChange={(event) =>
                  onFieldChange("knownMaterialComposition", event.target.value)
                }
                placeholder="e.g. PET"
              />
            </div>
          )}
          <div>
            <Label htmlFor="known-weight">Known Weight (grams)</Label>
            <Input
              id="known-weight"
              type="number"
              min="0"
              step="0.1"
              value={form.knownWeightGrams}
              onChange={(event) =>
                onFieldChange("knownWeightGrams", event.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" type="button" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={!canSubmit || isPending}>
          {isPending ? "Adding…" : "Add Component"}
        </Button>
      </CardFooter>
    </Card>
  );
}
