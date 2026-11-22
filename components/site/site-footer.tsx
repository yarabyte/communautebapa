import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { BapaLogo } from "@/components/brand/logo"
import { BapaFrieze, BapaMotif } from "@/components/brand/pattern"
const columns = [
  {
    title: "Communauté",
    links: [
      { href: "/a-propos", label: "La communauté et sa charte" },
      { href: "/a-propos/missions", label: "Missions des communautés" },
      { href: "/a-propos/organisation", label: "Organisation Cameroun et diaspora" },
      { href: "/annuaire", label: "Annuaire des membres" },
      { href: "/associations", label: "Associations" },
      { href: "/entrepreneurs", label: "Annuaire des métiers et expertise" },
      { href: "/evenements", label: "Événements" },
    ],
  },
  {
    title: "Espace membre",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/connexion", label: "Se connecter" },
      { href: "/espace", label: "Mon espace" },
      { href: "/espace/contribuer", label: "Soutenir un projet" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-nuit text-creme-light/85">
      <BapaFrieze />
      <BapaMotif tone="light" fade="radial" className="-z-10 opacity-60" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_2fr] lg:px-12">
        <div className="flex flex-col gap-6">
          <BapaLogo tone="light" />
          <p className="max-w-sm text-sm leading-relaxed text-creme-light/70">
            L&apos;espace numérique des filles et fils du Royaume Bapa, au village, au Cameroun et dans la diaspora.
            Ensemble pour la mémoire, l&apos;entraide et le développement de notre terre.
          </p>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-or-light" /> Bapa, Hauts-Plateaux, Ouest Cameroun
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-or-light" /> communaute@bapa-officiel.com
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-or-light" /> +237 6 00 00 00 00
            </li>
          </ul>
        </div>
        <div className="grid gap-10 sm:grid-cols-2">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-base tracking-wide text-creme-light">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-or-light">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-creme-light/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-creme-light/60 sm:flex-row sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} Royaume Bapa · Communauté Bapa. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-or-light">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-or-light">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
