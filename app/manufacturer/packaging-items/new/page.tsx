import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPackagingItemAction } from "@/lib/packaging/actions";

export default function CreatePackagingItemPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Create Packaging Item
        </h1>
        <p className="text-sm text-slate-500">
          Define a new packaging configuration. Components are added
          separately, in a later stage.
        </p>
      </div>

      <form action={createPackagingItemAction}>
        <Card>
          <CardHeader>
            <CardTitle>Packaging Item Details</CardTitle>
            <CardDescription>
              Per DOMAIN.md §6 — Product Name, SKU, Market, Packaging Type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Coca-Cola 500ml"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                required
                placeholder="e.g. COKE-500"
              />
            </div>
            <div>
              <Label htmlFor="market">Market *</Label>
              <Input
                id="market"
                name="market"
                required
                placeholder="e.g. Germany"
              />
            </div>
            <div>
              <Label htmlFor="packagingType">Packaging Type *</Label>
              <Input
                id="packagingType"
                name="packagingType"
                required
                placeholder="e.g. Bottle"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Link href="/manufacturer/packaging-items">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Create Packaging Item</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
