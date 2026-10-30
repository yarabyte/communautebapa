import type { Metadata } from "next"

import { PageHeader } from "@/components/espace/page-header"
import { SettingsPanels } from "@/components/espace/settings-panels"
import { getCurrentMember } from "@/lib/data/members"

export const metadata: Metadata = { title: "Paramètres" }

export default async function ParametresPage() {
  const member = await getCurrentMember()
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader eyebrow="Mon compte" title="Paramètres" description="Sécurité, notifications et confidentialité de votre compte." />
      <SettingsPanels member={member} />
    </div>
  )
}
