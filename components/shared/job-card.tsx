import Link from "next/link"
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { JobWithBusiness } from "@/lib/data/businesses"
import { formatDate } from "@/lib/format"
import { jobTypeLabels } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { BusinessLogo } from "./business-card"

export function JobCard({ job, businessHref, showBusiness = true }: { job: JobWithBusiness; businessHref?: string; showBusiness?: boolean }) {
  const isEmail = job.applyContact.includes("@")
  return (
    <article className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-card p-5", job.status === "CLOSED" && "opacity-60")}>
      <div className="flex items-start gap-3">
        {showBusiness && <BusinessLogo business={job.business} className="size-11 text-xs" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{jobTypeLabels[job.type]}</Badge>
            {job.status === "CLOSED" && <Badge variant="secondary">Pourvue</Badge>}
          </div>
          <h3 className="mt-1.5 leading-snug font-medium text-brun">{job.title}</h3>
          {showBusiness &&
            (businessHref ? (
              <Link href={businessHref} className="text-sm text-terre hover:underline">
                {job.business.name}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">{job.business.name}</p>
            ))}
        </div>
      </div>
      <p className="text-sm text-brun-soft">{job.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-or" /> {job.city}, {job.country}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-or" /> Publiée le {formatDate(job.publishedAt)}
          {job.expiresAt && ` · jusqu'au ${formatDate(job.expiresAt)}`}
        </span>
      </div>
      {job.status === "OPEN" && (
        <a
          href={isEmail ? `mailto:${job.applyContact}?subject=${encodeURIComponent(`Candidature : ${job.title}`)}` : `tel:${job.applyContact.replace(/\s/g, "")}`}
          className="flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {isEmail ? <Mail className="size-4" /> : <Phone className="size-4" />} Postuler · {job.applyContact}
        </a>
      )}
    </article>
  )
}
