import Link from "next/link"
import { ArrowRight, CalendarDays, FolderKanban, Hourglass, Lock, MessageCircle, Plus, Store, Users } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { CtaLink } from "@/components/brand/cta"
import { Pill } from "@/components/brand/pill"
import type { BusinessWithMeta } from "@/lib/data/businesses"
import { formatDate } from "@/lib/format"
import { businessStatusLabels } from "@/lib/labels"
import type { ProfileCompletion } from "@/lib/profile"
import type { Member } from "@/lib/types"
import { ProfileCompletionCard } from "./profile-completion-card"
import { SectionCard } from "./section-card"

const unlocked = [
  { icon: Users, label: "Annuaire des membres et associations" },
  { icon: MessageCircle, label: "Messagerie" },
  { icon: CalendarDays, label: "Inscription aux événements" },
  { icon: FolderKanban, label: "Projets du village et contributions" },
]

export function PendingDashboard({
  member,
  completion,
  businesses,
}: {
  member: Member
  completion: ProfileCompletion
  businesses: BusinessWithMeta[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="tone-creme relative isolate overflow-hidden rounded-3xl border border-or/40 p-6 sm:p-8">
        <BapaMotif fade="radial" className="-z-10" />
        <div className="flex flex-col gap-3">
          <Pill>
            <Hourglass className="size-3" /> Demande en cours de validation
          </Pill>
          <h1 className="font-heading text-3xl text-brun sm:text-4xl">Bienvenue {member.firstName}</h1>
          <p className="max-w-2xl text-brun-soft">
            Votre compte a été créé le {formatDate(member.joinedAt)}. Un responsable de la communauté examine votre demande, généralement
            sous 48 heures. En attendant, complétez votre profil et présentez votre entreprise si vous en avez une.
          </p>
          {!member.onboardedAt && (
            <div className="mt-2">
              <CtaLink href="/espace/bienvenue" size="sm" diamond>
                Compléter mon profil en 4 étapes
              </CtaLink>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ProfileCompletionCard completion={completion} />

        <div className="flex flex-col gap-6">
          <SectionCard title="Mes entreprises" href="/espace/mes-entreprises" linkLabel="Gérer" contentClassName="flex flex-col gap-3">
            {businesses.length === 0 ? (
              <Link
                href="/espace/mes-entreprises/nouvelle"
                className="flex items-center gap-3 rounded-2xl border border-dashed border-terre/40 p-4 text-sm text-brun hover:bg-secondary"
              >
                <Store className="size-6 text-terre" />
                <span className="flex-1">Vous avez une entreprise ? Présentez-la aux membres.</span>
                <Plus className="size-4 text-terre" />
              </Link>
            ) : (
              businesses.map((b) => (
                <Link key={b.id} href={`/espace/mes-entreprises/${b.id}`} className="flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-secondary">
                  <span className="truncate text-sm font-medium text-brun">{b.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{businessStatusLabels[b.status]}</span>
                </Link>
              ))
            )}
          </SectionCard>

          <SectionCard title="Après validation" description="Ces espaces s'ouvriront dès que votre compte sera validé.">
            <ul className="flex flex-col gap-3 text-sm">
              {unlocked.map((u) => (
                <li key={u.label} className="flex items-center gap-3 text-muted-foreground">
                  <u.icon className="size-4 text-or" />
                  <span className="flex-1">{u.label}</span>
                  <Lock className="size-3.5" />
                </li>
              ))}
            </ul>
            <Link href="/associations" className="mt-4 flex items-center gap-1 text-sm text-terre hover:underline">
              Découvrir les associations publiques <ArrowRight className="size-3.5" />
            </Link>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
