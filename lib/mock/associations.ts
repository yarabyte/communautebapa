import type { Association, AssociationCategory, Membership, Tone } from "../types"
import { associationRows } from "./associations-source"
import { members, quartiers } from "./members"

const QUARTIER_NAMES = ["Tsela", "Djeukou", "Djeuwang", "Ndenpa", "Lagou", "Top", "Lou'g"]
const GENERIC_COMMUNITY = "Communauté (Hommes et Femmes)"

/* Les présentations ci-dessous sont des textes génériques, à remplacer par ceux de chaque association. */

function categoryOf(name: string, country: string): AssociationCategory {
  if (country !== "Cameroun") return "DIASPORA"
  if (name === GENERIC_COMMUNITY) return "COMMUNAUTE"
  if (/^(Femmes|Réunion générale des Femmes)/.test(name)) return "FEMMES"
  if (/^(Hommes|Réunion générale des Hommes|Générale Hommes)/.test(name)) return "HOMMES"
  if (QUARTIER_NAMES.some((q) => name.replace(/^Quartier /, "").split(/[-/ ]/)[0] === q)) return "QUARTIER"
  return "GROUPE"
}

function quartiersIn(name: string) {
  return QUARTIER_NAMES.filter((q) => name.includes(q))
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const covers: Record<AssociationCategory, string[]> = {
  COMMUNAUTE: ["/images/palais-cour-bapa.jpg", "/images/paysage-bapa.png"],
  HOMMES: ["/images/chefferie-bapa.jpg", "/images/roi-bapa.jpg"],
  FEMMES: ["/images/gastronomie-bapa.jpg", "/images/maison-calebasse-bapa.jpg"],
  QUARTIER: ["/images/paysage-bapa.png", "/images/rocher-bapa.png"],
  GROUPE: ["/images/maison-calebasse-bapa.jpg", "/images/palais-cour-bapa.jpg"],
  DIASPORA: ["/images/festival-bapa-2023.png", "/images/hero-rochers-bapa.png"],
}

const tones: Record<AssociationCategory, Tone[]> = {
  COMMUNAUTE: ["terre", "ocre"],
  HOMMES: ["nuit", "indigo"],
  FEMMES: ["terre", "olive"],
  QUARTIER: ["ocre", "olive"],
  GROUPE: ["indigo", "nuit"],
  DIASPORA: ["indigo", "nuit"],
}

function placeOf(city: string | null, region: string | null, country: string) {
  if (city) return city
  if (region && country === "Cameroun") return `l'${region}`
  if (region) return `${region} (${country})`
  return country
}

function inPlace(city: string | null, region: string | null, country: string) {
  if (city) return `à ${city}`
  if (region && country === "Cameroun") return `dans l'${region}`
  if (region) return `au ${region}`
  const prepositions: Record<string, string> = {
    "Afrique du Sud": "en Afrique du Sud",
    "Allemagne / Luxembourg": "en Allemagne et au Luxembourg",
    Belgique: "en Belgique",
    Canada: "au Canada",
    France: "en France",
    Italie: "en Italie",
    "Royaume-Uni": "au Royaume-Uni",
  }
  return prepositions[country] ?? `en ${country}`
}

function texts(category: AssociationCategory, name: string, where: string) {
  const qs = quartiersIn(name)
  switch (category) {
    case "COMMUNAUTE":
      return {
        description: `Les hommes et les femmes originaires de Bapa établis ${where} se retrouvent au sein de cette communauté pour l'entraide, les nouvelles du village et le soutien aux projets.`,
        mission: "Rassembler les filles et fils de Bapa de la localité, se soutenir dans les moments heureux comme difficiles et relayer l'action de la chefferie.",
      }
    case "HOMMES":
      return {
        description: `La réunion des hommes originaires de Bapa ${where} : solidarité lors des événements familiaux, entraide et mobilisation pour le village.`,
        mission: "Maintenir la fraternité entre les hommes de Bapa et contribuer aux grands rendez-vous de la communauté.",
      }
    case "FEMMES":
      return {
        description: `La réunion des femmes originaires de Bapa ${where} : solidarité, épargne et transmission des savoir-faire.`,
        mission: "Soutenir les femmes de Bapa dans leurs projets et faire vivre les traditions et la solidarité familiale.",
      }
    case "QUARTIER":
      return {
        description: `Les ressortissants ${qs.length > 1 ? `des quartiers ${qs.join(" et ")}` : `du quartier ${qs[0]}`} de Bapa établis ${where} se retrouvent pour garder le lien avec leur quartier d'origine.`,
        mission: "Entretenir les liens entre familles du quartier, accueillir les nouveaux arrivants et soutenir le quartier au village.",
      }
    case "GROUPE":
      return {
        description: `${name} réunit des ressortissants de Bapa ${where} autour de l'entraide et de la vie de la communauté.`,
        mission: "Fédérer ses membres autour de la solidarité et des projets de développement de Bapa.",
      }
    case "DIASPORA":
      return {
        description: `Les filles et fils de Bapa vivant ${where} se retrouvent pour garder le lien avec le village, accueillir les nouveaux arrivants et soutenir les projets de développement.`,
        mission: "Rassembler la diaspora, faire rayonner la culture Bapa et mobiliser pour les projets du village.",
      }
  }
}

function shortNameOf(name: string, city: string | null, region: string | null) {
  if (name === GENERIC_COMMUNITY) return `Bapa ${city ?? region}`
  const acronym = name.match(/\(([A-Z]{3,})\)/)
  if (acronym) return acronym[1]
  return name.split(" / ")[0]
}

/** Responsables connus dans les données de démonstration. */
const presidents: Record<number, string> = { 17: "m1", 33: "m15", 34: "m10", 53: "m6", 72: "m4", 73: "m3", 78: "m9" }

const usedSlugs = new Set<string>()

export const associations: Association[] = associationRows.map(([zone, country, region, city, rawName, fullName, source, notes], index) => {
  const n = index + 1
  const category = categoryOf(rawName, country)
  const name = rawName === GENERIC_COMMUNITY ? `Communauté Bapa de ${placeOf(city, region, country)}` : rawName
  const location = city ?? region ?? country
  let slug = slugify(name.split(" / ")[0])
  if (!slugify(name).includes(slugify(location))) slug = `${slug}-${slugify(location)}`
  while (usedSlugs.has(slug)) slug = `${slug}-${n}`
  usedSlugs.add(slug)

  const covers_ = covers[category]
  const tones_ = tones[category]

  return {
    id: `as${n}`,
    slug,
    name,
    shortName: shortNameOf(rawName, city, region),
    fullName: fullName ?? undefined,
    category,
    zone,
    country,
    region: region ?? undefined,
    city: city ?? undefined,
    ...texts(category, name, inPlace(city, region, country)),
    cover: covers_[n % covers_.length],
    tone: tones_[n % tones_.length],
    isPublic: true,
    presidentId: presidents[n],
    adevipa: /ADEVIPA|deux sources/i.test(source),
    source,
    notes: notes ?? undefined,
  }
})

const activeMembers = members.filter((m) => m.status === "ACTIVE" || m.status === "SUSPENDED")
const pickCursor = new Map<string, number>()

function pickMember(pool: typeof activeMembers, key: string) {
  if (pool.length === 0) return undefined
  const index = pickCursor.get(key) ?? 0
  pickCursor.set(key, index + 1)
  return pool[index % pool.length]
}

for (const association of associations) {
  if (association.presidentId) continue
  const inCity = activeMembers.filter((m) => association.city && m.city === association.city)
  const inCountry = activeMembers.filter((m) => m.country === association.country)
  const chosen =
    pickMember(inCity, `city:${association.city}`) ??
    pickMember(inCountry, `country:${association.country}`) ??
    pickMember(activeMembers, "all")
  if (chosen) association.presidentId = chosen.id
}

export function presidentName(associationId: string) {
  const memberId = associations.find((a) => a.id === associationId)?.presidentId
  const member = activeMembers.find((m) => m.id === memberId) ?? members.find((m) => m.id === memberId)
  return member ? `${member.firstName} ${member.lastName}` : undefined
}

/* ---------- Adhésions de démonstration ---------- */

const diasporaByCountry: Record<string, string> = {
  France: "COBAF",
  Belgique: "ABB",
  Allemagne: "ABA",
  Canada: "POUAPA Canada",
  "États-Unis": "BAPA DC",
}

/** Adhésions complémentaires utilisées par les contenus de démonstration. */
const extraMemberships: Record<string, string[]> = { m1: ["as17"], m8: ["as17"], m13: ["as17"], m19: ["as17"] }

function associationsFor(m: (typeof members)[number]): string[] {
  const ids = new Set<string>(extraMemberships[m.id])
  associations.forEach((a) => a.presidentId === m.id && ids.add(a.id))

  if (m.country === "Cameroun") {
    const local = associations.filter((a) => a.city === m.city)
    const quartier = quartiers.find((q) => q.id === m.quartierId)?.name
    const ofQuartier = local.find((a) => a.category === "QUARTIER" && quartier && a.name.includes(quartier))
    const ofGender = local.find((a) => a.category === (m.gender === "FEMME" ? "FEMMES" : "HOMMES"))
    const community = local.find((a) => a.category === "COMMUNAUTE")
    ;[ofQuartier, ofGender, community].forEach((a) => a && ids.add(a.id))
  } else if (m.country) {
    const name = m.city === "Montréal" ? "POUAPA Québec" : diasporaByCountry[m.country]
    const diaspora = associations.find((a) => a.name === name)
    if (diaspora) ids.add(diaspora.id)
  }
  return [...ids]
}

const roleFor = (memberId: string, associationId: string): Membership["role"] => {
  const assoc = associations.find((a) => a.id === associationId)
  if (assoc?.presidentId === memberId) return "RESPONSABLE"
  if (memberId === "m2" && associationId === "as34") return "TRESORIER"
  if (memberId === "m8" && associationId === "as17") return "SECRETAIRE"
  return "MEMBRE"
}

export const memberships: Membership[] = members
  .filter((m) => m.status === "ACTIVE" || m.status === "SUSPENDED")
  .flatMap((m) =>
    associationsFor(m).map((associationId) => ({
      memberId: m.id,
      associationId,
      role: roleFor(m.id, associationId),
      since: m.joinedAt,
    }))
  )
