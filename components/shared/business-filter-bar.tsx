"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BusinessSector } from "@/lib/types"

const ALL = "TOUS"

/** Filtres synchronisés avec l'URL (?q=&secteur=&pays=) pour que les pages restent rendues côté serveur. */
export function BusinessFilterBar({ sectors, countries }: { sectors: BusinessSector[]; countries: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(params.get("q") ?? "")

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value && value !== ALL) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }))
  }

  useEffect(() => {
    if (q === (params.get("q") ?? "")) return
    const t = setTimeout(() => update("q", q.trim()), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        {pending ? (
          <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Entreprise, service, ville…"
          className="h-10 bg-card pl-9"
          aria-label="Rechercher une entreprise"
        />
      </div>
      <Select value={params.get("secteur") ?? ALL} onValueChange={(v) => update("secteur", v)}>
        <SelectTrigger className="h-10! w-full bg-card sm:w-60" aria-label="Secteur d'activité">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les secteurs</SelectItem>
          {sectors.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={params.get("pays") ?? ALL} onValueChange={(v) => update("pays", v)}>
        <SelectTrigger className="h-10! w-full bg-card sm:w-44" aria-label="Pays">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les pays</SelectItem>
          {countries.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
