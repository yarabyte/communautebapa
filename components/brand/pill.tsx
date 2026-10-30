import { cn } from "@/lib/utils"

export function Diamond({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block size-1.5 shrink-0 rotate-45 bg-current", className)} />
}

type PillProps = {
  children: React.ReactNode
  tone?: "terre" | "glass" | "or" | "olive" | "brun"
  className?: string
}

const tones: Record<NonNullable<PillProps["tone"]>, string> = {
  terre: "border-terre/25 bg-terre/10 text-terre",
  glass: "border-creme-light/25 bg-creme-light/15 text-[#F3DDB8] backdrop-blur-md",
  or: "border-brun/15 bg-brun/5 text-or-dark",
  olive: "border-olive/25 bg-olive/10 text-olive",
  brun: "border-brun/20 bg-brun text-creme-light",
}

export function Pill({ children, tone = "terre", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10.5px] font-medium tracking-[0.18em] uppercase",
        tones[tone],
        className
      )}
    >
      <Diamond className="size-[5px]" />
      {children}
    </span>
  )
}

export function Eyebrow({ children, className, light }: { children: React.ReactNode; className?: string; light?: boolean }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-medium tracking-[0.28em] uppercase",
        light ? "text-or-light" : "text-or-dark",
        className
      )}
    >
      <span aria-hidden className={cn("h-px w-8", light ? "bg-or-light" : "bg-or")} />
      {children}
    </p>
  )
}
