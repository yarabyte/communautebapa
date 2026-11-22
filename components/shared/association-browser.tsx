"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Search, X } from "lucide-react"

import { BapaMotif } from "@/components/brand/pattern"
import { JoinAssociationButton, MemberBadge } from "@/components/espace/join-association-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cityGroupLabel, groupByCountryAndCity, matchesAssociation, monogram, type CountryGroup } from "@/lib/association-utils"
import { presidentName } from "@/lib/mock/associations"
import { associationCategoryLabels, associationZoneLabels } from "@/lib/labels"
import type { Association, AssociationCategory } from "@/lib/types"
import { cn } from "@/lib/utils"

const ALL = "TOUS"

export function useAssociationFilter<T extends Association>(list: T[], initialCountry?: string) {
  const [q, setQ] = useState("")
  const [country, setCountryState] = useState(initialCountry && list.some((a) => a.country === initialCountry) ? initialCountry : ALL)
  const [city, setCity] = useState(ALL)
  const [category, setCategory] = useState<AssociationCategory | typeof ALL>(ALL)

  const setCountry = (next: string) => {
    setCountryState(next)
    setCity(ALL)
  }

  const countries = useMemo(() => groupByCountryAndCity(list).map((g) => ({ country: g.country, count: g.count })), [list])
  const cities = useMemo(() => {
    if (country === ALL) return []
    const group = groupByCountryAndCity(list.filter((a) => a.country === country))[0]
    return (group?.cities ?? []).map((c) => ({ value: c.city ?? "", label: c.city ?? "Ville non précisée", count: c.associations.length }))
  }, [list, country])
  const categories = useMemo(() => [...new Set(list.map((a) => a.category))], [list])
  const filtered = useMemo(
    () =>
      list.filter(
        (a) =>
          (country === ALL || a.country === country) &&
          (city === ALL || (a.city ?? "") === city) &&
          (category === ALL || a.category === category) &&
          matchesAssociation(a, q),
      ),
    [list, country, city, category, q],
  )
  const groups = useMemo(() => groupByCountryAndCity(filtered), [filtered])

  return {
    q,
    setQ,
    country,
    setCountry,
    city,
    setCity,
    cities,
    category,
    setCategory,
    countries,
    categories,
    filtered,
    groups,
    isFiltered: q !== "" || country !== ALL || city !== ALL || category !== ALL,
    reset: () => {
      setQ("")
      setCountry(ALL)
      setCategory(ALL)
    },
  }
}

type FilterState = ReturnType<typeof useAssociationFilter>

