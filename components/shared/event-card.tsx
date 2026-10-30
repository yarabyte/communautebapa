import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Users } from "lucide-react"

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
        className
      )}
    >
      <span className="font-heading text-2xl leading-none">{formatDate(iso, "d")}</span>
      <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-terre uppercase">{formatDate(iso, "MMM")}</span>
    </div>
  )
}

export function EventCard({ event, href, past }: { event: BapaEvent; href: string; past?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_2px_6px_rgba(57,37,23,0.05)] transition-shadow hover:shadow-[0_20px_40px_rgba(57,37,23,0.14)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={cn("object-cover transition-transform duration-700 group-hover:scale-105", past && "grayscale-[60%]")}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-nuit/60 to-transparent" />
        <EventDateBadge iso={event.startsAt} className="absolute bottom-4 left-4" />
        <Pill tone="glass" className="absolute top-4 left-4">
          {eventCategoryLabels[event.category]}
        </Pill>
        {past && (
          <span className="absolute top-4 right-4 rounded-full bg-nuit/70 px-3 py-1 text-xs text-creme-light">Terminé</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-lg leading-snug text-brun">
          <Link href={href} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-brun-soft">{event.excerpt}</p>
        <ul className="mt-auto flex flex-col gap-1.5 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-or" />
            {formatDate(event.startsAt, "EEEE d MMMM yyyy · HH'h'mm")}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 text-or" />
            {event.location}
          </li>
        </ul>
        <div className="flex items-center gap-3 pt-1">
          <Progress value={percent(event.registered, event.capacity)} className="h-1.5" />
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" /> {event.registered}/{event.capacity}
          </span>
        </div>
      </div>
    </article>
  )
}
