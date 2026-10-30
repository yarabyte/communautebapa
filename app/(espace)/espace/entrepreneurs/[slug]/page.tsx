import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MessageCircle, Pencil } from "lucide-react"

import { RecommendButton } from "@/components/espace/recommend-button"
import { BusinessDetail } from "@/components/shared/business-detail"
import { Button } from "@/components/ui/button"
import { getBusiness, getJobOffers, getRecommendations } from "@/lib/data/businesses"
import { getCurrentMember } from "@/lib/data/members"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = await getBusiness((await params).slug)
  return { title: b?.name ?? "Entreprise" }
}

export default async function EspaceEntreprisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [business, me] = await Promise.all([getBusiness(slug), getCurrentMember()])
  const isOwner = business?.ownerId === me.id
  if (!business || (business.status !== "PUBLISHED" && !isOwner)) notFound()

  const [recommendations, jobs] = await Promise.all([getRecommendations(business.id), getJobOffers({ businessId: business.id })])

  return (
    <div className="flex flex-col gap-6">
      <Link href="/espace/entrepreneurs" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Entrepreneurs Bapa
      </Link>
      <BusinessDetail
        business={business}
        recommendations={recommendations}
        jobs={jobs}
        mode="member"
        actions={
          isOwner ? (
            <Button asChild variant="outline" className="h-10 rounded-full">
              <Link href={`/espace/mes-entreprises/${business.id}`}>
                <Pencil /> Modifier ma fiche
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="h-10 rounded-full">
                <Link href={`/espace/messages?a=${business.ownerId}`}>
                  <MessageCircle /> Envoyer un message
                </Link>
              </Button>
              <RecommendButton
                businessName={business.name}
                count={business.recommendationsCount}
                initiallyRecommended={recommendations.some((r) => r.memberId === me.id)}
              />
            </>
          )
        }
      />
    </div>
  )
}
