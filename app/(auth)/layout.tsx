import Image from "next/image"
import Link from "next/link"

import { BapaLogo } from "@/components/brand/logo"
import { BapaFrieze, BapaMotif } from "@/components/brand/pattern"
import { Eyebrow } from "@/components/brand/pill"
import { MAIN_SITE_URL } from "@/lib/constants"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="relative isolate flex flex-col">
        <BapaMotif fade="radial" className="opacity-60" />
        <header className="flex items-center justify-between px-5 py-5 sm:px-10">
          <BapaLogo />
          <Link href={MAIN_SITE_URL} className="hidden text-sm text-brun/70 hover:text-terre sm:block">
            bapa-officiel.com
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-5 py-8 sm:px-10 lg:items-center">{children}</main>
        <footer className="flex flex-wrap justify-center gap-5 px-5 py-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-terre">
            Accueil
          </Link>
          <Link href="/faq" className="hover:text-terre">
            Aide
          </Link>
          <Link href="/confidentialite" className="hover:text-terre">
            Confidentialité
          </Link>
          <Link href="/mentions-legales" className="hover:text-terre">
            Mentions légales
          </Link>
        </footer>
      </div>

      <aside className="relative isolate hidden overflow-hidden bg-nuit text-creme-light lg:block">
        <Image src="/images/hero-rochers-bapa.png" alt="" fill priority sizes="45vw" className="-z-20 object-cover" />
        <div aria-hidden className="bapa-photo-overlay absolute inset-0 -z-10" />
        <BapaMotif tone="light" fade="corner" className="-z-10 opacity-50" />
        <BapaFrieze className="absolute top-0 left-0" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-12">
          <Eyebrow light>Ngouon&apos; a Pa&apos;a</Eyebrow>
          <blockquote className="font-heading max-w-lg text-3xl leading-snug">
            « Où que nous soyons, nous restons les enfants de la terre des rochers. »
          </blockquote>
          <p className="max-w-md text-sm text-creme-light/80">
            Rejoignez les filles et fils de Bapa au village, au Cameroun et dans la diaspora.
          </p>
        </div>
      </aside>
    </div>
  )
}
