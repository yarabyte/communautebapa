import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertCircle, ArrowLeft, Eye } from "lucide-react"

import { BusinessForm } from "@/components/espace/business-form"
import { PageHeader } from "@/components/espace/page-header"
import { BusinessStatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { getBusinessById, getJobOffers, getSectors } from "@/lib/data/businesses"
import { getCurrentMember } from "@/lib/data/members"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const b = await getBusinessById((await params).id)
  return { title: b ? `Modifier ${b.name}` : "Entreprise" }
}

export default async function ModifierEntreprisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [business, me, sectors] = await Promise.all([getBusinessById(id), getCurrentMember(), getSectors()])
  if (!business || business.ownerId !== me.id) notFound()
  const jobs = await getJobOffers({ businessId: business.id, openOnly: false })

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link href="/espace/mes-entreprises" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Mes entreprises
      </Link>
      <PageHeader
        eyebrow="Entrepreneurs Bapa"
        title={business.name}
        description={<BusinessStatusBadge status={business.status} />}
        actions={
          business.status === "PUBLISHED" && (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/espace/entrepreneurs/${business.slug}`}>
                <Eye /> Voir la fiche
              </Link>
            </Button>
          )
        }
      />
      {business.status === "REJECTED" && business.reviewNote && (
        <p className="flex items-start gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="font-medium">Motif du refus :</strong> {business.reviewNote}
          </span>
        </p>
      )}
      <BusinessForm sectors={sectors} business={business} jobs={jobs} />
    </div>
  )
}
