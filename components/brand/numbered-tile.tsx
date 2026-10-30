import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { BapaMotif } from "./pattern"
import { Pill } from "./pill"

export type TileTone = "terre" | "nuit" | "ocre" | "indigo" | "olive" | "creme"

type NumberedTileProps = {
  num?: string
  tag?: string
  title: string
  description?: string
  href?: string
  image?: string
  tone?: TileTone
  size?: "default" | "large"
  className?: string
  children?: React.ReactNode
  meta?: React.ReactNode
}

export function NumberedTile({
  num,
  tag,
  title,
  description,
  href,
  image,
  tone = "nuit",
  size = "default",
  className,
  children,
  meta,
}: NumberedTileProps) {
  const light = tone === "creme" && !image

  return (
    <article
      className={cn(
        "group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl shadow-[0_2px_6px_rgba(57,37,23,0.06)] transition-shadow duration-500 hover:shadow-[0_30px_56px_rgba(57,37,23,0.24)]",
        !image && `tone-${tone}`,
        light ? "border border-or/40 text-brun" : "bg-brun text-creme-light",
        className
      )}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="-z-20 object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.07]"
          />
          <div aria-hidden className="bapa-photo-overlay absolute inset-0 -z-10" />
        </>
      ) : (
        <BapaMotif tone={light ? "gold" : "light"} fade={light ? "bottom" : "corner"} className="-z-10" />
      )}

      {num && (
        <span
          aria-hidden
          className={cn(
            "font-heading pointer-events-none absolute top-5 left-5 z-10 text-4xl leading-none lg:text-[42px]",
            light ? "text-outline-dark" : "text-outline"
          )}
        >
          {num}
        </span>
      )}

      {href && (
        <span
          aria-hidden
          className={cn(
            "absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 group-hover:rotate-45",
            light
              ? "border-terre bg-terre text-creme-light group-hover:bg-brun"
              : "border-creme-light/35 bg-creme-light/15 text-creme-light group-hover:bg-creme-dark group-hover:text-brun"
          )}
        >
          <ArrowUpRight className="size-[18px]" />
        </span>
      )}

      {children}

      <div className="relative flex max-w-xl flex-col gap-2 p-6">
        {tag && <Pill tone={light ? "terre" : "glass"}>{tag}</Pill>}
        <h3
          className={cn(
            "font-heading mt-0.5 leading-tight font-medium tracking-[0.02em]",
            size === "large" ? "text-2xl lg:text-3xl" : "text-xl lg:text-[22px]",
            image && "[text-shadow:0_2px_16px_rgba(20,10,4,0.45)]"
          )}
        >
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:z-20 after:rounded-3xl focus-visible:outline-none">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {description && (
          <p
            className={cn(
              "text-sm leading-relaxed",
              size === "large" ? "line-clamp-3 text-[15px]" : "line-clamp-2",
              light ? "text-brun-soft" : "text-creme-light/85"
            )}
          >
            {description}
          </p>
        )}
        {meta && <div className={cn("mt-1 text-xs", light ? "text-brun-soft" : "text-creme-light/80")}>{meta}</div>}
      </div>
    </article>
  )
}
