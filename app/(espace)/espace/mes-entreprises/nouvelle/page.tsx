import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BusinessForm } from "@/components/espace/business-form"
import { PageHeader } from "@/components/espace/page-header"
import { getSectors } from "@/lib/data/businesses"
import { getCurrentMember } from "@/lib/data/members"

export const metadata: Metadata = { title: "Nouvelle entreprise" }

export default async function NouvelleEntreprisePage() {
  const [sectors, me] = await Promise.all([getSectors(), getCurrentMember()])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link href="/espace/mes-entreprises" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Mes entreprises
      </Link>
      <PageHeader
        eyebrow="Entrepreneurs Bapa"
        title="Nouvelle entreprise"
        description="Seuls le nom, le secteur, la présentation, la ville et un contact sont obligatoires. Vous pourrez compléter plus tard."
      />
      <BusinessForm sectors={sectors} defaults={{ city: me.city, country: me.country, email: me.email, phone: me.phone }} />
    </div>
  )
}
