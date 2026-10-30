import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type BapaLogoProps = {
  href?: string
  title?: string
  subtitle?: string
  tone?: "dark" | "light"
  compact?: boolean
  className?: string
}

export function BapaLogo({
  href = "/",
  title = "Communauté Bapa",
  subtitle = "Ngouon' a Pa'a",
  tone = "dark",
  compact = false,
  className,
}: BapaLogoProps) {
  return (
    <Link href={href} className={cn("group flex items-center gap-3", className)}>
      <span className="relative grid size-13 shrink-0 place-items-center">
        <span
          aria-hidden
          className={cn(
            "animate-bapa-spin absolute inset-0 rounded-full border border-dashed",
            tone === "dark" ? "border-or/80" : "border-or-light/70"
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-1.5 rounded-full",
            tone === "dark"
              ? "bg-[radial-gradient(circle,#FFFCF6_55%,rgba(255,252,246,0)_72%)]"
              : "bg-[radial-gradient(circle,rgba(255,252,246,0.95)_55%,rgba(255,252,246,0)_72%)]"
          )}
        />
        <Image
          src="/images/logo-bapa.png"
          alt="Emblème du Royaume Bapa"
          width={40}
          height={46}
          className="relative z-10 h-11 w-auto object-contain"
          priority
        />
      </span>
      {!compact && (
        <span className="flex flex-col gap-1 leading-none">
          <small
            className={cn(
              "text-[9.5px] font-medium tracking-[0.3em] whitespace-nowrap uppercase",
              tone === "dark" ? "text-or" : "text-or-light"
            )}
          >
            {subtitle}
          </small>
          <b
            className={cn(
              "font-heading text-[17px] font-semibold tracking-[0.08em] whitespace-nowrap sm:text-[19px]",
              tone === "dark" ? "text-brun" : "text-creme-light"
            )}
          >
            {title}
          </b>
        </span>
      )}
    </Link>
  )
}
