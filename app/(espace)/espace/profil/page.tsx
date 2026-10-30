import type { Metadata } from "next"
import Link from "next/link"
import { Camera, HandCoins, MessagesSquare, Plus } from "lucide-react"

import { ProfileCompletionCard } from "@/components/espace/profile-completion-card"
import { ProfileForm } from "@/components/espace/profile-form"
import { ProfileHeader } from "@/components/espace/profile-header"
import { SectionCard } from "@/components/espace/section-card"
import { BusinessCard } from "@/components/shared/business-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { monogram } from "@/lib/association-utils"
import { getMemberAssociations } from "@/lib/data/associations"
import { getBusinesses } from "@/lib/data/businesses"
import { getForumThreads } from "@/lib/data/community"
import { getCurrentMember, getQuartiers } from "@/lib/data/members"
import { getContributions, projectById } from "@/lib/data/projects"
import { formatDate, formatMoney } from "@/lib/format"
import { membershipRoleLabels, roleLabels } from "@/lib/labels"
import { profileCompletion } from "@/lib/profile"

export const metadata: Metadata = { title: "Mon profil" }

export default async function ProfilPage() {
  const member = await getCurrentMember()
  const [quartiers, associations, contributions, threads, myBusinesses] = await Promise.all([
    getQuartiers(),
    getMemberAssociations(member.id),
    getContributions({ memberId: member.id }),
    getForumThreads(),
    getBusinesses({ ownerId: member.id }),
  ])
  const myThreads = threads.filter((t) => t.authorId === member.id)
  const completion = profileCompletion(member, { associations: associations.length, businesses: myBusinesses.length })

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        member={member}
        badge={roleLabels[member.role]}
        actions={
          <Button variant="outline" className="rounded-full">
            <Camera /> Changer la photo
          </Button>
        }
      />
      {completion.percent < 100 && <ProfileCompletionCard completion={completion} />}
      <Tabs defaultValue="infos" className="gap-5">
        <TabsList variant="line" className="w-full justify-start gap-4 border-b border-border">
          <TabsTrigger value="infos" className="flex-none px-1">
            Informations
          </TabsTrigger>
          <TabsTrigger value="associations" className="flex-none px-1">
            Associations ({associations.length})
          </TabsTrigger>
          <TabsTrigger value="entreprises" className="flex-none px-1">
            Entreprises ({myBusinesses.length})
          </TabsTrigger>
          <TabsTrigger value="activite" className="flex-none px-1">
            Activité
          </TabsTrigger>
        </TabsList>
        <TabsContent value="infos">
          <SectionCard title="Mes informations" description="Ces informations aident les membres à vous reconnaître.">
            <ProfileForm member={member} quartiers={quartiers} />
          </SectionCard>
        </TabsContent>
        <TabsContent value="associations" className="grid gap-4 sm:grid-cols-2">
          {associations.map(({ association, membership }) => (
            <Link key={association.id} href={`/espace/associations/${association.slug}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-terre/40">
              <span className={`tone-${association.tone} font-heading flex size-12 shrink-0 items-center justify-center rounded-xl text-xs text-creme-light`}>
                {monogram(association.shortName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-brun">{association.name}</p>
                <p className="text-xs text-muted-foreground">Depuis le {formatDate(membership.since)}</p>
              </div>
              <Badge variant="outline">{membershipRoleLabels[membership.role]}</Badge>
            </Link>
          ))}
        </TabsContent>
        <TabsContent value="entreprises" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} href={`/espace/mes-entreprises/${b.id}`} />
            ))}
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full">
            <Link href="/espace/mes-entreprises/nouvelle">
              <Plus /> Ajouter une entreprise
            </Link>
          </Button>
        </TabsContent>
        <TabsContent value="activite" className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Dernières contributions" href="/espace/contributions" contentClassName="flex flex-col gap-3">
            {contributions.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <HandCoins className="size-4 text-terre" />
                <span className="flex-1 truncate text-sm">{projectById(c.projectId)?.title}</span>
                <span className="text-sm font-medium">{formatMoney(c.amount, c.currency)}</span>
              </div>
            ))}
          </SectionCard>
          <SectionCard title="Mes sujets sur le forum" href="/espace/forum" contentClassName="flex flex-col gap-3">
            {myThreads.length === 0 && <p className="text-sm text-muted-foreground">Aucun sujet pour le moment.</p>}
            {myThreads.map((t) => (
              <Link key={t.id} href={`/espace/forum/${t.id}`} className="flex items-center gap-3 text-sm hover:text-terre">
                <MessagesSquare className="size-4 text-terre" />
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.repliesCount} réponses</span>
              </Link>
            ))}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
