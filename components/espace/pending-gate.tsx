"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Hourglass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isAllowedWhilePending } from "@/lib/navigation"

export function PendingGate({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  const pathname = usePathname()

  if (!pending || isAllowedWhilePending(pathname)) return children

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-or/15 text-or-dark">
        <Hourglass className="size-8" />
      </span>
      <h1 className="font-heading text-2xl text-brun">Accessible après validation de votre compte</h1>
      <p className="text-brun-soft">
        Un responsable examine votre demande, généralement sous 48 heures. En attendant, vous pouvez compléter votre profil et présenter
        votre entreprise.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-full">
          <Link href="/espace/profil">Compléter mon profil</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/espace/mes-entreprises">Mes entreprises</Link>
        </Button>
      </div>
    </div>
  )
}
