import Link from "next/link"
import { ExternalLink, Globe, Lock, Mail, MapPin, MessageCircle, Phone, ThumbsUp } from "lucide-react"

import { MemberAvatar } from "@/components/espace/member-avatar"
import { Badge } from "@/components/ui/badge"
import type { BusinessWithMeta, JobWithBusiness } from "@/lib/data/businesses"
import { formatDate, formatMoney } from "@/lib/format"
import type { Member } from "@/lib/types"
import { BusinessLogo, SectorIcon } from "./business-card"
import { JobCard } from "./job-card"
import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon } from "./social-icons"

type RecommendationWithMember = { memberId: string; comment?: string; createdAt: string; member: Member }

const digits = (phone: string) => phone.replace(/[^\d]/g, "")

export function ContactButtons({ business }: { business: BusinessWithMeta }) {
  const base = "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors"
  return (
    <>
      {business.phone && (
        <a href={`tel:${business.phone.replace(/\s/g, "")}`} className={`${base} bg-primary text-primary-foreground hover:bg-primary/90`}>
          <Phone className="size-4" /> Appeler
        </a>
      )}
      {business.whatsapp && (
        <a
          href={`https://wa.me/${digits(business.whatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-[#25D366] text-white hover:bg-[#1fb957]`}
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      )}
      {business.email && (
        <a href={`mailto:${business.email}`} className={`${base} border border-border bg-card text-brun hover:bg-secondary`}>
          <Mail className="size-4" /> Email
        </a>
      )}
    </>
  )
}

export function BusinessDetail({
  business,
  recommendations,
  jobs,
  mode,
  actions,
}: {
  business: BusinessWithMeta
  recommendations: RecommendationWithMember[]
  jobs: JobWithBusiness[]
  mode: "public" | "member"
  actions?: React.ReactNode
}) {
  const socials = [
    { key: "facebook", label: "Facebook", icon: FacebookIcon, href: business.socials.facebook },
    { key: "instagram", label: "Instagram", icon: InstagramIcon, href: business.socials.instagram },
    { key: "linkedin", label: "LinkedIn", icon: LinkedinIcon, href: business.socials.linkedin },
    { key: "tiktok", label: "TikTok", icon: TiktokIcon, href: business.socials.tiktok },
  ].filter((s) => s.href)

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <BusinessLogo business={business} className="size-20 text-lg" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm text-or-dark">
              <SectorIcon icon={business.sectorIcon} className="size-4" /> {business.sectorName}
            </p>
            <h1 className="mt-1 font-heading text-2xl text-brun sm:text-3xl">{business.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-or" /> {business.city}, {business.country}
              </span>
              <span>
                par{" "}
                {mode === "member" ? (
                  <Link href={`/espace/annuaire/${business.ownerId}`} className="text-terre hover:underline">
                    {business.ownerName}
                  </Link>
                ) : (
                  business.ownerName
                )}
              </span>
              {business.recommendationsCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="size-4 text-or" /> {business.recommendationsCount} recommandation{business.recommendationsCount > 1 ? "s" : ""}
                </span>
              )}
              {business.visibility === "MEMBERS" && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="size-3" /> Réservée aux membres
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <ContactButtons business={business} />
          {actions}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Block title="Présentation">
            <p className="leading-relaxed whitespace-pre-line text-brun-soft">{business.description}</p>
          </Block>

          {business.services.length > 0 && (
            <Block title="Services et produits">
              <ul className="divide-y divide-border">
                {business.services.map((s) => (
                  <li key={s.name} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-brun">{s.name}</p>
                      {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                    </div>
                    {s.price != null && <span className="shrink-0 text-sm font-medium text-terre">{formatMoney(s.price, s.currency)}</span>}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {jobs.length > 0 && (
            <Block title="Offres d'emploi">
              <div className="grid gap-4">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} showBusiness={false} />
                ))}
              </div>
            </Block>
          )}

          <Block title={`Recommandations (${recommendations.length})`}>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de recommandation.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {recommendations.map((r) => (
                  <li key={r.memberId} className="flex gap-3">
                    {mode === "member" ? <MemberAvatar member={r.member} className="size-9" /> : <ThumbsUp className="mt-1 size-5 shrink-0 text-or" />}
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-brun">
                          {mode === "member" ? `${r.member.firstName} ${r.member.lastName}` : `${r.member.firstName} ${r.member.lastName[0]}.`}
                        </span>{" "}
                        <span className="text-muted-foreground">recommande · {formatDate(r.createdAt)}</span>
                      </p>
                      {r.comment && <p className="mt-0.5 text-sm text-brun-soft">« {r.comment} »</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Block>
        </div>

        <aside className="flex flex-col gap-6">
          <Block title="Coordonnées">
            <ul className="flex flex-col gap-3 text-sm">
              {(business.address || business.city) && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-or" />
                  <span>
                    {business.address && <span className="block">{business.address}</span>}
                    {business.city}, {business.country}
                    {business.mapsUrl && (
                      <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-terre hover:underline">
                        Voir sur la carte <ExternalLink className="size-3" />
                      </a>
                    )}
                  </span>
                </li>
              )}
              {business.phone && (
                <li className="flex gap-3">
                  <Phone className="size-4 shrink-0 text-or" />
                  <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="hover:text-terre">
                    {business.phone}
                  </a>
                </li>
              )}
              {business.email && (
                <li className="flex gap-3">
                  <Mail className="size-4 shrink-0 text-or" />
                  <a href={`mailto:${business.email}`} className="break-all hover:text-terre">
                    {business.email}
                  </a>
                </li>
              )}
              {business.website && (
                <li className="flex gap-3">
                  <Globe className="size-4 shrink-0 text-or" />
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="break-all text-terre hover:underline">
                    {business.website.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
            </ul>
          </Block>
          {socials.length > 0 && (
            <Block title="Réseaux sociaux">
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-terre/40 hover:bg-secondary"
                  >
                    <s.icon className="size-4 text-terre" /> {s.label}
                  </a>
                ))}
              </div>
            </Block>
          )}
        </aside>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 font-heading text-lg text-brun">{title}</h2>
      {children}
    </section>
  )
}
