import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, ClipboardList, KeyRound, MapPin, Star, UserPlus } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { NumberedTile } from "@/components/brand/numbered-tile"
import { PageHero } from "@/components/brand/page-hero"
import { BapaMotif } from "@/components/brand/pattern"
import { Eyebrow, Pill } from "@/components/brand/pill"
import { SectionHeading } from "@/components/brand/section-heading"
import { AssociationTile } from "@/components/shared/association-tile"
import { BusinessLogo } from "@/components/shared/business-card"
import { EventCard } from "@/components/shared/event-card"
import { ProjectCard } from "@/components/shared/project-card"
import { MAIN_SITE_URL } from "@/lib/constants"
import { getAssociationStats, getAssociations } from "@/lib/data/associations"
import { getFeaturedBusiness } from "@/lib/data/businesses"
import { getEvents } from "@/lib/data/content"
import { getProjects } from "@/lib/data/projects"

const steps = [
  { icon: UserPlus, title: "Créer votre compte", text: "En une minute : nom, prénom et email ou téléphone. Google et Facebook aussi." },
  { icon: ClipboardList, title: "Compléter votre profil", text: "Origines, résidence, associations et votre entreprise : à votre rythme, après l'inscription." },
  { icon: BadgeCheck, title: "Validation", text: "Un responsable vérifie votre demande, généralement sous 48 heures." },
  { icon: KeyRound, title: "Accéder à votre espace", text: "Associations, projets, événements et messagerie vous attendent." },
]

const FEATURED = ["as17", "as34", "as73"]

