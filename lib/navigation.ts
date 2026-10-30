import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Store,
  BarChart3,
  CalendarDays,
  FileText,
  FolderKanban,
  HandCoins,
  Home,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Settings,
  ShieldAlert,
  UserCircle,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import type { Role } from "./types"

export type NavItem = { href: string; label: string; icon: LucideIcon; roles?: Role[]; badgeKey?: "pending" | "messages" | "reported" | "businesses" }
export type NavGroup = { label: string; items: NavItem[] }

export const memberNav: NavGroup[] = [
  {
    label: "Mon espace",
    items: [
      { href: "/espace", label: "Tableau de bord", icon: Home },
      { href: "/espace/profil", label: "Mon profil", icon: UserCircle },
      { href: "/espace/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" },
    ],
  },
  {
    label: "Communauté",
    items: [
      { href: "/espace/associations", label: "Associations", icon: UsersRound },
      { href: "/espace/annuaire", label: "Annuaire", icon: Users },
      { href: "/espace/actualites", label: "Actualités", icon: Newspaper },
      { href: "/espace/evenements", label: "Événements", icon: CalendarDays },
      { href: "/espace/forum", label: "Forum", icon: MessagesSquare },
      { href: "/espace/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Village",
    items: [
      { href: "/espace/projets", label: "Projets", icon: FolderKanban },
      { href: "/espace/contributions", label: "Mes contributions", icon: HandCoins },
    ],
  },
  {
    label: "Économie",
    items: [
      { href: "/espace/entrepreneurs", label: "Entrepreneurs Bapa", icon: Store },
      { href: "/espace/emplois", label: "Offres d'emploi", icon: BriefcaseBusiness },
      { href: "/espace/mes-entreprises", label: "Mes entreprises", icon: Building2 },
    ],
  },
]

/** Pages ouvertes à un membre dont l'inscription n'est pas encore validée. */
const PENDING_ALLOWED = ["/espace/bienvenue", "/espace/profil", "/espace/mes-entreprises", "/espace/parametres"]

export function isAllowedWhilePending(pathname: string) {
  return pathname === "/espace" || PENDING_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

const ALL_ADMINS: Role[] = ["SUPER_ADMIN", "ASSOCIATION_ADMIN", "TREASURER"]
const CONTENT_ADMINS: Role[] = ["SUPER_ADMIN", "ASSOCIATION_ADMIN"]
const FINANCE_ADMINS: Role[] = ["SUPER_ADMIN", "TREASURER"]

export const adminNav: NavGroup[] = [
  {
    label: "Administration",
    items: [
      { href: "/admin", label: "Vue d'ensemble", icon: BarChart3, roles: ALL_ADMINS },
      { href: "/admin/inscriptions", label: "Inscriptions", icon: BadgeCheck, roles: CONTENT_ADMINS, badgeKey: "pending" },
      { href: "/admin/membres", label: "Membres", icon: Users, roles: ["SUPER_ADMIN"] },
      { href: "/admin/associations", label: "Associations", icon: UsersRound, roles: CONTENT_ADMINS },
      { href: "/admin/evenements", label: "Événements", icon: CalendarDays, roles: CONTENT_ADMINS },
      { href: "/admin/actualites", label: "Actualités", icon: Newspaper, roles: CONTENT_ADMINS },
      { href: "/admin/projets", label: "Projets", icon: FolderKanban, roles: FINANCE_ADMINS },
      { href: "/admin/contributions", label: "Contributions", icon: HandCoins, roles: FINANCE_ADMINS },
      { href: "/admin/documents", label: "Documents", icon: FileText, roles: CONTENT_ADMINS },
      { href: "/admin/entrepreneurs", label: "Entrepreneurs", icon: Store, roles: CONTENT_ADMINS, badgeKey: "businesses" },
      { href: "/admin/forum", label: "Modération", icon: ShieldAlert, roles: CONTENT_ADMINS, badgeKey: "reported" },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings, roles: ["SUPER_ADMIN"] },
    ],
  },
]

export function canAccess(role: Role, roles?: Role[]) {
  return !roles || roles.includes(role)
}

export function adminRolesFor(pathname: string) {
  const item = adminNav[0].items
    .filter((i) => pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length)[0]
  return item?.roles ?? ALL_ADMINS
}
