"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { roleLabels } from "@/lib/labels"
import { adminRolesFor, canAccess } from "@/lib/navigation"
import { useRole } from "@/lib/role-context"

export function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { role } = useRole()
  const allowed = adminRolesFor(pathname)

  if (canAccess(role, allowed)) return children

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="size-8" />
      </span>
      <h1 className="font-heading text-2xl text-brun">Accès réservé</h1>
      <p className="text-brun-soft">
        Cette section est réservée aux profils : {allowed.map((r) => roleLabels[r]).join(", ")}. Votre rôle actuel est « {roleLabels[role]} ».
      </p>
      <p className="text-sm text-muted-foreground">Utilisez le sélecteur de rôle en haut de page pour prévisualiser une autre vue.</p>
      <Button asChild className="rounded-full">
        <Link href="/espace">Retour à mon espace</Link>
      </Button>
    </div>
  )
}
