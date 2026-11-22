"use client"

import { createContext, useContext, useEffect, useState } from "react"

import type { Role } from "./types"

type RoleContextValue = {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

/** Rôle session (passé depuis le serveur) ; le sélecteur topbar peut encore forcer une vue locale. */
export function RoleProvider({ children, initialRole }: { children: React.ReactNode; initialRole?: Role }) {
  const [role, setRoleState] = useState<Role>(initialRole ?? "MEMBER")

  useEffect(() => {
    if (initialRole) setRoleState(initialRole)
  }, [initialRole])

  const setRole = (next: Role) => {
    setRoleState(next)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole doit être utilisé dans RoleProvider")
  return ctx
}
