import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: "Greendeal Compliance",
  description: "Product & Packaging Compliance Platform",
};

// Stage 7.4 — AppShell (Header/Sidebar/RoleSwitcher) moved out of the
// root layout and into app/(app)/layout.tsx, since the public
// /request/[slug] pages (no auth, no role concept for an external
// visitor — AGENTS.md §10a) must render without it. ToastProvider
// stays here at the root — Stage 7.5's request-submission form on the
// public page will need toast() too, and it's harmless/unused chrome-
// wise for a route that doesn't otherwise use it.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans text-slate-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
