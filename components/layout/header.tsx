"use client";

import { RoleSwitcher } from "./role-switcher";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 md:hidden"
          aria-label="Toggle navigation"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-bold text-white"
            aria-hidden="true"
          >
            GC
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              Greendeal Compliance
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Product &amp; Packaging Compliance Platform
            </p>
          </div>
        </div>
      </div>
      <RoleSwitcher />
    </header>
  );
}
