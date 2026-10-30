import { cn } from "@/lib/utils"

export function BapaFrieze({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bapa-frieze pointer-events-none w-full", className)} />
}

type BapaMotifProps = {
  tone?: "gold" | "light"
  fade?: "none" | "bottom" | "top" | "corner" | "left" | "radial"
  className?: string
}

const fades: Record<NonNullable<BapaMotifProps["fade"]>, string> = {
  none: "",
  bottom: "[mask-image:linear-gradient(0deg,#000_0%,transparent_60%)]",
  top: "[mask-image:linear-gradient(180deg,#000_0%,transparent_60%)]",
  corner: "[mask-image:linear-gradient(200deg,#000_0%,rgba(0,0,0,0.7)_45%,transparent_85%)]",
  left: "[mask-image:linear-gradient(90deg,#000_0%,transparent_55%)]",
  radial: "[mask-image:radial-gradient(70%_60%_at_85%_30%,#000_0%,transparent_70%)]",
}

export function BapaMotif({ tone = "gold", fade = "bottom", className }: BapaMotifProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        tone === "gold" ? "bapa-motif" : "bapa-motif-light",
        fades[fade],
        className
      )}
    />
  )
}
