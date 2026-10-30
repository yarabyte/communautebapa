import Image from "next/image"
import Link from "next/link"
import {
  Briefcase,
  Building,
  GraduationCap,
  Hammer,
  HardHat,
  Landmark,
  Laptop,
  Lock,
  MapPin,
  PartyPopper,
  Scale,
  Scissors,
  ShoppingBag,
  Sprout,
  Stethoscope,
  ThumbsUp,
  Truck,
  Utensils,
  type LucideIcon,
} from "lucide-react"

import { monogram } from "@/lib/association-utils"
import type { BusinessWithMeta } from "@/lib/data/businesses"
import type { Business } from "@/lib/types"
import { cn } from "@/lib/utils"

const SECTOR_ICONS: Record<string, LucideIcon> = {
  "hard-hat": HardHat,
  "shopping-bag": ShoppingBag,
  sprout: Sprout,
  stethoscope: Stethoscope,
  "graduation-cap": GraduationCap,
  truck: Truck,
  laptop: Laptop,
  utensils: Utensils,
  scissors: Scissors,
  hammer: Hammer,
  landmark: Landmark,
  scale: Scale,
  building: Building,
  "party-popper": PartyPopper,
}

export const SECTOR_ICON_KEYS = Object.keys(SECTOR_ICONS)

export function SectorIcon({ icon, className }: { icon?: string; className?: string }) {
  const Icon = (icon && SECTOR_ICONS[icon]) || Briefcase
  return <Icon className={className} />
}

export function BusinessLogo({ business, className }: { business: Pick<Business, "name" | "logo" | "tone">; className?: string }) {
  if (business.logo) {
    return (
      <span className={cn("relative block size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-card", className)}>
        <Image src={business.logo} alt="" fill sizes="56px" className="object-cover" />
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        `tone-${business.tone}`,
        business.tone === "creme" ? "text-brun" : "text-creme-light",
        "grid size-14 shrink-0 place-items-center rounded-xl font-heading text-sm font-semibold tracking-wide",
        className,
      )}
    >
      {monogram(business.name)}
    </span>
  )
}

export function BusinessCard({ business, href }: { business: BusinessWithMeta; href: string }) {
  return (
    <article className="group relative flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_16px_32px_rgba(57,37,23,0.1)]">
      <div className="flex items-start gap-4">
        <BusinessLogo business={business} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs text-or-dark">
            <SectorIcon icon={business.sectorIcon} className="size-3.5" /> {business.sectorName}
          </p>
          <h3 className="mt-0.5 leading-snug font-medium text-brun">
            <Link href={href} className="after:absolute after:inset-0 group-hover:text-terre">
              {business.name}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground">par {business.ownerName}</p>
        </div>
        {business.visibility === "MEMBERS" && (
          <span title="Réservée aux membres" className="text-muted-foreground">
            <Lock className="size-4" />
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-sm text-brun-soft">{business.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-or" /> {business.city}, {business.country}
        </span>
        {business.recommendationsCount > 0 && (
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="size-3.5 text-or" /> {business.recommendationsCount} recommandation{business.recommendationsCount > 1 ? "s" : ""}
          </span>
        )}
        {business.openJobs > 0 && (
          <span className="rounded-full bg-olive/15 px-2 py-0.5 font-medium text-olive">
            {business.openJobs} offre{business.openJobs > 1 ? "s" : ""} d&apos;emploi
          </span>
        )}
      </div>
    </article>
  )
}