export function AssociationFilterBar({ state, total }: { state: FilterState; total: number }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border/80 bg-card/80 p-2.5 shadow-[0_10px_30px_-24px_rgba(57,37,23,0.45)] backdrop-blur-sm sm:flex-row sm:items-center sm:p-3">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={state.q}
          onChange={(e) => state.setQ(e.target.value)}
          placeholder="Rechercher une association, une ville, un pays…"
          className="h-11 border-transparent bg-background pl-10 shadow-none focus-visible:border-or/50"
          aria-label="Rechercher une association"
        />
      </div>
      <SearchableSelect
        value={state.country}
        onChange={state.setCountry}
        options={state.countries.map((c) => ({ value: c.country, label: c.country, count: c.count }))}
        allLabel={`Tous les pays (${total})`}
        searchPlaceholder="Rechercher un pays…"
        ariaLabel="Pays"
        className="sm:w-52"
      />
      {state.country !== ALL && state.cities.length > 1 && (
        <SearchableSelect
          value={state.city}
          onChange={state.setCity}
          options={state.cities}
          allLabel="Toutes les villes"
          searchPlaceholder="Rechercher une ville…"
          ariaLabel="Ville"
          className="sm:w-48"
        />
      )}
      <Select value={state.category} onValueChange={(v) => state.setCategory(v as AssociationCategory | typeof ALL)}>
        <SelectTrigger className="h-11 w-full border-transparent bg-background shadow-none sm:w-44" aria-label="Type d'association">
          <SelectValue>
            {state.category === ALL ? "Tous les types" : associationCategoryLabels[state.category]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les types</SelectItem>
          {state.categories.map((c) => (
            <SelectItem key={c} value={c}>
              {associationCategoryLabels[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function AssociationMonogram({ association, className }: { association: Association; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        `tone-${association.tone}`,
        association.tone === "creme" ? "text-brun ring-1 ring-or/40" : "text-creme-light",
        "grid size-10 shrink-0 place-items-center rounded-lg font-heading text-[11px] font-semibold tracking-wide",
        className,
      )}
    >
      {monogram(association.shortName)}
    </span>
  )
}

export function EmptyAssociations({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-or/40 bg-creme-light/60 p-10 text-center">
      <p className="font-heading text-lg text-brun">Aucune association ne correspond</p>
      <p className="mt-1 text-sm text-muted-foreground">Essayez un autre nom de ville ou de pays.</p>
      <Button variant="outline" size="sm" className="mt-5 rounded-full" onClick={onReset}>
        <X /> Effacer les filtres
      </Button>
    </div>
  )
}

/** Pays regroupés dans une section commune « Autres pays » quand ils comptent au plus ce nombre d'associations. */
const SMALL_COUNTRY = 3

type RowProps = { association: Association; href: string; place?: string; joinable: boolean; member: boolean }

function AssociationRow({ association: a, href, place, joinable, member }: RowProps) {
  const responsable = presidentName(a.id)
  return (
    <li className="group flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0">
      <Link href={href} className="min-w-0 flex-1" title={a.fullName ?? a.name}>
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-[15px] leading-snug font-medium text-brun transition-colors group-hover:text-terre">
              {a.name}
            </span>
            {(responsable || place) && (
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                {responsable && <span>Responsable : {responsable}</span>}
                {responsable && place && (
                  <span aria-hidden className="text-border">
                    ·
                  </span>
                )}
                {place && <span>{place}</span>}
              </span>
            )}
          </span>
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-or opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </span>
      </Link>
      {joinable && (member ? <MemberBadge /> : <JoinAssociationButton name={a.name} className="h-7 px-2.5 text-xs" />)}
    </li>
  )
}

function GroupCard({ title, subtitle, count, children }: { title: string; subtitle?: string; count: number; children: React.ReactNode }) {
  return (
    <div className="relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-or/25 bg-card shadow-[0_12px_28px_-24px_rgba(57,37,23,0.4)]">
      <BapaMotif tone="gold" fade="corner" className="opacity-[0.18]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/50 to-transparent" />
      <div className="relative flex items-baseline justify-between gap-3 border-b border-border/60 bg-secondary/40 px-4 py-3 backdrop-blur-[2px]">
        <h3 className="min-w-0 font-heading text-[15px] tracking-wide text-brun">
          <span className="truncate">{title}</span>
          {subtitle && <span className="ml-2 font-sans text-xs font-normal tracking-normal text-muted-foreground">{subtitle}</span>}
        </h3>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{count}</span>
      </div>
      <ul className="relative px-4">{children}</ul>
    </div>
  )
}

function GroupSection({ id, title, subtitle, meta, children }: { id: string; title: string; subtitle?: string; meta: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-or/30 pb-3">
        <div>
          {subtitle && <p className="mb-1 text-[11px] font-medium tracking-[0.14em] text-or-dark uppercase">{subtitle}</p>}
          <h2 id={id} className="font-heading text-2xl tracking-wide text-brun">
            {title}
          </h2>
        </div>
        <p className="pb-1 text-xs text-muted-foreground">{meta}</p>
      </header>
      <div className="columns-1 gap-4 @2xl:columns-2 @5xl:columns-3">{children}</div>
    </section>
  )
}

type Block<T extends Association> = { key: string; title: string; subtitle?: string; count: number; cities: { key: string; label?: string; associations: T[] }[] }

/** Une carte par région quand la ville et la région sont connues, sinon une carte par ville. */
function toBlocks<T extends Association>(group: CountryGroup<T>): Block<T>[] {
  const blocks: Block<T>[] = []
  for (const city of group.cities) {
    if (city.city && city.region) {
      const key = `region-${city.region}`
      let block = blocks.find((b) => b.key === key)
      if (!block) {
        block = { key, title: `Région ${city.region}`, count: 0, cities: [] }
        blocks.push(block)
      }
      block.cities.push({ key: city.key, label: city.city, associations: city.associations })
      block.count += city.associations.length
    } else {
      const label = cityGroupLabel(city, group.country)
      blocks.push({ key: city.key, title: label.title, subtitle: label.subtitle, count: city.associations.length, cities: [{ key: city.key, associations: city.associations }] })
    }
  }
  return blocks
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`

export function AssociationBrowser<T extends Association>({
  associations,
  hrefBase,
  initialCountry,
  joinable = false,
  memberOf = [],
}: {
  associations: T[]
  hrefBase: string
  initialCountry?: string
  joinable?: boolean
  memberOf?: string[]
}) {
  const state = useAssociationFilter(associations, initialCountry)
  const small = state.groups.filter((g) => g.count <= SMALL_COUNTRY)
  const merged = small.length > 1 ? small : []
  const separate = state.groups.filter((g) => !merged.includes(g))
  const row = (a: Association, place?: string) => (
    <AssociationRow key={a.id} association={a} href={`${hrefBase}/${a.slug}`} place={place} joinable={joinable} member={memberOf.includes(a.id)} />
  )

  return (
    <div className="@container space-y-8">
      <AssociationFilterBar state={state} total={associations.length} />

      {state.isFiltered && (
        <p className="text-sm text-muted-foreground">
          {state.filtered.length} association{state.filtered.length > 1 ? "s" : ""} trouvée{state.filtered.length > 1 ? "s" : ""}
        </p>
      )}

      {state.groups.length === 0 && <EmptyAssociations onReset={state.reset} />}

      {separate.map((group) => (
        <GroupSection
          key={group.country}
          id={`pays-${group.country}`}
          title={group.country}
          subtitle={associationZoneLabels[group.zone]}
          meta={`${plural(group.count, "association")}${group.cities.length > 1 ? ` · ${group.cities.length} villes` : ""}`}
        >
          {toBlocks(group).map((block) => (
            <GroupCard key={block.key} title={block.title} subtitle={block.subtitle} count={block.count}>
              {block.cities.map((city) => [
                city.label && (
                  <li key={`${city.key}-label`} className="flex items-center justify-between pt-3.5 pb-1 first:pt-2.5">
                    <span className="text-[11px] font-medium tracking-[0.12em] text-brun-soft uppercase">{city.label}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{city.associations.length}</span>
                  </li>
                ),
                ...city.associations.map((a) => row(a)),
              ])}
            </GroupCard>
          ))}
        </GroupSection>
      ))}

      {merged.length > 0 && (
        <GroupSection
          id="autres-pays"
          title="Autres pays"
          meta={`${plural(merged.reduce((n, g) => n + g.count, 0), "association")} · ${merged.length} pays`}
        >
          {merged.map((group) => (
            <GroupCard key={group.country} title={group.country} subtitle={associationZoneLabels[group.zone]} count={group.count}>
              {group.cities.flatMap((city) => city.associations.map((a) => row(a, city.city ?? city.region)))}
            </GroupCard>
          ))}
        </GroupSection>
      )}
    </div>
  )
}
