"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsForRole, getRoleFromPathname } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getNavItemsForRole(getRoleFromPathname(pathname));

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)} aria-label="Primary">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-50 text-emerald-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
