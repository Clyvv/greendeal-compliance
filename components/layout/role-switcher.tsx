"use client";

import { useRouter, usePathname } from "next/navigation";
import { Role, ROLE_DASHBOARD_HREF, getRoleFromPathname } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Role; label: string }[] = [
  { value: "SUPPLIER", label: "Supplier" },
  { value: "MANUFACTURER", label: "Manufacturer" },
];

/** Prototype-only role toggle — no real auth. See AGENTS.md §9.
 * The active role always reflects the current route, and switching
 * navigates to that role's dashboard. */
export function RoleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const role = getRoleFromPathname(pathname);

  const handleSelect = (value: Role) => {
    if (value === role) return;
    router.push(ROLE_DASHBOARD_HREF[value]);
  };

  return (
    <div
      role="group"
      aria-label="Switch role"
      className="inline-flex rounded-md border border-slate-300 bg-slate-100 p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          aria-pressed={role === option.value}
          className={cn(
            "rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors",
            role === option.value
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
