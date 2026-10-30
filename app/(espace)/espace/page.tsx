import Image from "next/image"
import Link from "next/link"
import { CalendarDays, HandCoins, MessageCircle, MessagesSquare, UsersRound } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { Pill } from "@/components/brand/pill"
import { CtaLink } from "@/components/brand/cta"
import { PendingDashboard } from "@/components/espace/pending-dashboard"
import { ProfileCompletionCard } from "@/components/espace/profile-completion-card"
import { SectionCard } from "@/components/espace/section-card"
import { StatCard } from "@/components/espace/stat-card"
import { EventDateBadge } from "@/components/shared/event-card"
import { ProjectProgress } from "@/components/shared/project-card"
import { monogram } from "@/lib/association-utils"
import { getMemberAssociations } from "@/lib/data/associations"
import { getBusinesses } from "@/lib/data/businesses"
import { getEvents, getPosts } from "@/lib/data/content"
import { getCurrentMember, getQuartierName } from "@/lib/data/members"
import { getContributions, getProjects } from "@/lib/data/projects"
import { formatDate, formatMoney, fromNow } from "@/lib/format"
import { membershipRoleLabels, postCategoryLabels } from "@/lib/labels"
import { profileCompletion } from "@/lib/profile"

export default async function DashboardPage() {
  const member = await getCurrentMember()
  const [associations, events, posts, projects, contributions, myBusinesses] = await Promise.all([
    getMemberAssociations(member.id),
    getEvents({ upcoming: true }),
    getPosts({ limit: 3 }),
    getProjects(),
    getContributions({ memberId: member.id, status: "COMPLETED" }),
    getBusinesses({ ownerId: member.id }),
  ])
  const completion = profileCompletion(member, { associations: associations.length, businesses: myBusinesses.length })

  if (member.status === "PENDING") return <PendingDashboard member={member} completion={completion} businesses={myBusinesses} />

  const totalGiven = contributions.reduce((s, c) => s + c.amountXaf, 0)
  const activeProjects = projects.filter((p) => p.status === "EN_COURS").slice(0, 2)

  return (
    <div className="flex flex-col gap-6">
      <section className="tone-creme relative isolate overflow-hidden rounded-3xl border border-or/40 p-6 sm:p-8">
        <BapaMotif fade="radial" className="-z-10" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            {member.quartierId && <Pill>{getQuartierName(member.quartierId)}</Pill>}
            <h1 className="font-heading text-3xl text-brun sm:text-4xl">Bonjour {member.firstName}</h1>
            <p className="max-w-xl text-brun-soft">
              Membre depuis le {formatDate(member.joinedAt)}. Le festival Pa&apos;a Ngouo&apos;ok approche : pensez à réserver votre
              place et votre transport.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <CtaLink href="/espace/evenements/festival-paa-ngouook-2026" size="sm" diamond>
                Réserver pour le festival
              </CtaLink>
              <CtaLink href="/espace/contribuer" size="sm" variant="outline">
                Soutenir un projet
              </CtaLink>
            </div>
          </div>
          {completion.percent < 100 && <ProfileCompletionCard completion={completion} variant="compact" />}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} label="Mes associations" value={associations.length} hint={associations.map((a) => a.association.shortName).join(" · ")} />
        <StatCard icon={CalendarDays} label="Événements à venir" value={events.length} hint="2 inscriptions confirmées" tone="olive" />
        <StatCard icon={HandCoins} label="Mes contributions" value={formatMoney(totalGiven)} hint={`${contributions.length} versements`} tone="or" />
        <StatCard icon={MessageCircle} label="Messages non lus" value={3} hint="Dans 2 conversations" tone="indigo" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title="À la une" href="/espace/actualites" contentClassName="flex flex-col divide-y divide-border p-0">
            {posts.map((p) => (
              <Link key={p.id} href={`/espace/actualites/${p.slug}`} className="flex gap-4 p-5 transition-colors hover:bg-secondary/60">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-or-dark">
                    {postCategoryLabels[p.category]} · {fromNow(p.publishedAt)}
                  </span>
                  <h3 className="leading-snug font-medium text-brun">{p.title}</h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </SectionCard>

          <SectionCard title="Projets en cours" href="/espace/projets" contentClassName="grid gap-5 sm:grid-cols-2">
            {activeProjects.map((p) => (
              <Link key={p.id} href={`/espace/projets/${p.slug}`} className="flex flex-col gap-3 rounded-2xl border border-border p-4 hover:border-terre/40">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                  <Image src={p.image} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                </div>
                <h3 className="font-medium text-brun">{p.title}</h3>
                <ProjectProgress project={p} />
              </Link>
            ))}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Prochains événements" href="/espace/evenements" contentClassName="flex flex-col gap-4">
            {events.slice(0, 4).map((e) => (
              <Link key={e.id} href={`/espace/evenements/${e.slug}`} className="group flex items-center gap-4">
                <EventDateBadge iso={e.startsAt} className="size-14" />
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-brun group-hover:text-terre">{e.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">{e.location}</p>
                </div>
              </Link>
            ))}
          </SectionCard>

          <SectionCard title="Mes associations" href="/espace/associations" contentClassName="flex flex-col gap-3">
            {associations.map(({ association, membership }) => (
              <Link
                key={association.id}
                href={`/espace/associations/${association.slug}`}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
              >
                <span className={`tone-${association.tone} font-heading flex size-10 shrink-0 items-center justify-center rounded-xl text-xs text-creme-light`}>
                  {monogram(association.shortName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brun">{association.name}</p>
                  <p className="text-xs text-muted-foreground">{membershipRoleLabels[membership.role]}</p>
                </div>
              </Link>
            ))}
          </SectionCard>

          <SectionCard title="Raccourcis" contentClassName="grid grid-cols-2 gap-3">
            {[
              { href: "/espace/forum", label: "Écrire sur le forum", icon: MessagesSquare },
              { href: "/espace/messages", label: "Mes messages", icon: MessageCircle },
              { href: "/espace/contribuer", label: "Contribuer", icon: HandCoins },
              { href: "/espace/annuaire", label: "Annuaire", icon: UsersRound },
            ].map((s) => (
              <Link key={s.href} href={s.href} className="flex flex-col items-start gap-2 rounded-2xl border border-border p-4 text-sm text-brun transition-colors hover:border-terre/40 hover:bg-secondary">
                <s.icon className="size-5 text-terre" /> {s.label}
              </Link>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
