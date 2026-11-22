"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DirectoryOptions } from "@/lib/data/businesses"

const ALL = "TOUS"

/** Filtres synchronisés avec l'URL pour que les pages restent rendues côté serveur. */
export function BusinessFilterBar({
  options,
  variant = "full",
}: {
  options: DirectoryOptions
  /** `entrepreneurs` : recherche + entrepreneur + entreprise (métier/expertise via l'URL depuis le catalogue). */
  variant?: "full" | "entrepreneurs"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(params.get("q") ?? "")
  const showSkills = variant === "full"

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
    <div className="flex flex-col gap-2 lg:flex-row">
      <div className="relative min-w-0 flex-1">
        {pending ? (
          <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom, ville, service…"
          className="h-10 bg-card pl-9"
          aria-label="Rechercher dans l'annuaire"
        />
      </div>
      <FilterSelect label="Entrepreneur" param="entrepreneur" value={params.get("entrepreneur") ?? ALL} onChange={update} options={options.entrepreneurs.map((e) => ({ value: e.id, label: e.name }))} allLabel="Tous les entrepreneurs" />
      <FilterSelect label="Entreprise" param="entreprise" value={params.get("entreprise") ?? ALL} onChange={update} options={options.businesses.map((b) => ({ value: b.id, label: b.name }))} allLabel="Toutes les entreprises" />
      {showSkills && (
        <>
          <FilterSelect label="Métier" param="metier" value={params.get("metier") ?? ALL} onChange={update} options={options.metiers.map((m) => ({ value: m, label: m }))} allLabel="Tous les métiers" />
          <FilterSelect label="Expertise" param="expertise" value={params.get("expertise") ?? ALL} onChange={update} options={options.expertises.map((e) => ({ value: e, label: e }))} allLabel="Toutes les expertises" />
        </>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  param,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  param: string
  value: string
  onChange: (key: string, value: string) => void
  options: { value: string; label: string }[]
  allLabel: string
}) {
  const current = options.find((o) => o.value === value)
  return (
    <Select value={value} onValueChange={(v) => onChange(param, v)}>
      <SelectTrigger className="h-10! w-full bg-card lg:w-48" aria-label={label}>
        <SelectValue>{current?.label ?? allLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
