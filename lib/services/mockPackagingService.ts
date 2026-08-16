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

// Maps to: GET /api/v1/packaging-components/{componentId}
// Added in Stage 4 — the Request Data flow route is keyed off a
// componentId directly (rather than filtering an item's component
// list), so a single-record lookup is needed alongside the existing
// per-item list above.
export async function getPackagingComponent(
  componentId: string
): Promise<PackagingComponent | undefined> {
  return packagingComponents.find((component) => component.id === componentId);
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

// Maps to: PATCH /api/v1/packaging-components/{componentId}
// Added in Stage 4 — called right after a Data Request is created for
// this component (see lib/requests/actions.ts) so the component's
// authorizationStatus reflects PENDING immediately, without a page
// refresh workaround. A real backend would likely flip this
// server-side as a side effect of creating the DataRequest; the mock
// keeps it as an explicit second call so mockRequestService stays
// focused on DataRequest records only.
export async function updateComponentAuthorizationStatus(
  componentId: string,
  status: PackagingComponent["authorizationStatus"]
): Promise<PackagingComponent> {
  const component = packagingComponents.find(
    (item) => item.id === componentId
  );
  if (!component) {
    throw new Error(`Unknown packaging component: ${componentId}`);
  }
  component.authorizationStatus = status;
  return component;
}

// Planned for a later stage (see API_CONTRACT.md → mockPackagingService):
//   addPackagingComponent(itemId, input)
//   replaceComponentProduct(componentId, newProductId)
//   getPackagingReadiness(itemId)
