"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDown, ExternalLink, Lock, LogOut, Settings, UserCircle } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MAIN_SITE_URL } from "@/lib/constants"
import { roleLabels } from "@/lib/labels"
import { adminNav, canAccess, isAllowedWhilePending, memberNav, type NavGroup } from "@/lib/navigation"
import { useRole } from "@/lib/role-context"
import type { Member } from "@/lib/types"
import { MemberAvatar } from "./member-avatar"

type Badges = { pending: number; messages: number; reported: number; businesses: number }

function isActive(pathname: string, href: string) {
  if (href === "/espace" || href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ member, badges, pendingAccount = false }: { member: Member; badges: Badges; pendingAccount?: boolean }) {
  const pathname = usePathname()
  const { role } = useRole()

  const groups: NavGroup[] = [
    ...memberNav,
    ...(pendingAccount ? [] : adminNav)
      .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(role, i.roles)) }))
      .filter((g) => g.items.length > 0),
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative overflow-hidden border-b border-sidebar-border">
        <BapaMotif fade="left" className="opacity-60" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/espace">
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-or/70 bg-creme-light">
                  <Image src="/images/logo-bapa.png" alt="" width={24} height={28} className="h-7 w-auto" />
                </span>
                <span className="flex flex-col gap-0.5 leading-none">
                  <small className="text-[9px] tracking-[0.28em] text-or uppercase">Ngouon&apos; a Pa&apos;a</small>
                  <b className="font-heading text-[15px] font-semibold tracking-[0.06em] text-brun">Communauté Bapa</b>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10.5px] tracking-[0.2em] text-or-dark uppercase">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const badge = item.badgeKey ? badges[item.badgeKey] : 0
                  if (pendingAccount && !isAllowedWhilePending(item.href)) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          aria-disabled
                          tooltip={`${item.label} · après validation`}
                          className="cursor-not-allowed text-muted-foreground/70 hover:bg-transparent hover:text-muted-foreground/70"
                        >
                          <item.icon />
                          <span>{item.label}</span>
                          <Lock className="ml-auto size-3.5" />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(pathname, item.href)}
                        tooltip={item.label}
                        className="data-[active=true]:font-medium data-[active=true]:text-terre-dark"
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {badge > 0 && <SidebarMenuBadge className="rounded-full bg-terre text-[10px] text-creme-light">{badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <MemberAvatar member={member} className="size-8" />
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{pendingAccount ? "En attente de validation" : roleLabels[role]}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-brun">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/espace/profil">
                    <UserCircle /> Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/espace/parametres">
                    <Settings /> Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={MAIN_SITE_URL}>
                    <ExternalLink /> Site du Royaume Bapa
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild variant="destructive">
                  <Link href="/connexion">
                    <LogOut /> Se déconnecter
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
