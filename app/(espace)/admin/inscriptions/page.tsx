import type { Metadata } from "next"

import { RegistrationQueue } from "@/components/admin/registration-queue"
import { PageHeader } from "@/components/espace/page-header"
import { getBusinesses } from "@/lib/data/businesses"
import { getMemberAssociationIds, getPendingRegistrations, getQuartiers, getQuartierName } from "@/lib/data/members"
import { profileCompletion } from "@/lib/profile"

export const metadata: Metadata = { title: "Inscriptions" }

export default async function InscriptionsPage() {
  const [pending, quartiers] = await Promise.all([getPendingRegistrations(), getQuartiers()])
  const registrations = await Promise.all(
    pending.map(async (m) => {
      const [associationIds, businesses] = await Promise.all([getMemberAssociationIds(m.id), getBusinesses({ ownerId: m.id })])
      return {
        ...m,
        quartierName: getQuartierName(m.quartierId, quartiers),
        completion: profileCompletion(m, { associations: associationIds.length, businesses: businesses.length }),
      }
    }),
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Administration"
        title="Demandes d'adhésion"
        description="L'inscription ne demande que le nom et un identifiant : vérifiez ce que chaque membre a complété ensuite, demandez des compléments si besoin, puis validez."
      />
      <RegistrationQueue registrations={registrations} />
    </div>
  )
}
