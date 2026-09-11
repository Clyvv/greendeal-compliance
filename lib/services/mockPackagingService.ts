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
// Accepts `undefined` (Stage 7.5) so callers resolving a DataRequest's
// now-optional packagingItemId (unset for PUBLIC_REQUEST_LINK
// submissions, which aren't "for" any Greendeal packaging item — see
// lib/types/data-request.ts) don't need a ternary at every call site —
// same pattern mockProductService's getters use for optional
// PackagingComponent foreign keys (Stage 7.3).
export async function getPackagingItem(
  itemId: string | undefined
): Promise<PackagingItem | undefined> {
  if (!itemId) return undefined;
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

// Maps to: GET /api/v1/packaging-items/{itemId}/components?supplierProductId=
// Added in Stage 5 — approving/rejecting a Data Request needs to find
// the component(s) it was requested for, since DataRequest itself only
// stores packagingItemId + supplierProductId, not a componentId
// (DOMAIN.md §3). Returns an array since nothing in the domain model
// strictly forbids the same supplier product being used by more than
// one component on an item, even though today's sample data never
// does that.
// Accepts an undefined packagingItemId (Stage 7.5) for the same reason
// getPackagingItem above does — a PUBLIC_REQUEST_LINK DataRequest has
// none, and there's never a real component to find for it anyway (no
// packaging item means nothing to correlate against), so this just
// returns an empty list rather than requiring every caller to guard it.
export async function getPackagingComponentsByProduct(
  packagingItemId: string | undefined,
  supplierProductId: string
): Promise<PackagingComponent[]> {
  if (!packagingItemId) return [];
  return packagingComponents.filter(
    (component) =>
      component.packagingItemId === packagingItemId &&
      component.supplierProductId === supplierProductId
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

let componentSequence = packagingComponents.length + 1;

function generateComponentId(role: string): string {
  const slug = role
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = `pkgc-${slug || "component"}-${componentSequence}`;
  componentSequence += 1;
  return id;
}

// Stage 7.3 — a component is added from exactly one of two sources,
// never both, and never partially. Modeled as a real discriminated
// union (rather than one loose object with optional fields for both
// cases) so `addPackagingComponent` itself — and every caller building
// this input — is forced by the type checker to supply exactly the
// fields that make sense for the chosen source, with no way to
// accidentally mix a supplierProductId into an EXTERNAL_SUPPLIER_PRODUCT
// input or vice versa. See STAGE_7_REVIEW.md §6a, which flagged this as
// the first genuinely new decision point in the whole component-
// creation flow.
export type AddPackagingComponentInput =
  | {
      source: "SUPPLIER_PRODUCT";
      role: string;
      supplierProductId: string;
      productVersionId: string;
    }
  | {
      source: "EXTERNAL_SUPPLIER_PRODUCT";
      role: string;
      externalSupplierProductId: string;
    };

// Maps to: POST /api/v1/packaging-items/{itemId}/components
// Did not exist before Stage 7.3 (confirmed gap — STAGE_7_REVIEW.md
// §5.2): createPackagingItem always produced componentIds: [] with no
// follow-up. This is that follow-up, for both native and external
// sources. A brand-new component always starts NOT_REQUESTED/MISSING —
// even the EXTERNAL_SUPPLIER_PRODUCT case, since PackagingComponent's
// authorizationStatus/dataAvailability fields aren't optional and there
// isn't a more meaningful pair of values to store for "no supplier org
// exists yet to request from" than the same defaults a fresh native
// component gets. PackagingComponentCard (Stage 7.2/7.3) is what
// actually renders an external component differently — see that
// component's dispatch on externalSupplierProductId — this service
// layer doesn't invent new enum values just to special-case display.
export async function addPackagingComponent(
  itemId: string,
  input: AddPackagingComponentInput
): Promise<PackagingComponent> {
  const item = packagingItems.find((packagingItem) => packagingItem.id === itemId);
  if (!item) {
    throw new Error(`Unknown packaging item: ${itemId}`);
  }
  if (!input.role.trim()) {
    throw new Error("Component role is required.");
  }

  const component: PackagingComponent =
    input.source === "SUPPLIER_PRODUCT"
      ? {
          id: generateComponentId(input.role),
          packagingItemId: itemId,
          role: input.role,
          supplierProductId: input.supplierProductId,
          productVersionId: input.productVersionId,
          authorizationStatus: "NOT_REQUESTED",
          dataAvailability: "MISSING",
        }
      : {
          id: generateComponentId(input.role),
          packagingItemId: itemId,
          role: input.role,
          externalSupplierProductId: input.externalSupplierProductId,
          authorizationStatus: "NOT_REQUESTED",
          dataAvailability: "MISSING",
        };

  packagingComponents.push(component);
  item.componentIds.push(component.id);
  return component;
}

// Maps to: DELETE /api/v1/packaging-components/{componentId}
// Lets a manufacturer undo adding a component (native or external) by
// mistake — addPackagingComponent commits immediately, with no draft
// state to back out of otherwise. Removes the component itself and
// its id from the parent PackagingItem.componentIds, but deliberately
// does NOT touch any DataRequest/DataApproval records raised against
// it — those stay as historical entries (this app's audit-focused
// principle, AGENTS.md §4) rather than being deleted; they just no
// longer correspond to an active component. A real backend would
// likely soft-delete for the same reason.
export async function removeComponent(componentId: string): Promise<void> {
  const componentIndex = packagingComponents.findIndex(
    (item) => item.id === componentId
  );
  if (componentIndex === -1) {
    throw new Error(`Unknown packaging component: ${componentId}`);
  }
  const [component] = packagingComponents.splice(componentIndex, 1);

  const item = packagingItems.find(
    (packagingItem) => packagingItem.id === component.packagingItemId
  );
  if (item) {
    item.componentIds = item.componentIds.filter((id) => id !== componentId);
  }
}

// Planned for a later stage (see API_CONTRACT.md → mockPackagingService):
//   replaceComponentProduct(componentId, newProductId)
//   getPackagingReadiness(itemId)
