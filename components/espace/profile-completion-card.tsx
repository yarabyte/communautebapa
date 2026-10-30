import Link from "next/link"
import { ArrowRight, Check, Circle, PenLine } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import type { ProfileCompletion } from "@/lib/profile"
import { cn } from "@/lib/utils"

/** `compact` : encart du bandeau d'accueil ; `full` : liste de contrôle détaillée. */
export function ProfileCompletionCard({
  completion,
  variant = "full",
  className,
}: {
  completion: ProfileCompletion
  variant?: "compact" | "full"
  className?: string
}) {
  const next = completion.missing[0]

  if (variant === "compact") {
    return (
      <div className={cn("w-full max-w-xs rounded-2xl border border-or/30 bg-creme-light/80 p-4 backdrop-blur-sm", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-brun">Profil complété</span>
          <span className="text-terre tabular-nums">{completion.percent} %</span>
        </div>
        <Progress value={completion.percent} className="mt-2 h-2" />
        {next && (
          <Link href={next.href} className="mt-3 flex items-center gap-2 text-sm text-terre hover:underline">
            <PenLine className="size-3.5" /> {next.hint}
          </Link>
        )}
      </div>
    )
  }

  return (
    <section className={cn("rounded-3xl border border-or/40 bg-card p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg text-brun">Complétez votre profil</h2>
          <p className="text-sm text-muted-foreground">
            {completion.percent === 100
              ? "Votre profil est complet. Merci !"
              : "Un profil complet accélère la validation et aide les membres à vous retrouver."}
          </p>
        </div>
        <span className="font-heading text-3xl text-terre tabular-nums">{completion.percent} %</span>
      </div>
      <Progress value={completion.percent} className="mt-4 h-2" />
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {completion.items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                item.done ? "border-olive/30 bg-olive/5" : "border-border hover:border-terre/40 hover:bg-secondary",
              )}
            >
              {item.done ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive text-creme-light">
                  <Check className="size-3.5" />
                </span>
              ) : (
                <Circle className="size-6 shrink-0 text-or/60" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-brun">
                  {item.label}
                  {item.optional && <span className="ml-1.5 text-xs font-normal text-muted-foreground">facultatif</span>}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
              </span>
              {!item.done && <ArrowRight className="size-4 shrink-0 text-terre opacity-0 transition-opacity group-hover:opacity-100" />}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
