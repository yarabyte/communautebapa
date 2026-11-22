import type { Metadata } from "next"
import { Suspense } from "react"
import { Users } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { PageHero } from "@/components/brand/page-hero"
import { DirectoryFilters } from "@/components/espace/directory-filters"
import { MemberCard } from "@/components/espace/member-card"
import { getCountries, getMembers, getQuartiers } from "@/lib/data/members"

export const metadata: Metadata = {
  title: "Annuaire des membres",
  description: "Retrouvez les filles et fils de Bapa par quartier d'origine, pays de résidence ou profession.",
}

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ q?: string; quartier?: string; pays?: string; profession?: string }>

export default async function PublicAnnuairePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const [members, quartiers, countries] = await Promise.all([
    getMembers({
      status: "ACTIVE",
      directoryOnly: true,
      q: sp.q,
      quartierId: sp.quartier,
      country: sp.pays,
      profession: sp.profession,
    }),
    getQuartiers(),
    getCountries(),
  ])

  return (
    <>
      <PageHero
        image="/images/chefferie-bapa.jpg"
        eyebrow="Communauté"
        title="Annuaire des membres"
        description="Retrouvez les filles et fils de Bapa par quartier d'origine, pays de résidence ou profession."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Annuaire", href: "/annuaire" },
          { label: "Membres" },
        ]}
        stats={[
          { title: String(members.length), text: "membres visibles" },
          { title: String(countries.length), text: "pays représentés" },
        ]}
      />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <Suspense>
          <DirectoryFilters quartiers={quartiers} countries={countries} />
        </Suspense>

        <p className="mt-6 text-sm text-muted-foreground">
          {members.length} membre{members.length > 1 ? "s" : ""} trouvé{members.length > 1 ? "s" : ""}
        </p>

        {members.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} hrefBase="/annuaire" showMessage={false} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center">
            <Users className="size-10 text-or" />
            <p className="font-medium text-brun">Aucun membre ne correspond à votre recherche</p>
            <p className="text-sm text-muted-foreground">Essayez d&apos;élargir les filtres.</p>
          </div>
        )}

        <div className="mt-14 flex flex-col items-start gap-5 rounded-3xl border border-or/40 bg-gradient-to-br from-creme-light via-creme to-accent/40 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-heading text-2xl tracking-wide text-brun">Vous êtes fille ou fils de Bapa ?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brun-soft">
              Créez votre compte pour apparaître dans l&apos;annuaire, rejoindre vos associations et contacter les autres membres.
            </p>
          </div>
          <CtaLink href="/inscription" diamond className="shrink-0">
            Créer mon compte
          </CtaLink>
        </div>
      </section>
    </>
  )
}