export default async function HomePage() {
  const [associations, associationStats, events, projects, featured] = await Promise.all([
    getAssociations({ publicOnly: true }),
    getAssociationStats(),
    getEvents({ publicOnly: true, upcoming: true }),
    getProjects(),
    getFeaturedBusiness(),
  ])

  return (
    <>
      <PageHero
        size="large"
        image="/images/palais-cour-bapa.jpg"
        eyebrow="Ngouon' a Pa'a · Espace communautaire"
        title="La communauté Bapa"
        description="Au village, dans les villes du Cameroun et dans la diaspora : retrouvez les filles et fils du Royaume Bapa, rejoignez vos associations et soutenez les projets du terroir."
        actions={
          <>
            <CtaLink href="/inscription" size="lg" diamond>
              Rejoindre la communauté
            </CtaLink>
            <CtaLink href="/connexion" size="lg" variant="ghostLight">
              Se connecter
            </CtaLink>
          </>
        }
        stats={[
          { title: `${associationStats.total} associations`, text: "Quartiers, hommes, femmes, villes et diaspora" },
          { title: "2 400 membres", text: "Filles et fils de Bapa" },
          { title: `${associationStats.countries} pays`, text: "Cameroun, Afrique, Europe, Amérique du Nord" },
          { title: "41 M FCFA", text: "Collectés pour les projets du village" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Votre espace"
          title="Tout ce qui nous rassemble, au même endroit"
          description="Un espace réservé aux membres, pensé pour garder le lien avec le village et agir ensemble."
        />
        <div className="mt-10 grid auto-rows-[minmax(18rem,auto)] gap-5 md:grid-cols-2 lg:grid-cols-4">
          <NumberedTile
            num="01"
            tone="creme"
            tag="Espace membre"
            title="Votre profil et votre famille"
            description="Votre quartier d'origine, votre affiliation généalogique, votre ville de résidence : un profil qui vous relie à la communauté et à l'annuaire des membres."
            href="/inscription"
            size="large"
            className="lg:col-span-2"
          />
          <NumberedTile
            num="02"
            tag="Associations"
            title="Vos associations"
            description="Quartiers d'origine, associations des villes du Cameroun et de la diaspora : réunions, documents et discussions de chaque groupe."
            image="/images/festival-bapa-2023.png"
            href="/associations"
          />
          <NumberedTile
            num="03"
            tag="Projets"
            title="Les projets du village"
            description="Eau, santé, éducation, patrimoine : suivez les chantiers et contribuez en FCFA, euros ou dollars."
            image="/images/paysage-bapa.png"
            href="/inscription"
          />
          <NumberedTile
            num="04"
            tone="terre"
            tag="Agenda"
            title="Événements"
            description="Festival Pa'a Ngouo'ok, assemblées, journées culturelles : inscrivez-vous en un clic."
            href="/evenements"
          />
          <NumberedTile
            num="05"
            tone="indigo"
            tag="Entraide"
            title="Messagerie"
            description="Échangez avec les membres, organisez les descentes au village, partagez vos idées."
            href="/inscription"
          />
          <NumberedTile
            num="06"
            tone="olive"
            tag="Transparence"
            title="Documents et comptes"
            description="Statuts, procès-verbaux et rapports financiers accessibles aux membres."
            href="/inscription"
            className="lg:col-span-2"
          />
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-or/30 bg-creme-dark">
        <BapaMotif fade="radial" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[auto_1fr] lg:px-12">
          <div className="relative mx-auto size-48 sm:size-56">
            <span aria-hidden className="animate-bapa-spin absolute -inset-3 rounded-full border-[1.5px] border-dashed border-or/70" />
            <div className="absolute inset-0 overflow-hidden rounded-full border-[5px] border-creme-light shadow-[0_18px_40px_rgba(57,37,23,0.22)]">
              <Image src="/images/roi-bapa.jpg" alt="Sa Majesté le Roi des Bapa" fill sizes="224px" className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <Pill>Le Roi</Pill>
            <blockquote className="font-heading max-w-3xl text-2xl leading-snug text-nuit italic sm:text-3xl">
              « La terre des rochers porte notre mémoire. Le palais, les notables et le peuple n&apos;en font qu&apos;un. »
            </blockquote>
            <p className="max-w-2xl text-brun-soft">
              La communauté Bapa prolonge en ligne l&apos;unité voulue par Sa Majesté : où que nous vivions, nous restons les enfants
              d&apos;une même terre.
            </p>
            <Link href={`${MAIN_SITE_URL}/mot-du-roi.html`} className="flex items-center gap-2 text-sm font-medium text-terre hover:text-terre-dark">
              Lire le mot du Roi sur le site du Royaume <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Associations"
          title="Trouvez votre association"
          description="Chaque membre peut rejoindre une ou plusieurs associations : celle de son quartier d'origine, de sa ville ou de son pays de résidence."
          action={
            <CtaLink href="/associations" variant="outline" size="sm">
              Toutes les associations <ArrowRight />
            </CtaLink>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURED.map((id) => associations.find((a) => a.id === id)).filter((a) => !!a).map((a, i) => (
            <AssociationTile key={a.id} association={a} href={`/associations/${a.slug}`} num={`0${i + 1}`} className="min-h-96" />
          ))}
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="Entrepreneur du mois"
            title="Faites travailler la communauté"
            description="Chaque mois, le bureau met en avant une entreprise tenue par un fils ou une fille de Bapa."
            action={
              <CtaLink href="/entrepreneurs" variant="outline" size="sm">
                Voir l&apos;annuaire <ArrowRight />
              </CtaLink>
            }
          />
          <Link
            href={`/entrepreneurs/${featured.slug}`}
            className="group mt-10 grid overflow-hidden rounded-3xl border border-or/50 bg-card shadow-[0_18px_40px_-28px_rgba(57,37,23,0.55)] transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(57,37,23,0.45)] md:grid-cols-[minmax(0,17rem)_1fr]"
          >
            <div className={`tone-${featured.tone} relative isolate flex flex-col justify-between gap-6 p-6 text-creme-light sm:p-7`}>
              <BapaMotif tone="light" fade="corner" className="-z-10" />
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-creme-light/15 px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase">
                <Star className="size-3 fill-or-light text-or-light" />
                Du mois
              </span>
              <div className="flex flex-col gap-3">
                <BusinessLogo business={featured} className="size-14 border-2 border-creme-light/40 text-sm" />
                <p className="text-xs tracking-wide text-creme-light/75 uppercase">{featured.sectorName}</p>
                <h3 className="font-heading text-2xl leading-tight">{featured.name}</h3>
              </div>
            </div>
            <div className="flex flex-col gap-5 p-6 sm:p-7">
              <p className="line-clamp-3 text-sm leading-relaxed text-brun-soft sm:text-base">{featured.description}</p>
              <ul className="flex flex-wrap gap-1.5">
                {featured.services.slice(0, 4).map((s) => (
                  <li key={s.name} className="rounded-full border border-or/40 bg-secondary/70 px-2.5 py-1 text-xs text-brun">
                    {s.name}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-or/30 pt-4">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-terre" />
                  <span>
                    {featured.city}, {featured.country}
                    <span className="text-brun"> · {featured.ownerName}</span>
                  </span>
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-terre px-3.5 py-1.5 text-sm font-medium text-creme-light">
                  Voir la fiche
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="bg-creme-light/60 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="Projets du village"
            title="Ensemble, nous bâtissons Bapa"
            description="Orange Money, MTN Mobile Money, carte bancaire, PayPal ou espèces auprès du trésorier : chaque contribution compte et reçoit un reçu."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {projects.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} href="/inscription" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Agenda"
          title="Prochains événements"
          action={
            <CtaLink href="/evenements" variant="outline" size="sm">
              Tout l&apos;agenda <ArrowRight />
            </CtaLink>
          }
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} href={`/evenements/${e.slug}`} />
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-nuit text-creme-light">
        <BapaMotif tone="light" fade="corner" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-3">
            <Eyebrow light>Adhésion</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl">Rejoindre la communauté en 4 étapes</h2>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border border-creme-light/15 bg-creme-light/5 p-6 backdrop-blur-sm">
                <span className="font-heading text-outline absolute top-5 right-6 text-4xl">0{i + 1}</span>
                <s.icon className="size-8 text-or-light" />
                <h3 className="font-heading mt-6 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-creme-light/75">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap gap-3">
            <CtaLink href="/inscription" size="lg" diamond>
              Commencer mon inscription
            </CtaLink>
            <CtaLink href="/a-propos" size="lg" variant="ghostLight">
              Lire la charte
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  )
}
