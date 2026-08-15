import type { Evidence, ProductVersion, SupplierProduct } from "@/lib/types";
import { evidence, productVersions, supplierProducts } from "@/lib/mock-data";

// Maps to: GET /api/v1/suppliers/{supplierId}/products
// TODO: derive supplierId from auth context once real auth exists.
export async function getSupplierProducts(
  supplierId: string
): Promise<SupplierProduct[]> {
  return supplierProducts.filter((product) => product.supplierId === supplierId);
}

// Maps to: GET /api/v1/products/{productId}
export async function getSupplierProduct(
  productId: string
): Promise<SupplierProduct | undefined> {
  return supplierProducts.find((product) => product.id === productId);
}

// Maps to: GET /api/v1/products/{productId}/versions
export async function getProductVersions(
  productId: string
): Promise<ProductVersion[]> {
  return productVersions.filter((version) => version.productId === productId);
}

// Maps to: GET /api/v1/product-versions/{versionId}
export async function getProductVersion(
  versionId: string
): Promise<ProductVersion | undefined> {
  return productVersions.find((version) => version.id === versionId);
}

// Maps to: GET /api/v1/product-versions/{versionId}/evidence
export async function getProductEvidence(
  productVersionId: string
): Promise<Evidence[]> {
  return evidence.filter((item) => item.productVersionId === productVersionId);
}

// Planned for a later stage (see API_CONTRACT.md → mockProductService):
//   createSupplierProduct(supplierId, input)
//   updateProductDraft(productId, input)
//   publishProduct(productId)
//   createProductVersion(productId, input)
//   addEvidence(productVersionId, input)
