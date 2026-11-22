"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowUpRight, BriefcaseBusiness, Loader2, Search, Sparkles } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SkillCatalogEntry } from "@/lib/data/businesses"
import { cn } from "@/lib/utils"

export function SkillsSearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(params.get("q") ?? "")

  useEffect(() => {
    if (q === (params.get("q") ?? "")) return
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      const value = q.trim()
      if (value) next.set("q", value)
      else next.delete("q")
      startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }))
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <div className="relative max-w-xl">
      {pending ? (
        <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un métier ou une expertise…"
        aria-label="Rechercher un métier ou une expertise"
        className="h-10 bg-card pl-9"
      />
    </div>
  )
}

function SkillRow({ entry }: { entry: SkillCatalogEntry }) {
  const href =
    entry.kind === "metier"
      ? `/espace/entrepreneurs?metier=${encodeURIComponent(entry.name)}`
      : `/espace/entrepreneurs?expertise=${encodeURIComponent(entry.name)}`

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0 hover:bg-secondary/40"
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          entry.kind === "metier" ? "bg-terre/10 text-terre" : "bg-indigo-bapa/10 text-indigo-bapa",
        )}
      >
        {entry.kind === "metier" ? <BriefcaseBusiness className="size-4" /> : <Sparkles className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-brun transition-colors group-hover:text-terre">{entry.name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {entry.businessesCount} entreprise{entry.businessesCount > 1 ? "s" : ""}
          {" · "}
          {entry.entrepreneursCount} entrepreneur{entry.entrepreneursCount > 1 ? "s" : ""}
        </span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-or opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </Link>
  )
}

function SkillList({ entries, empty }: { entries: SkillCatalogEntry[]; empty: string }) {
  if (entries.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card px-4">
      {entries.map((entry) => (
        <li key={entry.name}>
          <SkillRow entry={entry} />
        </li>
      ))}
    </ul>
  )
}

export function SkillsCatalog({ metiers, expertises }: { metiers: SkillCatalogEntry[]; expertises: SkillCatalogEntry[] }) {
  if (metiers.length === 0 && expertises.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center">
        <p className="font-medium text-brun">Aucun métier ni expertise ne correspond</p>
        <p className="mt-1 text-sm text-muted-foreground">Essayez un autre terme de recherche.</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue={metiers.length > 0 ? "metiers" : "expertises"} className="gap-5">
      <TabsList variant="line" className="w-full justify-start gap-4 border-b border-border">
        <TabsTrigger value="metiers" className="flex-none px-1">
          Métiers ({metiers.length})
        </TabsTrigger>
        <TabsTrigger value="expertises" className="flex-none px-1">
          Expertises ({expertises.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="metiers">
        <SkillList entries={metiers} empty="Aucun métier trouvé" />
      </TabsContent>
      <TabsContent value="expertises">
        <SkillList entries={expertises} empty="Aucune expertise trouvée" />
      </TabsContent>
    </Tabs>
  )
}
