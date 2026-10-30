import type { Metadata } from "next"

import { PageHeader } from "@/components/espace/page-header"
import { PaymentWizard } from "@/components/espace/payment-wizard"
import { getProjects } from "@/lib/data/projects"

export const metadata: Metadata = { title: "Contribuer" }

export default async function ContribuerPage({ searchParams }: { searchParams: Promise<{ projet?: string }> }) {
  const { projet } = await searchParams
  const projects = (await getProjects()).filter((p) => p.status !== "TERMINE")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Soutenir Bapa" title="Contribuer à un projet" description="En FCFA, euros ou dollars, par mobile money, carte, PayPal ou espèces." />
      <PaymentWizard projects={projects} initialProjectSlug={projet} />
    </div>
  )
}
