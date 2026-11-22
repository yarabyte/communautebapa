"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Menu, ScrollText, Users, UsersRound } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { BapaLogo } from "@/components/brand/logo"
import { BapaFrieze } from "@/components/brand/pattern"
import { CtaLink } from "@/components/brand/cta"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type NavChild = {
  href: string
  label: string
  description: string
  icon: typeof Users
}

type NavLink = {
  href: string
  label: string
  children?: NavChild[]
}

const communityLinks: NavChild[] = [
  {
    href: "/a-propos",
    label: "La communauté et sa charte",
    description: "Identité, valeurs et engagement commun.",
    icon: ScrollText,
  },
  {
    href: "/a-propos/missions",
    label: "Missions des communautés",
    description: "Ce que portent les communautés au village et ailleurs.",
    icon: UsersRound,
  },
  {
    href: "/a-propos/organisation",
    label: "Organisation Cameroun et diaspora",
    description: "Structure des communautés au Cameroun et à l'étranger.",
    icon: Users,
  },
]

const annuaireLinks: NavChild[] = [
  {
    href: "/annuaire",
    label: "Annuaire des membres",
    description: "Filles et fils de Bapa par quartier, ville ou profession.",
    icon: Users,
  },
  {
    href: "/associations",
    label: "Associations",
    description: "Quartiers d'origine, villes du Cameroun et diaspora.",
    icon: UsersRound,
  },
  {
    href: "/entrepreneurs",
    label: "Annuaire des métiers et expertise",
    description: "Entreprises, savoir-faire et offres de la communauté.",
    icon: BriefcaseBusiness,
  },
]

const links: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "La communauté", children: communityLinks },
  { href: "/entrepreneurs", label: "Annuaire", children: annuaireLinks },
  { href: "/evenements", label: "Événements" },
]

function isActive(pathname: string, href: string, children?: { href: string }[]) {
  if (children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))) return true
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function childActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="bapa-header-bg fixed inset-x-0 top-0 z-50 border-b border-or/50 shadow-[0_14px_30px_-22px_rgba(57,37,23,0.45)]">
      <div aria-hidden className="bapa-header-motif pointer-events-none absolute inset-x-0 top-[3px] bottom-0" />
      <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <BapaLogo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => {
            const active = isActive(pathname, l.href, l.children)
            const itemClass = cn(
              "relative py-1.5 text-sm transition-colors",
              "after:absolute after:inset-x-0 after:-bottom-[3px] after:h-[1.5px] after:origin-center after:scale-x-0 after:bg-[linear-gradient(90deg,transparent,#9C5B34_30%,#9C5B34_70%,transparent)] after:transition-transform hover:text-brun hover:after:scale-x-100",
              active
                ? "font-medium text-terre-dark after:scale-x-100 before:absolute before:-bottom-1.5 before:left-1/2 before:-ml-[3px] before:size-1.5 before:rotate-45 before:bg-terre before:shadow-[0_0_0_2px_#FDF9F1]"
                : "text-brun/70",
            )
            if (l.children) {
              return (
                <DropdownMenu key={l.href}>
                  <DropdownMenuTrigger className={cn(itemClass, "group inline-flex items-center gap-1 outline-none data-[state=open]:text-terre-dark data-[state=open]:after:scale-x-100")}>
                    {l.label}
                    <ChevronDown className="size-3.5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={14}
                    className="w-[22rem] overflow-hidden rounded-2xl border border-or/30 bg-creme-light/95 p-2 shadow-[0_22px_50px_-28px_rgba(57,37,23,0.55)] ring-0 backdrop-blur-md"
                  >
                    <div className="mb-1.5 px-2.5 pt-1.5 pb-1">
                      <p className="text-[10px] font-medium tracking-[0.16em] text-or-dark uppercase">{l.label}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {l.children.map((child) => {
                        const Icon = child.icon
                        const current = childActive(pathname, child.href)
                        return (
                          <DropdownMenuItem key={child.href} asChild className="rounded-none p-0 focus:bg-transparent">
                            <Link
                              href={child.href}
                              className={cn(
                                "group/item flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors",
                                current ? "bg-accent text-terre-dark" : "text-brun hover:bg-secondary/80",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border transition-colors",
                                  current
                                    ? "border-terre/30 bg-creme-light text-terre"
                                    : "border-or/30 bg-secondary/60 text-or-dark group-hover/item:border-terre/30 group-hover/item:text-terre",
                                )}
                              >
                                <Icon className="size-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                  {child.label}
                                  <ArrowUpRight className="size-3.5 opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:opacity-70" />
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{child.description}</span>
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={itemClass}>
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/connexion" className="text-sm font-medium text-brun hover:text-terre">
            Connexion
          </Link>
          <CtaLink href="/inscription" size="sm" diamond>
            Rejoindre
          </CtaLink>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bapa-header-bg w-80">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <BapaLogo />
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((l) =>
                l.children ? (
                  <div key={l.href} className="my-1 overflow-hidden rounded-2xl border border-or/25 bg-card/70">
                    <p className="border-b border-border/70 px-3.5 py-2.5 text-[11px] font-medium tracking-[0.14em] text-or-dark uppercase">
                      {l.label}
                    </p>
                    <div className="flex flex-col p-1.5">
                      {l.children.map((child) => {
                        const Icon = child.icon
                        const current = childActive(pathname, child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors",
                              current ? "bg-accent text-terre-dark" : "text-brun hover:bg-secondary",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border",
                                current ? "border-terre/30 bg-creme-light text-terre" : "border-or/30 bg-secondary/70 text-or-dark",
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium">{child.label}</span>
                              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{child.description}</span>
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px]",
                      isActive(pathname, l.href) ? "bg-accent font-medium text-terre-dark" : "text-brun hover:bg-secondary",
                    )}
                  >
                    <span aria-hidden className="size-1.5 rotate-45 border border-or" />
                    {l.label}
                  </Link>
                ),
              )}
            </nav>
            <div className="mt-auto flex flex-col gap-3 p-4">
              <CtaLink href="/inscription" diamond>
                Rejoindre la communauté
              </CtaLink>
              <CtaLink href="/connexion" variant="outline">
                Se connecter
              </CtaLink>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <BapaFrieze className="absolute -bottom-[7px] left-0" />
    </header>
  )
}
