import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  default: "border-slate-200 bg-white text-slate-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  destructive: "border-red-200 bg-red-50 text-red-900",
};

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "w-80 max-w-[calc(100vw-2rem)] rounded-md border px-4 py-3 shadow-lg",
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description && (
            <p className="mt-0.5 text-sm opacity-80">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="text-sm leading-none opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
