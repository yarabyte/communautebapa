"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { BapaLogo } from "@/components/brand/logo"
import { BapaFrieze } from "@/components/brand/pattern"
import { CtaLink } from "@/components/brand/cta"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Accueil" },
  { href: "/associations", label: "Associations" },
  { href: "/entrepreneurs", label: "Entrepreneurs" },
  { href: "/evenements", label: "Événements" },
  { href: "/a-propos", label: "La communauté" },
]

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
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
            const active = isActive(pathname, l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-1.5 text-sm transition-colors",
                  "after:absolute after:inset-x-0 after:-bottom-[3px] after:h-[1.5px] after:origin-center after:scale-x-0 after:bg-[linear-gradient(90deg,transparent,#9C5B34_30%,#9C5B34_70%,transparent)] after:transition-transform hover:text-brun hover:after:scale-x-100",
                  active
                    ? "font-medium text-terre-dark after:scale-x-100 before:absolute before:-bottom-1.5 before:left-1/2 before:-ml-[3px] before:size-1.5 before:rotate-45 before:bg-terre before:shadow-[0_0_0_2px_#FDF9F1]"
                    : "text-brun/70"
                )}
              >
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
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px]",
                    isActive(pathname, l.href) ? "bg-accent font-medium text-terre-dark" : "text-brun hover:bg-secondary"
                  )}
                >
                  <span aria-hidden className="size-1.5 rotate-45 border border-or" />
                  {l.label}
                </Link>
              ))}
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
