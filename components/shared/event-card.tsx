import Link from "next/link"
import { CalendarDays, MapPin, Users } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { Pill } from "@/components/brand/pill"
import { Progress } from "@/components/ui/progress"
import { formatDate, percent } from "@/lib/format"
import { eventCategoryLabels } from "@/lib/labels"
import type { BapaEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

export function EventDateBadge({ iso, className }: { iso: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-or/40 bg-creme-light text-brun shadow-sm",
        className,
      )}
    >
      <span className="font-heading text-2xl leading-none">{formatDate(iso, "d")}</span>
      <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-terre uppercase">{formatDate(iso, "MMM")}</span>
    </div>
  )
}

export function EventCard({ event, href, past }: { event: BapaEvent; href: string; past?: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-or/25 bg-card p-5",
        "shadow-[0_12px_28px_-24px_rgba(57,37,23,0.4)] transition-shadow hover:shadow-[0_18px_36px_-22px_rgba(57,37,23,0.45)]",
        past && "opacity-80",
      )}
    >
      <BapaMotif tone="gold" fade="corner" className="opacity-[0.14]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.35rem] border border-or/15" />

      <div className="relative flex items-start gap-4">
        <EventDateBadge iso={event.startsAt} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{eventCategoryLabels[event.category]}</Pill>
            {past && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">Terminé</span>}
          </div>
          <h3 className="mt-2 font-heading text-lg leading-snug tracking-wide text-brun transition-colors group-hover:text-terre">
            <Link href={href} className="after:absolute after:inset-0">
              {event.title}
            </Link>
          </h3>
        </div>
      </div>

      <p className="relative mt-4 line-clamp-2 text-sm leading-relaxed text-brun-soft">{event.excerpt}</p>

      <ul className="relative mt-4 flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-or" />
          {formatDate(event.startsAt, "EEEE d MMMM yyyy · HH'h'mm")}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-3.5 text-or" />
          {event.location}
        </li>
      </ul>

      <div className="relative mt-auto flex items-center gap-3 border-t border-or/20 pt-3">
        <Progress value={percent(event.registered, event.capacity)} className="h-1.5" />
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3.5" /> {event.registered}/{event.capacity}
        </span>
      </div>
    </article>
  )
}
