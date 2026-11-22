import type { Metadata } from "next"
import { Check, Hourglass, KeyRound, MailCheck, UserPen } from "lucide-react"

import { AuthHeading } from "@/components/auth/auth-heading"
import { CtaLink } from "@/components/brand/cta"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Compte créé" }

export default async function PendingPage({ searchParams }: { searchParams: Promise<{ email?: string; association?: string }> }) {
  const { email, association } = await searchParams
  const welcome = `/espace/bienvenue${association ? `?association=${encodeURIComponent(association)}` : ""}`

  const timeline = [
    { title: "Compte créé", text: "Vos identifiants sont enregistrés.", state: "done", icon: Check },
    {
      title: "Confirmez votre adresse",
      text: email ? `Un lien de confirmation a été envoyé à ${email}.` : "Un lien de confirmation vous a été envoyé.",
      state: "current",
      icon: MailCheck,
    },
    {
      title: "Complétez votre profil",
      text: "Origines, résidence, associations et, si vous en avez une, votre entreprise. Un profil complet accélère la validation.",
      state: "current",
      icon: UserPen,
    },
    { title: "Validation par un responsable", text: "Délai habituel : 48 heures. Vous serez notifié par email ou SMS.", state: "todo", icon: Hourglass },
    { title: "Accès complet à l'espace membre", text: "Annuaire, projets, contributions et messagerie.", state: "todo", icon: KeyRound },
  ] as const

  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <AuthHeading
        tag="Bienvenue"
        title="Votre compte est créé"
        description="Vous pouvez dès maintenant vous connecter pour compléter votre profil pendant qu'un responsable examine votre demande."
      />
      <ol className="relative flex flex-col gap-6 border-l border-border pl-8">
        {timeline.map((t) => (
          <li key={t.title} className="relative">
            <span
              className={cn(
                "absolute top-0 -left-[49px] flex size-8 items-center justify-center rounded-full border",
                t.state === "done" && "border-olive bg-olive text-creme-light",
                t.state === "current" && "border-terre bg-terre text-creme-light shadow-[0_0_0_4px_rgba(156,91,52,0.15)]",
                t.state === "todo" && "border-border bg-card text-muted-foreground"
              )}
            >
              <t.icon className="size-4" />
            </span>
            <h2 className={cn("font-medium", t.state === "todo" ? "text-muted-foreground" : "text-brun")}>{t.title}</h2>
            <p className="mt-1 text-sm text-brun-soft">{t.text}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <CtaLink href={welcome} diamond>
          Compléter mon profil
        </CtaLink>
        <CtaLink href="/associations" variant="outline">
          Voir les associations
        </CtaLink>
      </div>
      <p className="text-xs text-muted-foreground">
        Démonstration : dans l&apos;espace, choisissez « Nouveau membre (en attente) » dans le sélecteur de rôle pour voir l&apos;accès limité.
      </p>
    </div>
  )
}
