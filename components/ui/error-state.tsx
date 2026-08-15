import { ReactNode } from "react";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-16 text-center">
      <span className="text-lg text-red-600" aria-hidden="true">
        ✕
      </span>
      <p className="mt-1 text-sm font-medium text-red-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-red-700">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
