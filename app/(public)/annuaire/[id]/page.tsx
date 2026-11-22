import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"

import { CtaLink } from "@/components/brand/cta"
import { ProfileHeader } from "@/components/espace/profile-header"
import { SectionCard } from "@/components/espace/section-card"
import { BusinessCard } from "@/components/shared/business-card"
import { Badge } from "@/components/ui/badge"
import { getMemberAssociations } from "@/lib/data/associations"
import { getBusinesses } from "@/lib/data/businesses"
import { getMember } from "@/lib/data/members"
import { membershipRoleLabels } from "@/lib/labels"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = await getMember((await params).id)
  return { title: m ? `${m.firstName} ${m.lastName}` : "Membre" }
}

export default async function PublicMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getMember(id)
  if (!member || member.status !== "ACTIVE" || !member.showInDirectory) notFound()

  const [associations, businesses] = await Promise.all([
    getMemberAssociations(member.id),
    getBusinesses({ ownerId: member.id, status: "PUBLISHED", publicOnly: true }),
  ])
  const loginHref = `/connexion?redirect=${encodeURIComponent(`/espace/messages?a=${member.id}`)}`

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12">
      <Link href="/annuaire" className="mb-6 flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Retour à l&apos;annuaire
      </Link>

      <div className="flex flex-col gap-6">
        <ProfileHeader
          member={member}
          actions={
            <CtaLink href={loginHref}>
              <MessageCircle /> Se connecter pour écrire
            </CtaLink>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <SectionCard title="Présentation">
            <p className="leading-relaxed text-brun-soft">
              {member.bio ?? `${member.firstName} n'a pas encore rédigé de présentation.`}
            </p>
          </SectionCard>
          <SectionCard title="Contacter" contentClassName="flex flex-col gap-3 text-sm">
            <p className="text-brun-soft">Les messages sont réservés aux membres connectés.</p>
            <CtaLink href={loginHref} variant="outline" size="sm">
              Se connecter
            </CtaLink>
          </SectionCard>
        </div>

        {associations.length > 0 && (
          <SectionCard title="Associations" contentClassName="grid gap-3 sm:grid-cols-2">
            {associations.map(({ association, membership }) => (
              <Link
                key={association.id}
                href={`/associations/${association.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:border-terre/40"
              >
                <span className="truncate text-sm font-medium text-brun">{association.name}</span>
                <Badge variant="outline">{membershipRoleLabels[membership.role]}</Badge>
              </Link>
            ))}
          </SectionCard>
        )}

        {businesses.length > 0 && (
          <SectionCard
            title={businesses.length > 1 ? "Ses entreprises" : "Son entreprise"}
            contentClassName="grid gap-4 md:grid-cols-2"
          >
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} href={`/entrepreneurs/${b.slug}`} />
            ))}
          </SectionCard>
        )}
      </div>
    </section>
  )
}
