"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Eye, HandCoins, Hourglass, MessageCircle, Search, UserPen, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DEMO_PENDING_COOKIE } from "@/lib/demo"
import { roleLabels } from "@/lib/labels"
import { useRole } from "@/lib/role-context"
import type { Role } from "@/lib/types"

const notifications = [
  { icon: UserPlus, text: "4 nouvelles demandes d'inscription à valider", href: "/admin/inscriptions", time: "il y a 1 h" },
  { icon: MessageCircle, text: "Christian Tchoupo vous a écrit dans « Comité du festival »", href: "/espace/messages", time: "il y a 3 h" },
  { icon: HandCoins, text: "Votre contribution au forage a été confirmée", href: "/espace/contributions", time: "hier" },
]

const pendingNotifications = [
  { icon: Hourglass, text: "Votre demande d'inscription est en cours de validation", href: "/espace", time: "aujourd'hui" },
  { icon: UserPen, text: "Complétez votre profil pour accélérer la validation", href: "/espace/bienvenue", time: "aujourd'hui" },
]

const PENDING_VIEW = "PENDING_ACCOUNT"

export function Topbar({ pendingAccount = false }: { pendingAccount?: boolean }) {
  const { role, setRole } = useRole()
  const router = useRouter()

  const changeView = (value: string) => {
    const pending = value === PENDING_VIEW
    document.cookie = `${DEMO_PENDING_COOKIE}=${pending ? "1" : ""}; path=/; max-age=${pending ? 60 * 60 * 24 * 30 : 0}; samesite=lax`
    setRole(pending ? "MEMBER" : (value as Role))
    if (pending !== pendingAccount) router.refresh()
  }

  return (
    <header className="bapa-header-bg sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-or/40 px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6!" />
      <form action="/espace/annuaire" className="relative hidden max-w-sm flex-1 md:block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" placeholder="Rechercher un membre, une ville, une profession…" className="h-9 rounded-full bg-card pl-9" />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Select value={pendingAccount ? PENDING_VIEW : role} onValueChange={changeView}>
          <SelectTrigger size="sm" className="h-9! gap-2 rounded-full border-dashed border-or bg-card text-xs" aria-label="Rôle de démonstration">
            <Eye className="size-3.5 text-or-dark" />
            <span className="hidden text-muted-foreground lg:inline">Vue :</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(roleLabels) as Role[]).map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabels[r]}
              </SelectItem>
            ))}
            <SelectItem value={PENDING_VIEW}>Nouveau membre (en attente)</SelectItem>
          </SelectContent>
        </Select>
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
                    <span className="text-xs text-muted-foreground">{n.time}</span>
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
