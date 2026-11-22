import { hash } from "bcryptjs"
import {
  AssociationCategory,
  AssociationZone,
  MembershipRole,
  PrismaClient,
  Role,
  MemberStatus,
  AuthProvider,
  Gender,
  BapaLink,
} from "@prisma/client"

import { associationRows } from "../lib/mock/associations-source"
import { sectors as businessSectorSeed } from "../lib/mock/businesses"

const prisma = new PrismaClient()

const QUARTIER_NAMES = ["Tsela", "Djeukou", "Top", "Ndenpa", "Lagou", "Djeuwang", "Lou'g"]
const GENERIC_COMMUNITY = "Communauté (Hommes et Femmes)"

function categoryOf(name: string, country: string): AssociationCategory {
  if (country !== "Cameroun") return "DIASPORA"
  if (name === GENERIC_COMMUNITY) return "COMMUNAUTE"
  if (/^(Femmes|Réunion générale des Femmes)/.test(name)) return "FEMMES"
  if (/^(Hommes|Réunion générale des Hommes|Générale Hommes)/.test(name)) return "HOMMES"
  if (QUARTIER_NAMES.some((q) => name.replace(/^Quartier /, "").split(/[-/ ]/)[0] === q)) return "QUARTIER"
  return "GROUPE"
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
  return `en ${country}`
}

function shortNameOf(name: string, city: string | null, region: string | null) {
  if (name === GENERIC_COMMUNITY) return `Bapa ${city ?? region}`
  const acronym = name.match(/\(([A-Z]{3,})\)/)
  if (acronym) return acronym[1]
  return name.split(" / ")[0]
}

function texts(category: AssociationCategory, name: string, where: string) {
  switch (category) {
    case "COMMUNAUTE":
      return {
        description: `Les hommes et les femmes originaires de Bapa établis ${where} se retrouvent au sein de cette communauté.`,
        mission: "Rassembler les filles et fils de Bapa de la localité.",
      }
    case "HOMMES":
      return {
        description: `La réunion des hommes originaires de Bapa ${where}.`,
        mission: "Maintenir la fraternité entre les hommes de Bapa.",
      }
    case "FEMMES":
      return {
        description: `La réunion des femmes originaires de Bapa ${where}.`,
        mission: "Soutenir les femmes de Bapa dans leurs projets.",
      }
    case "QUARTIER":
      return {
        description: `Les ressortissants du quartier établis ${where} se retrouvent pour garder le lien.`,
        mission: "Entretenir les liens entre familles du quartier.",
      }
    case "GROUPE":
      return {
        description: `${name} réunit des ressortissants de Bapa ${where}.`,
        mission: "Fédérer ses membres autour de la solidarité.",
      }
    case "DIASPORA":
      return {
        description: `Les filles et fils de Bapa vivant ${where} se retrouvent pour garder le lien avec le village.`,
        mission: "Rassembler la diaspora et soutenir les projets du village.",
      }
  }
}

const tones: Record<AssociationCategory, string[]> = {
  COMMUNAUTE: ["terre", "ocre"],
  HOMMES: ["nuit", "indigo"],
  FEMMES: ["terre", "olive"],
  QUARTIER: ["ocre", "olive"],
  GROUPE: ["indigo", "nuit"],
  DIASPORA: ["indigo", "nuit"],
}

const covers: Record<AssociationCategory, string[]> = {
  COMMUNAUTE: ["/images/palais-cour-bapa.jpg", "/images/paysage-bapa.png"],
  HOMMES: ["/images/chefferie-bapa.jpg", "/images/roi-bapa.jpg"],
  FEMMES: ["/images/gastronomie-bapa.jpg", "/images/maison-calebasse-bapa.jpg"],
  QUARTIER: ["/images/paysage-bapa.png", "/images/rocher-bapa.png"],
  GROUPE: ["/images/maison-calebasse-bapa.jpg", "/images/palais-cour-bapa.jpg"],
  DIASPORA: ["/images/festival-bapa-2023.png", "/images/hero-rochers-bapa.png"],
}

async function main() {
  for (const name of QUARTIER_NAMES) {
    await prisma.quartier.upsert({
      where: { name },
      create: { name },
      update: {},
    })
  }

  const passwordHash = await hash("AdminBapa2026!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@bapa-officiel.com" },
    create: {
      email: "admin@bapa-officiel.com",
      phone: "+237600000001",
      passwordHash,
      emailVerified: new Date(),
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
      provider: AuthProvider.EMAIL,
      profile: {
        create: {
          firstName: "Arnaud",
          lastName: "Kamga",
          gender: Gender.HOMME,
          family: "Famille Kamga Tchoua",
          link: BapaLink.NAISSANCE,
          country: "Cameroun",
          city: "Yaoundé",
          profession: "Administrateur",
          showInDirectory: true,
          onboardedAt: new Date(),
          quartier: { connect: { name: "Tsela" } },
        },
      },
    },
    update: {
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
    },
  })

  const usedSlugs = new Set<string>()
  let n = 0
  for (const [zone, country, region, city, rawName, fullName, source, notes] of associationRows) {
    n += 1
    const category = categoryOf(rawName, country)
    const name = rawName === GENERIC_COMMUNITY ? `Communauté Bapa de ${placeOf(city, region, country)}` : rawName
    const location = city ?? region ?? country
    let slug = slugify(name.split(" / ")[0])
    if (!slugify(name).includes(slugify(location))) slug = `${slug}-${slugify(location)}`
    while (usedSlugs.has(slug)) slug = `${slug}-${n}`
    usedSlugs.add(slug)

    const t = texts(category, name, inPlace(city, region, country))
    await prisma.association.upsert({
      where: { slug },
      create: {
        slug,
        name,
        shortName: shortNameOf(rawName, city, region),
        fullName: fullName ?? undefined,
        category,
        zone: zone as AssociationZone,
        country,
        region: region ?? undefined,
        city: city ?? undefined,
        description: t.description,
        mission: t.mission,
        coverUrl: covers[category][n % covers[category].length],
        tone: tones[category][n % tones[category].length],
        isPublic: true,
        adevipa: /ADEVIPA|deux sources/i.test(source),
        source,
        notes: notes ?? undefined,
      },
      update: {
        name,
        shortName: shortNameOf(rawName, city, region),
        description: t.description,
        mission: t.mission,
      },
    })
  }

  // Associe l'admin comme RESPONSABLE de la première association Yaoundé Tsela si elle existe
  const tsela = await prisma.association.findFirst({
    where: { name: { contains: "Tsela" }, city: "Yaoundé" },
  })
  if (tsela) {
    await prisma.membership.upsert({
      where: { userId_associationId: { userId: admin.id, associationId: tsela.id } },
      create: {
        userId: admin.id,
        associationId: tsela.id,
        role: MembershipRole.RESPONSABLE,
      },
      update: { role: MembershipRole.RESPONSABLE },
    })
  }

  let sectorCount = 0
  for (const [i, sector] of businessSectorSeed.entries()) {
    await prisma.businessSector.upsert({
      where: { name: sector.name },
      create: { name: sector.name, icon: sector.icon, position: i },
      update: { icon: sector.icon, position: i },
    })
    sectorCount += 1
  }

  console.log(`Seed OK — SUPER_ADMIN: admin@bapa-officiel.com / AdminBapa2026! (${n} associations, ${sectorCount} secteurs)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
