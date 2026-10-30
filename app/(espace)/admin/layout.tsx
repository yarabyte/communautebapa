import type { Metadata } from "next"

import { RoleGate } from "@/components/admin/role-gate"

export const metadata: Metadata = { title: { template: "%s · Administration · Communauté Bapa", default: "Administration" } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate>{children}</RoleGate>
}
