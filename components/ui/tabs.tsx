"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface TabDefinition {
  id: string;
  label: string;
  /** Optional count badge next to the label, e.g. "Evidence (3)". */
  badge?: number;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabDefinition[];
  defaultTabId?: string;
}

/**
 * Simple, dependency-free tab primitive — no animation, keeps content
 * scannable per AGENTS.md §4 rather than a long unstructured scroll.
 */
export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product detail sections"
        className="flex flex-wrap gap-1 border-b border-slate-200"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {activeTab?.content}
      </div>
    </div>
  );
}
