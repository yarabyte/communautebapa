"use client"

import { createContext, useContext, useEffect, useState } from "react"

import type { Role } from "./types"

const STORAGE_KEY = "bapa-demo-role"

type RoleContextValue = {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

/** Rôle fictif pour prévisualiser l'interface ; sera remplacé par la session authentifiée. */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("SUPER_ADMIN")

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Role | null
    if (saved) setRoleState(saved)
  }, [])

  const setRole = (next: Role) => {
    setRoleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole doit être utilisé dans RoleProvider")
  return ctx
}
