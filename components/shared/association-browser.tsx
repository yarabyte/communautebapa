"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Globe2, MapPin, Search, X } from "lucide-react"

import { JoinAssociationButton, MemberBadge } from "@/components/espace/join-association-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cityGroupLabel, groupByCountryAndCity, matchesAssociation, monogram, type CountryGroup } from "@/lib/association-utils"
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
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={state.q}
          onChange={(e) => state.setQ(e.target.value)}
          placeholder="Rechercher une association, une ville, un pays…"
          className="h-10 pl-9"
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
        <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Type d'association">
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
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <p className="font-medium">Aucune association ne correspond à votre recherche.</p>
      <p className="mt-1 text-sm text-muted-foreground">Essayez un autre nom de ville ou de pays.</p>
      <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={onReset}>
        <X /> Effacer les filtres
      </Button>
    </div>
  )
}

/** Pays regroupés dans une section commune « Autres pays » quand ils comptent au plus ce nombre d'associations. */
const SMALL_COUNTRY = 3

type RowProps = { association: Association; href: string; place?: string; joinable: boolean; member: boolean }

function AssociationRow({ association: a, href, place, joinable, member }: RowProps) {
  return (
    <li className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted/60">
      <AssociationMonogram association={a} className="size-8 rounded-md text-[9px]" />
      <Link href={href} className="min-w-0 flex-1" title={a.fullName ?? a.name}>
        <span className="block truncate text-sm leading-tight font-medium group-hover:text-primary">{a.name}</span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {associationCategoryLabels[a.category]}
          {place && ` · ${place}`}
          {a.adevipa && <span className="font-medium text-or"> · ADEVIPA</span>}
        </span>
      </Link>
      {joinable && (member ? <MemberBadge /> : <JoinAssociationButton name={a.name} className="h-7 px-2.5 text-xs" />)}
    </li>
  )
}

function GroupCard({ title, subtitle, count, children }: { title: string; subtitle?: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mb-3 break-inside-avoid rounded-xl border bg-card px-3 py-2.5 shadow-xs">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
          <MapPin className="size-3.5 shrink-0 text-or" />
          <span className="truncate">{title}</span>
          {subtitle && <span className="truncate text-xs font-normal text-muted-foreground">· {subtitle}</span>}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      </div>
      <ul className="-mx-1.5">{children}</ul>
    </div>
  )
}

function GroupSection({ id, title, subtitle, meta, children }: { id: string; title: string; subtitle?: string; meta: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2">
        <h2 id={id} className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Globe2 className="size-4 text-primary" />
          {title}
          {subtitle && <span className="font-sans text-xs font-normal text-muted-foreground">{subtitle}</span>}
        </h2>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </header>
      <div className="columns-1 gap-3 @2xl:columns-2 @5xl:columns-3">{children}</div>
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
    <div className="@container space-y-6">
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
                  <li key={`${city.key}-label`} className="flex items-center justify-between px-1.5 pt-1.5 pb-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase first:pt-0.5">
                    {city.label}
                    <span className="tabular-nums">{city.associations.length}</span>
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
