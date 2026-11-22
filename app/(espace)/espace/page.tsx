import Image from "next/image"
import Link from "next/link"
import { CalendarDays, FileText, HandCoins, MessageCircle, UsersRound } from "lucide-react"

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
import { getCurrentMember, getQuartiers, getQuartierName } from "@/lib/data/members"
import { getContributions, getProjects } from "@/lib/data/projects"
import { formatDate, formatMoney, fromNow } from "@/lib/format"
import { membershipRoleLabels, postCategoryLabels } from "@/lib/labels"
import { profileCompletion } from "@/lib/profile"

const shortcuts = [
  { href: "/espace/messages", label: "Messages", icon: MessageCircle },
  { href: "/espace/documents", label: "Documents", icon: FileText },
  { href: "/espace/contribuer", label: "Contribuer", icon: HandCoins },
  { href: "/espace/annuaire", label: "Annuaire", icon: UsersRound },
]

export default async function DashboardPage() {
  const member = await getCurrentMember()
  const [associations, events, posts, projects, contributions, myBusinesses, quartiers] = await Promise.all([
    getMemberAssociations(member.id),
    getEvents({ upcoming: true }),
    getPosts({ limit: 3 }),
    getProjects(),
    getContributions({ memberId: member.id, status: "COMPLETED" }),
    getBusinesses({ ownerId: member.id }),
    getQuartiers(),
  ])
  const completion = profileCompletion(member, { associations: associations.length, businesses: myBusinesses.length })

  if (member.status === "PENDING") return <PendingDashboard member={member} completion={completion} businesses={myBusinesses} />

  const totalGiven = contributions.reduce((s, c) => s + c.amountXaf, 0)
  const activeProjects = projects.filter((p) => p.status === "EN_COURS").slice(0, 2)
  const upcoming = events.slice(0, 4)
  const [featuredPost, ...otherPosts] = posts

  return (
    <div className="flex flex-col gap-8">
      <section className="tone-creme relative isolate overflow-hidden rounded-3xl border border-or/40 px-6 py-7 sm:px-8 sm:py-8">
        <BapaMotif fade="radial" className="-z-10" />
        <div className="flex flex-col gap-5">
          {member.quartierId && <Pill>{getQuartierName(member.quartierId, quartiers)}</Pill>}
          <div className="flex flex-col gap-3 sm:max-w-2xl">
            <h1 className="font-heading text-3xl text-brun sm:text-4xl">Bonjour {member.firstName}</h1>
            <p className="text-brun-soft">
              Membre depuis le {formatDate(member.joinedAt)}. Le festival Pa&apos;a Ngouo&apos;ok approche : pensez à réserver votre
              place et votre transport.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CtaLink href="/espace/evenements/festival-paa-ngouook-2026" size="sm" diamond>
              Réserver pour le festival
            </CtaLink>
            <CtaLink href="/espace/contribuer" size="sm" variant="outline">
              Soutenir un projet
            </CtaLink>
          </div>
        </div>
      </section>

      {completion.percent < 100 && <ProfileCompletionCard completion={completion} variant="compact" className="max-w-none sm:max-w-md" />}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/espace/associations" className="rounded-2xl transition-opacity hover:opacity-90">
          <StatCard icon={UsersRound} label="Mes associations" value={associations.length} hint={associations.map((a) => a.association.shortName).join(" · ") || "Rejoindre une association"} />
        </Link>
        <Link href="/espace/evenements" className="rounded-2xl transition-opacity hover:opacity-90">
          <StatCard icon={CalendarDays} label="Événements à venir" value={events.length} hint="Voir l'agenda" tone="olive" />
        </Link>
        <Link href="/espace/contributions" className="rounded-2xl transition-opacity hover:opacity-90">
          <StatCard icon={HandCoins} label="Mes contributions" value={formatMoney(totalGiven)} hint={`${contributions.length} versements`} tone="or" />
        </Link>
        <Link href="/espace/messages" className="rounded-2xl transition-opacity hover:opacity-90">
          <StatCard icon={MessageCircle} label="Messages non lus" value={3} hint="Dans 2 conversations" tone="indigo" />
        </Link>
      </div>

      <nav aria-label="Raccourcis" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-brun transition-colors hover:border-terre/40 hover:bg-secondary"
          >
            <s.icon className="size-5 shrink-0 text-terre" />
            {s.label}
          </Link>
        ))}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SectionCard title="À la une" href="/espace/actualites" contentClassName="flex flex-col gap-0 p-0">
          {featuredPost && (
            <Link href={`/espace/actualites/${featuredPost.slug}`} className="group flex flex-col gap-3 border-b border-border p-5 transition-colors hover:bg-secondary/60">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                <Image src={featuredPost.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-or-dark">
                  {postCategoryLabels[featuredPost.category]} · {fromNow(featuredPost.publishedAt)}
                </span>
                <h3 className="font-heading text-xl leading-snug text-brun group-hover:text-terre">{featuredPost.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{featuredPost.excerpt}</p>
              </div>
            </Link>
          )}
          {otherPosts.map((p) => (
            <Link key={p.id} href={`/espace/actualites/${p.slug}`} className="flex gap-4 p-5 transition-colors hover:bg-secondary/60">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
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

        <SectionCard title="Prochains événements" href="/espace/evenements" contentClassName="flex flex-col gap-1 p-3">
          {upcoming.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">Aucun événement à venir.</p>
          ) : (
            upcoming.map((e) => (
              <Link key={e.id} href={`/espace/evenements/${e.slug}`} className="group flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-secondary">
                <EventDateBadge iso={e.startsAt} className="size-14" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-brun group-hover:text-terre">{e.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">{e.location}</p>
                </div>
              </Link>
            ))
          )}
        </SectionCard>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SectionCard title="Projets en cours" href="/espace/projets" contentClassName="grid gap-4 sm:grid-cols-2">
          {activeProjects.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">Aucun projet en cours.</p>
          ) : (
            activeProjects.map((p) => (
              <Link key={p.id} href={`/espace/projets/${p.slug}`} className="flex flex-col gap-3 rounded-2xl border border-border p-3 transition-colors hover:border-terre/40 hover:bg-secondary/40">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                  <Image src={p.image} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                </div>
                <h3 className="font-medium text-brun">{p.title}</h3>
                <ProjectProgress project={p} />
              </Link>
            ))
          )}
        </SectionCard>

        <SectionCard title="Mes associations" href="/espace/associations" contentClassName="flex flex-col gap-1 p-3">
          {associations.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">Vous n&apos;avez pas encore rejoint d&apos;association.</p>
          ) : (
            associations.map(({ association, membership }) => (
              <Link
                key={association.id}
                href={`/espace/associations/${association.slug}`}
                className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-secondary"
              >
                <span className={`tone-${association.tone} font-heading flex size-10 shrink-0 items-center justify-center rounded-xl text-xs text-creme-light`}>
                  {monogram(association.shortName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brun">{association.name}</p>
                  <p className="text-xs text-muted-foreground">{membershipRoleLabels[membership.role]}</p>
                </div>
              </Link>
            ))
          )}
        </SectionCard>
      </div>
    </div>
  )
}
