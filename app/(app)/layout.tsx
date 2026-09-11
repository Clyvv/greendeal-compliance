import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

// Every existing Stage 1–7 route (supplier/*, manufacturer/*, the root
// "/" redirect) lives inside this route group — route groups add no
// URL segment, so none of those paths changed. This is what still
// gets the full app chrome (Header/Sidebar/RoleSwitcher, role-based
// nav via lib/nav-config.ts); the public /request/[slug] pages
// deliberately live outside this group (see app/request/layout.tsx).
export default function AppRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
