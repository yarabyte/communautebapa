import { CtaLink } from "@/components/brand/cta"
import { BapaLogo } from "@/components/brand/logo"
import { BapaMotif } from "@/components/brand/pattern"

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center">
      <BapaMotif fade="radial" />
      <BapaLogo />
      <p className="font-heading text-outline-dark text-8xl">404</p>
      <h1 className="font-heading text-3xl text-brun">Ce sentier ne mène nulle part</h1>
      <p className="max-w-md text-brun-soft">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <CtaLink href="/" diamond>
          Retour à l&apos;accueil
        </CtaLink>
        <CtaLink href="/espace" variant="outline">
          Mon espace
        </CtaLink>
      </div>
    </main>
  )
}
