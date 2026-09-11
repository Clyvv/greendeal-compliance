import type { ExternalSupplierProduct } from "@/lib/types";

// No External Supplier Products are seeded — Stage 7.3 introduces the
// entity type and the Add Component flow that creates them; none exist
// until a manufacturer actually uses that path in the running app (see
// lib/services/mockExternalSupplierService.ts).
export const externalSupplierProducts: ExternalSupplierProduct[] = [];
