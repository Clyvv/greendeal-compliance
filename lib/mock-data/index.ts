// Static mock data, one file per entity family, per AGENTS.md §5.
// Components must never import from here directly — go through
// /lib/services instead.

export * from "./organizations";
export * from "./products";
export * from "./product-versions";
export * from "./evidence";
export * from "./packaging-items";
export * from "./packaging-components";
export * from "./data-requests";
export * from "./data-approvals";
export * from "./assessments";
export * from "./external-supplier-products";
