"use client"

import { useState } from "react"
import { Check, Clock, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function JoinAssociationButton({ name, className }: { name: string; className?: string }) {
  const [state, setState] = useState<"idle" | "pending">("idle")

  if (state === "pending") {
    return (
      <Button variant="outline" size="sm" disabled className={cn("rounded-full", className)}>
        <Clock /> Demande envoyée
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      className={cn("rounded-full", className)}
      onClick={() => {
        setState("pending")
        toast.success("Demande d'adhésion envoyée", { description: `Le responsable de « ${name} » va examiner votre demande.` })
      }}
    >
      <UserPlus /> Rejoindre
    </Button>
  )
}

export function MemberBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-olive/15 px-2.5 py-1 text-xs font-medium text-olive",
        className
      )}
    >
      <Check className="size-3" /> Membre
    </span>
  )
}
