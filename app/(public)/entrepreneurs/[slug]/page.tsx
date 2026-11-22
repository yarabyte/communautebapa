import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Lock, MessageCircle } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { BusinessDetail } from "@/components/shared/business-detail"
import { BusinessLogo } from "@/components/shared/business-card"
import { getBusiness, getJobOffers, getRecommendations } from "@/lib/data/businesses"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = await getBusiness((await params).slug)
  if (!b || b.status !== "PUBLISHED") return { title: "Entreprise" }
  return b.visibility === "PUBLIC"
    ? { title: b.name, description: b.description.slice(0, 160) }
    : { title: b.name, robots: { index: false } }
}

export default async function EntreprisePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusiness(slug)
  if (!business || business.status !== "PUBLISHED") notFound()
  const memberHref = `/espace/entrepreneurs/${business.slug}`

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <Link href="/entrepreneurs" className="mb-6 flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Annuaire
      </Link>

      {business.visibility === "MEMBERS" ? (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center">
          <BusinessLogo business={business} className="size-16" />
          <div>
            <p className="text-sm text-or-dark">{business.sectorName}</p>
            <h1 className="font-heading text-2xl text-brun">{business.name}</h1>
            <p className="text-sm text-muted-foreground">
              {business.city}, {business.country}
            </p>
          </div>
          <p className="flex items-center gap-2 text-brun-soft">
            <Lock className="size-4 text-or" /> Cette fiche est réservée aux membres de la communauté.
          </p>
          <CtaLink href={`/connexion?redirect=${encodeURIComponent(memberHref)}`} diamond>
            Se connecter pour la voir
          </CtaLink>
        </div>
      ) : (
        <BusinessDetail
          business={business}
          recommendations={await getRecommendations(business.id)}
          jobs={await getJobOffers({ businessId: business.id })}
          mode="public"
          actions={
            <Link
              href={`/connexion?redirect=${encodeURIComponent(memberHref)}`}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-brun hover:bg-secondary"
            >
              <MessageCircle className="size-4" /> Écrire via la messagerie
            </Link>
          }
        />
      )}
    </section>
  )
}
