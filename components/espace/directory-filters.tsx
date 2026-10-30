"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Quartier } from "@/lib/types"

const ALL = "tous"

export function DirectoryFilters({ quartiers, countries }: { quartiers: Quartier[]; countries: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(params.get("q") ?? "")

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value && value !== ALL) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
  }

  useEffect(() => {
    if (q === (params.get("q") ?? "")) return
    const t = setTimeout(() => update("q", q), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const hasFilters = ["q", "quartier", "pays", "profession"].some((k) => params.get(k))

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        {pending ? (
          <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, ville, famille…" className="h-10 bg-background pl-9" aria-label="Rechercher" />
      </div>
      <Select value={params.get("quartier") ?? ALL} onValueChange={(v) => update("quartier", v)}>
        <SelectTrigger className="h-10! w-full bg-background lg:w-48" aria-label="Quartier">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les quartiers</SelectItem>
          {quartiers.map((x) => (
            <SelectItem key={x.id} value={x.id}>
              {x.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={params.get("pays") ?? ALL} onValueChange={(v) => update("pays", v)}>
        <SelectTrigger className="h-10! w-full bg-background lg:w-44" aria-label="Pays">
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
      <Input
        defaultValue={params.get("profession") ?? ""}
        onBlur={(e) => update("profession", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && update("profession", e.currentTarget.value)}
        placeholder="Profession"
        className="h-10 bg-background lg:w-44"
        aria-label="Profession"
      />
      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            setQ("")
            startTransition(() => router.replace(pathname, { scroll: false }))
          }}
        >
          <X /> Effacer
        </Button>
      )}
    </div>
  )
}
