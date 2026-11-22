"use client"

import Link from "next/link"
import { Bell, HandCoins, Hourglass, MessageCircle, Search, UserPen, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { roleLabels } from "@/lib/labels"
import type { Role } from "@/lib/types"

const notifications = [
  { icon: UserPlus, text: "Nouvelles demandes d'inscription à valider", href: "/admin/inscriptions", time: "à traiter" },
  { icon: MessageCircle, text: "Messages de la communauté", href: "/espace/messages", time: "" },
  { icon: HandCoins, text: "Vos contributions", href: "/espace/contributions", time: "" },
]

const pendingNotifications = [
  { icon: Hourglass, text: "Votre demande d'inscription est en cours de validation", href: "/espace", time: "aujourd'hui" },
  { icon: UserPen, text: "Complétez votre profil pour accélérer la validation", href: "/espace/bienvenue", time: "aujourd'hui" },
]

export function Topbar({ pendingAccount = false, realRole }: { pendingAccount?: boolean; realRole?: Role }) {
  return (
    <header className="bapa-header-bg sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-or/40 px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6!" />
      <form action="/espace/annuaire" className="relative hidden max-w-sm flex-1 md:block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" placeholder="Rechercher un membre, une ville, une profession…" className="h-9 rounded-full bg-card pl-9" />
      </form>
      <div className="ml-auto flex items-center gap-2">
        {realRole && (
          <span className="hidden rounded-full border border-or/50 bg-card px-3 py-1 text-xs text-brun-soft sm:inline">
            {pendingAccount ? "En attente" : roleLabels[realRole]}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-terre ring-2 ring-creme-light" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(pendingAccount ? pendingNotifications : notifications).map((n) => (
              <DropdownMenuItem key={n.text} asChild className="items-start gap-3 py-2.5">
                <Link href={n.href}>
                  <n.icon className="mt-0.5 text-terre" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm leading-snug">{n.text}</span>
                    {n.time ? <span className="text-xs text-muted-foreground">{n.time}</span> : null}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
