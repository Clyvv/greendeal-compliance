/**
 * Sidebar navigation config, per role. See AGENTS.md §9.
 *
 * The active role is derived from the URL path (routes are namespaced
 * under /supplier and /manufacturer) rather than kept in separate
 * client state — this keeps the nav, the role switcher, and the page
 * you're actually on always in sync, with no hydration flash.
 */
export type Role = "SUPPLIER" | "MANUFACTURER";

export type NavItem = {
  label: string;
  href: string;
};

export const SUPPLIER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/supplier/dashboard" },
  { label: "Products", href: "/supplier/products" },
  // Stage 7.4 — first of AGENTS.md §10a's suggested nav additions
  // (Request Links, Settings, Suppliers); this is the one that
  // actually has a page behind it now (Settings/Suppliers don't yet).
  { label: "Request Links", href: "/supplier/request-links" },
  { label: "Data Requests", href: "/supplier/data-requests" },
  { label: "Evidence", href: "/supplier/evidence" },
];

export const MANUFACTURER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/manufacturer/dashboard" },
  { label: "Packaging Items", href: "/manufacturer/packaging-items" },
  { label: "Data Requests", href: "/manufacturer/data-requests" },
  { label: "Assessments", href: "/manufacturer/assessments" },
  { label: "Documents", href: "/manufacturer/documents" },
];

export function getRoleFromPathname(pathname: string | null): Role {
  return pathname?.startsWith("/manufacturer") ? "MANUFACTURER" : "SUPPLIER";
}

export function getNavItemsForRole(role: Role): NavItem[] {
  return role === "SUPPLIER" ? SUPPLIER_NAV : MANUFACTURER_NAV;
}

export const ROLE_DASHBOARD_HREF: Record<Role, string> = {
  SUPPLIER: "/supplier/dashboard",
  MANUFACTURER: "/manufacturer/dashboard",
};
