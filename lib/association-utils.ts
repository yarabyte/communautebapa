import type { Association, AssociationZone } from "./types"

type Located = Pick<Association, "city" | "region" | "country">

export type CityGroup<T extends Association = Association> = { key: string; city?: string; region?: string; associations: T[] }
export type CountryGroup<T extends Association = Association> = { country: string; zone: AssociationZone; count: number; cities: CityGroup<T>[] }

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export function matchesAssociation(a: Association, q: string) {
  const needle = normalize(q.trim())
  return !needle || normalize([a.name, a.fullName, a.shortName, a.city, a.region, a.country].filter(Boolean).join(" ")).includes(needle)
}

/** « Yaoundé, Cameroun », « Québec, Canada » ou « Belgique » selon les informations connues. */
export function associationPlace(a: Located, withCountry = true) {
  const local = a.city ?? a.region
  if (!local) return a.country
  return withCountry ? `${local}, ${a.country}` : local
}

/** Monogramme pour les pastilles : « CREM », « HB » (Hommes Bafia), « QT » (Quartier Tsela). */
export function monogram(text: string) {
  const words = text.replace(/[()'’.]/g, " ").split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/** Libellé d'un groupe de ville : « Yaoundé · Centre », « Extrême-Nord », « Ville non précisée ». */
export function cityGroupLabel(group: Pick<CityGroup, "city" | "region">, country: string) {
  if (group.city && group.region && country === "Cameroun") return { title: group.city, subtitle: `Région ${group.region}` }
  if (group.city) return { title: group.city, subtitle: undefined }
  if (group.region) return { title: group.region, subtitle: "Ville non précisée" }
  return { title: "Tout le pays", subtitle: "Ville non précisée" }
}

/** Regroupe par pays puis par ville, en conservant l'ordre de la liste officielle (Cameroun d'abord). */
export function groupByCountryAndCity<T extends Association>(list: T[]): CountryGroup<T>[] {
  const countries = new Map<string, CountryGroup<T>>()
  for (const a of list) {
    let country = countries.get(a.country)
    if (!country) {
      country = { country: a.country, zone: a.zone, count: 0, cities: [] }
      countries.set(a.country, country)
    }
    country.count++
    const key = a.city ?? a.region ?? ""
    let city = country.cities.find((c) => c.key === key)
    if (!city) {
      city = { key, city: a.city, region: a.region, associations: [] }
      country.cities.push(city)
    }
    city.associations.push(a)
  }
  return [...countries.values()]
}
