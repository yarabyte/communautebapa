import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BadgeCheck, BookText, CalendarClock, Landmark, MapPin, MessageCircle, Settings, Users } from "lucide-react"

import { Pill } from "@/components/brand/pill"
import { DocumentsTable } from "@/components/espace/documents-table"
import { ForumThreadList } from "@/components/espace/forum-thread-list"
import { JoinAssociationButton, MemberBadge } from "@/components/espace/join-association-button"
import { MemberAvatar } from "@/components/espace/member-avatar"
import { SectionCard } from "@/components/espace/section-card"
import { EventCard } from "@/components/shared/event-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { associationPlace } from "@/lib/association-utils"
import { getAssociation, getAssociationMembers } from "@/lib/data/associations"
import { getForumThreads } from "@/lib/data/community"
import { getDocuments, getEvents, getPosts } from "@/lib/data/content"
import { getCurrentMember, getQuartierName } from "@/lib/data/members"
import { formatDate } from "@/lib/format"
import { associationCategoryLabels, membershipRoleLabels } from "@/lib/labels"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAssociation((await params).slug)
  return { title: a?.name ?? "Association" }
}

const TABS = ["apercu", "membres", "evenements", "documents", "forum"]

export default async function EspaceAssociationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ onglet?: string }>
}) {
  const { slug } = await params
  const { onglet } = await searchParams
  const association = await getAssociation(slug)
  if (!association) notFound()
  const me = await getCurrentMember()
  const [members, events, documents, threads, posts] = await Promise.all([
    getAssociationMembers(association.id),
    getEvents({ associationId: association.id }),
    getDocuments({ associationId: association.id }),
    getForumThreads({ associationId: association.id }),
    getPosts({ associationId: association.id }),
  ])
  const myMembership = members.find((m) => m.member.id === me.id)?.membership
  const isManager = myMembership?.role === "RESPONSABLE"
  const president = members.find((m) => m.member.id === association.presidentId)?.member

  return (
    <div className="flex flex-col gap-6">
      <Link href="/espace/associations" className="flex w-fit items-center gap-2 text-sm text-terre hover:underline">
        <ArrowLeft className="size-4" /> Associations
      </Link>

      <section className="relative isolate overflow-hidden rounded-3xl text-creme-light">
        <Image src={association.cover} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="bapa-hero-overlay absolute inset-0 -z-10" />
        <div className="flex min-h-52 flex-col justify-end gap-3 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Pill tone="glass">{associationCategoryLabels[association.category]}</Pill>
            {myMembership && <MemberBadge className="bg-olive text-creme-light" />}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl">{association.name}</h1>
          <p className="line-clamp-2 max-w-2xl text-sm text-creme-light/85 sm:text-base">{association.description}</p>
          <div className="flex flex-wrap gap-2">
            {myMembership ? (
              <>
                <Button asChild className="rounded-full">
                  <Link href="/espace/messages">
                    <MessageCircle /> Discussion du groupe
                  </Link>
                </Button>
                {isManager && (
                  <Button asChild variant="outline" className="rounded-full border-creme-light/50 bg-transparent text-creme-light hover:bg-creme-light/10 hover:text-creme-light">
                    <Link href="/admin/associations">
                      <Settings /> Gérer l&apos;association
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <JoinAssociationButton name={association.name} />
            )}
          </div>
        </div>
      </section>

      <Tabs defaultValue={onglet && TABS.includes(onglet) ? onglet : "apercu"} className="gap-5">
        <TabsList variant="line" className="w-full justify-start gap-4 overflow-x-auto border-b border-border">
          {[
            ["apercu", "Aperçu"],
            ["membres", `Membres (${members.length})`],
            ["evenements", `Événements (${events.length})`],
            ["documents", `Documents (${documents.length})`],
            ["forum", `Forum (${threads.length})`],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="flex-none px-1">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="apercu" className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-5">
            <SectionCard title="Notre mission">
              <p className="leading-relaxed text-brun-soft">{association.mission}</p>
            </SectionCard>
            <SectionCard title="Annonces de l'association" contentClassName="flex flex-col divide-y divide-border py-2">
              {posts.length === 0 && <p className="py-2 text-sm text-muted-foreground">Aucune annonce récente.</p>}
              {posts.map((p) => (
                <Link key={p.id} href={`/espace/actualites/${p.slug}`} className="flex items-baseline justify-between gap-4 py-2.5 hover:text-terre">
                  <span className="min-w-0 truncate text-sm font-medium">{p.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(p.publishedAt, "d MMM yyyy")}</span>
                </Link>
              ))}
            </SectionCard>
          </div>
          <SectionCard title="Informations" contentClassName="flex flex-col gap-2.5 text-sm">
            {[
              { icon: MapPin, label: associationPlace(association) },
              association.fullName && { icon: BookText, label: association.fullName },
              association.foundedYear && { icon: Landmark, label: `Fondée en ${association.foundedYear}` },
              { icon: Users, label: `${association.membersCount} membres` },
              association.meetingInfo && { icon: CalendarClock, label: association.meetingInfo },
              association.adevipa && { icon: BadgeCheck, label: "Rattachée à l'ADEVIPA" },
            ]
              .filter((f) => !!f)
              .map((f) => (
                <p key={f.label} className="flex gap-3">
                  <f.icon className="size-4 shrink-0 text-or" /> {f.label}
                </p>
              ))}
            {president && (
              <div className="mt-1 flex items-center gap-3 rounded-xl bg-secondary p-2.5">
                <MemberAvatar member={president} />
                <div>
                  <p className="font-medium text-brun">
                    {president.firstName} {president.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">Responsable</p>
                </div>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="membres">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {members.map(({ member, membership }) => (
              <Link key={member.id} href={`/espace/annuaire/${member.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 hover:border-terre/40">
                <MemberAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brun">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {getQuartierName(member.quartierId)}
                    {member.city && ` · ${member.city}`}
                  </p>
                </div>
                {membership.role !== "MEMBRE" && <Badge variant="outline">{membershipRoleLabels[membership.role]}</Badge>}
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evenements">
          {events.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} href={`/espace/evenements/${e.slug}`} />
              ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">Aucun événement programmé.</p>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTable documents={documents} showAssociation={false} />
        </TabsContent>

        <TabsContent value="forum">
          <ForumThreadList threads={threads} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
