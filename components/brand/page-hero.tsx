import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Eyebrow } from "./pill"

type Crumb = { label: string; href?: string }
type Stat = { title: string; text: string }

type PageHeroProps = {
  image: string
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
  stats?: Stat[]
  size?: "default" | "large"
  className?: string
}

export function PageHero({
  image,
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  stats,
  size = "default",
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-nuit text-creme-light",
        size === "large" ? "min-h-[88vh]" : "min-h-[52vh]",
        className
      )}
    >
      <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="bapa-hero-overlay absolute inset-0 -z-10" />

      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-col justify-end px-5 sm:px-8 lg:px-12",
          size === "large" ? "min-h-[88vh] pt-32 pb-12" : "min-h-[52vh] pt-28 pb-12"
        )}
      >
        {breadcrumbs && (
          <nav aria-label="Fil d'Ariane" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-creme-light/80">
            {breadcrumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-creme-light">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
        <h1
          className={cn(
            "font-heading mt-4 max-w-4xl leading-[1.05] tracking-[0.02em]",
            size === "large" ? "text-4xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl lg:text-6xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-creme-light/90 sm:text-lg">{description}</p>
        )}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}

        {stats && stats.length > 0 && (
          <dl className="mt-12 grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border border-creme-light/20 bg-nuit/35 backdrop-blur-md lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.title}
                className={cn(
                  "flex flex-col gap-1.5 p-4 sm:p-5",
                  i > 0 && "lg:border-l lg:border-creme-light/15",
                  i % 2 === 1 && "border-l border-creme-light/15",
                  i >= 2 && "border-t border-creme-light/15 lg:border-t-0"
                )}
              >
                <dt className="font-heading text-sm tracking-wide sm:text-base">{s.title}</dt>
                <dd className="text-xs text-creme-light/75 sm:text-[13px]">{s.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
