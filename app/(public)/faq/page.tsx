import type { Metadata } from "next"
import { Mail, MessageCircle } from "lucide-react"

import { PageHero } from "@/components/brand/page-hero"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = { title: "Aide et FAQ" }

const sections = [
  {
    title: "Inscription et compte",
    items: [
      {
        q: "Qui peut s'inscrire ?",
        a: "Toute personne originaire de Bapa par naissance, filiation ou alliance. Les amis du village peuvent aussi s'inscrire en précisant leur lien avec la communauté.",
      },
      {
        q: "Pourquoi mon compte doit-il être validé ?",
        a: "La validation protège les membres et l'annuaire. Un responsable vérifie vos informations d'origine, généralement sous 48 heures. Vous êtes prévenu par email ou SMS.",
      },
      {
        q: "Puis-je me connecter sans mot de passe ?",
        a: "Oui : par code reçu par SMS ou WhatsApp, par lien magique envoyé par email, ou avec votre compte Google ou Facebook.",
      },
      { q: "J'ai oublié mon mot de passe", a: "Utilisez le lien « Mot de passe oublié » sur la page de connexion pour recevoir un lien de réinitialisation." },
    ],
  },
  {
    title: "Associations",
    items: [
      { q: "Puis-je rejoindre plusieurs associations ?", a: "Oui, chaque membre peut appartenir à plusieurs associations : celle de sa ville, de sa génération, de ses engagements." },
      {
        q: "Comment référencer mon association ?",
        a: "Après votre inscription, contactez le bureau de la communauté depuis la messagerie. Les responsables d'associations disposent d'outils de gestion dédiés.",
      },
    ],
  },
  {
    title: "Contributions et paiements",
    items: [
      {
        q: "Quels moyens de paiement sont acceptés ?",
        a: "Orange Money, MTN Mobile Money, carte bancaire, PayPal, ainsi que les espèces remises au trésorier qui les enregistre dans la plateforme.",
      },
      { q: "Puis-je contribuer en euros ou en dollars ?", a: "Oui. Les montants sont convertis en FCFA à titre indicatif pour le suivi des projets." },
      { q: "Vais-je recevoir un reçu ?", a: "Chaque contribution confirmée génère un reçu téléchargeable dans « Mes contributions », envoyé aussi par email." },
    ],
  },
]

export default function FaqPage() {
  return (
    <>
      <PageHero
        image="/images/hero-rochers-bapa.png"
        eyebrow="Aide"
        title="Questions fréquentes"
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Aide" }]}
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[2fr_1fr] lg:px-12">
        <div className="flex flex-col gap-12">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-heading text-2xl text-brun">{s.title}</h2>
              <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-5">
                {s.items.map((it) => (
                  <AccordionItem key={it.q} value={it.q}>
                    <AccordionTrigger className="text-left text-[15px]">{it.q}</AccordionTrigger>
                    <AccordionContent className="leading-relaxed text-brun-soft">{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        <aside className="tone-creme flex h-fit flex-col gap-4 rounded-3xl border border-or/40 p-6 lg:sticky lg:top-28">
          <h2 className="font-heading text-xl text-brun">Besoin d&apos;aide ?</h2>
          <p className="text-sm text-brun-soft">L&apos;équipe de la communauté vous répond du lundi au samedi.</p>
          <a href="mailto:communaute@bapa-officiel.com" className="flex items-center gap-3 text-sm text-terre hover:underline">
            <Mail className="size-4" /> communaute@bapa-officiel.com
          </a>
          <a href="https://wa.me/237600000000" className="flex items-center gap-3 text-sm text-terre hover:underline">
            <MessageCircle className="size-4" /> WhatsApp : +237 6 00 00 00 00
          </a>
        </aside>
      </section>
    </>
  )
}
