import type { Metadata } from "next"
import Link from "next/link"

import { OnboardingWizard } from "@/components/espace/onboarding-wizard"
import { PageHeader } from "@/components/espace/page-header"
import { getAssociations } from "@/lib/data/associations"
import { getCurrentMember, getMemberAssociationIds, getQuartiers } from "@/lib/data/members"
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/profile"

export const metadata: Metadata = { title: "Bienvenue" }

export default async function BienvenuePage({ searchParams }: { searchParams: Promise<{ etape?: string; association?: string }> }) {
  const { etape, association } = await searchParams
  const member = await getCurrentMember()
  const [quartiers, associations, memberAssociationIds] = await Promise.all([
    getQuartiers(),
    getAssociations(),
    getMemberAssociationIds(member.id),
  ])
  const initialStep = ONBOARDING_STEPS.includes(etape as OnboardingStep) ? (etape as OnboardingStep) : undefined

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        eyebrow="Bienvenue dans la communauté"
        title={`Bienvenue, ${member.firstName}`}
        description="Quatre étapes rapides pour compléter votre profil. Chacune peut être passée et reprise plus tard."
        actions={
          <Link href="/espace" className="text-sm text-muted-foreground underline-offset-4 hover:text-terre hover:underline">
            Plus tard
          </Link>
        }
      />
      <OnboardingWizard
        key={initialStep ?? "debut"}
        member={member}
        quartiers={quartiers}
        associations={associations}
        memberAssociationIds={memberAssociationIds}
        initialStep={initialStep}
        preselectedSlug={association}
      />
    </div>
  )
}
