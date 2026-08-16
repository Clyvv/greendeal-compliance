import type { PackagingComponent, PackagingItem } from "@/lib/types";
import { packagingComponents, packagingItems } from "@/lib/mock-data";
import { MOCK_TODAY } from "@/lib/constants";

// Maps to: GET /api/v1/manufacturers/{manufacturerId}/packaging-items
// TODO: derive manufacturerId from auth context once real auth exists.
export async function getPackagingItems(
  manufacturerId: string
): Promise<PackagingItem[]> {
  return packagingItems.filter(
    (item) => item.manufacturerId === manufacturerId
  );
}

// Maps to: GET /api/v1/packaging-items/{itemId}
export async function getPackagingItem(
  itemId: string
): Promise<PackagingItem | undefined> {
  return packagingItems.find((item) => item.id === itemId);
}

// Maps to: GET /api/v1/packaging-items/{itemId}/components
export async function getPackagingComponents(
  itemId: string
): Promise<PackagingComponent[]> {
  return packagingComponents.filter(
    (component) => component.packagingItemId === itemId
  );
}

export interface CreatePackagingItemInput {
  name: string;
  sku: string;
  market: string;
  packagingType: string;
}

let packagingItemSequence = packagingItems.length + 1;

function generatePackagingItemId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = `pkg-${slug || "item"}-${packagingItemSequence}`;
  packagingItemSequence += 1;
  return id;
}

function today(): string {
  return MOCK_TODAY.toISOString().slice(0, 10);
}

// Maps to: POST /api/v1/manufacturers/{manufacturerId}/packaging-items
// TODO: derive manufacturerId from auth context once real auth exists.
//
// Freshly created items start with zero components — selecting
// supplier products and wiring up components is a later stage's
// concern (addPackagingComponent, still unimplemented below).
export async function createPackagingItem(
  manufacturerId: string,
  input: CreatePackagingItemInput
): Promise<PackagingItem> {
  const item: PackagingItem = {
    id: generatePackagingItemId(input.name),
    manufacturerId,
    name: input.name,
    sku: input.sku,
    market: input.market,
    packagingType: input.packagingType,
    componentIds: [],
    createdAt: today(),
  };
  packagingItems.push(item);
  return item;
}

// Planned for a later stage (see API_CONTRACT.md → mockPackagingService):
//   addPackagingComponent(itemId, input)
//   replaceComponentProduct(componentId, newProductId)
//   getPackagingReadiness(itemId)
