"use client"

import { SessionProvider } from "next-auth/react"

import { RoleProvider } from "@/lib/role-context"
import type { Role } from "@/lib/types"

export function SessionRoleProvider({
  children,
  role,
}: {
  children: React.ReactNode
  role?: Role
}) {
  return (
    <SessionProvider>
      <RoleProvider initialRole={role}>{children}</RoleProvider>
    </SessionProvider>
  )
}
