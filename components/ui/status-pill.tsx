import { cn } from "@/lib/utils";

/**
 * The exact status icon set from AGENTS.md §4 — do not invent
 * alternative icons or meanings.
 */
export type StatusPillStatus =
  | "complete"
  | "missing"
  | "pending"
  | "failed"
  | "not-authorized"
  | "not-applicable"
  | "expired";

const STATUS_CONFIG: Record<
  StatusPillStatus,
  { icon: string; label: string; className: string }
> = {
  complete: {
    icon: "✓",
    label: "Complete",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  missing: {
    icon: "⚠",
    label: "Missing",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  pending: {
    icon: "⏳",
    label: "Pending",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  failed: {
    icon: "✕",
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  "not-authorized": {
    icon: "🔒",
    label: "Not authorized",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  "not-applicable": {
    icon: "○",
    label: "Not applicable",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  },
  expired: {
    icon: "⌛",
    label: "Expired",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

export interface StatusPillProps {
  status: StatusPillStatus;
  /** Override the default label text; the icon is always fixed per status. */
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      {label ?? config.label}
    </span>
  );
}
