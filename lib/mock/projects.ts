import type { Contribution, Currency, PaymentMethod, Project } from "../types"
import { XAF_RATES } from "../constants"

export const projects: Project[] = [
  {
    id: "pr1",
    slug: "forage-eau-potable",
    title: "Forage et bornes-fontaines pour l'eau potable",
    summary: "Apporter l'eau potable à plus de 1 200 habitants grâce à un forage, un château d'eau et trois bornes-fontaines.",
    description: [
      "Une partie du village ne dispose aujourd'hui que d'un point d'eau saisonnier. Le projet prévoit un forage de 80 mètres, un château d'eau de 20 m³ et trois bornes-fontaines.",
      "Le comité de développement suit les travaux avec les notables des quartiers concernés. Chaque contribution est tracée et un rapport financier est publié chaque trimestre.",
    ],
    image: "/images/paysage-bapa.png",
    category: "EAU",
    status: "EN_COURS",
    goalXaf: 18_000_000,
    raisedXaf: 12_650_000,
    contributorsCount: 214,
    startDate: "2026-03-01",
    endDate: "2026-12-20",
    updates: [
      { date: "2026-10-22", title: "Château d'eau installé", text: "La structure de 20 m³ est en place. Pose des canalisations en cours." },
      { date: "2026-07-14", title: "Forage réussi", text: "L'eau a été trouvée à 76 mètres, avec un débit conforme aux attentes." },
      { date: "2026-03-01", title: "Lancement du chantier", text: "Bénédiction du site par les notables et début des travaux." },
    ],
  },
  {
    id: "pr2",
    slug: "equipement-centre-de-sante",
    title: "Équipement du centre de santé",
    summary: "Doter le centre de santé d'une maternité équipée, d'un laboratoire et d'un panneau solaire.",
    description: [
      "Le centre de santé de Bapa accueille chaque mois plus de 600 patients. Le projet finance une table d'accouchement, une couveuse, un laboratoire d'analyses de base et une installation solaire.",
      "La diaspora de France porte ce projet avec le comité de développement.",
    ],
    image: "/images/chefferie-bapa.jpg",
    category: "SANTE",
    status: "EN_COURS",
    goalXaf: 25_000_000,
    raisedXaf: 9_800_000,
    contributorsCount: 131,
    startDate: "2026-05-01",
    associationId: "as73",
    updates: [{ date: "2026-09-10", title: "Commande de la couveuse", text: "Premier équipement commandé grâce au gala 2025." }],
  },
  {
    id: "pr3",
    slug: "bourses-scolaires-2027",
    title: "Bourses scolaires 2027",
    summary: "Financer la scolarité de 60 élèves du collège et du lycée de Bapa pour la rentrée 2027.",
    description: [
      "Chaque bourse couvre les frais de scolarité, les manuels et les fournitures d'un élève pour une année.",
      "Les bénéficiaires sont choisis par un comité mixte (enseignants, parents, association) sur critères sociaux et scolaires.",
    ],
    image: "/images/maison-calebasse-bapa.jpg",
    category: "EDUCATION",
    status: "EN_COURS",
    goalXaf: 9_000_000,
    raisedXaf: 3_150_000,
    contributorsCount: 88,
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    associationId: "as72",
    updates: [],
  },
  {
    id: "pr4",
    slug: "restauration-toitures-palais",
    title: "Restauration des toitures du palais",
    summary: "Restaurer les toitures traditionnelles des cases du palais dans le respect des savoir-faire anciens.",
    description: [
      "Les toitures coniques des cases du palais nécessitent une restauration. Les artisans du village seront mobilisés, avec des matériaux traditionnels.",
    ],
    image: "/images/palais-cour-bapa.jpg",
    category: "CULTURE",
    status: "A_VENIR",
    goalXaf: 12_000_000,
    raisedXaf: 850_000,
    contributorsCount: 17,
    startDate: "2027-01-15",
    updates: [],
  },
  {
    id: "pr5",
    slug: "route-du-massif",
    title: "Réhabilitation de la route du massif",
    summary: "Route d'accès aux rochers de Bapa réhabilitée sur 3,2 km pour les habitants et les visiteurs.",
    description: ["Projet achevé en 2025 grâce à 340 contributeurs et à l'investissement humain des jeunes du village."],
    image: "/images/rocher-bapa.png",
    category: "INFRASTRUCTURE",
    status: "TERMINE",
    goalXaf: 15_000_000,
    raisedXaf: 15_420_000,
    contributorsCount: 340,
    startDate: "2024-11-01",
    endDate: "2025-08-30",
    updates: [{ date: "2025-08-30", title: "Route inaugurée", text: "Inauguration en présence de Sa Majesté et des notables." }],
  },
]

const methods: PaymentMethod[] = ["ORANGE_MONEY", "MTN_MOMO", "CARD", "PAYPAL", "CASH", "ORANGE_MONEY", "MTN_MOMO"]
const amountsXaf = [5_000, 10_000, 25_000, 50_000, 15_000, 100_000, 20_000, 30_000]
const contributorIds = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14", "m15", "m16", "m17", "m18", "m20"]

export const contributions: Contribution[] = Array.from({ length: 48 }, (_, i) => {
  const memberId = i % 4 === 0 ? "m1" : contributorIds[(i * 5) % contributorIds.length]
  const method = methods[i % methods.length]
  const currency: Currency = method === "PAYPAL" ? (i % 2 ? "EUR" : "USD") : method === "CARD" && i % 3 === 0 ? "EUR" : "XAF"
  const baseXaf = amountsXaf[i % amountsXaf.length]
  const amount = currency === "XAF" ? baseXaf : Math.round(baseXaf / XAF_RATES[currency])
  const date = new Date(Date.UTC(2026, 9, 29) - i * 6.5 * 24 * 3600 * 1000)
  const status = i === 2 ? "PENDING" : i === 9 ? "FAILED" : i === 17 ? "REFUNDED" : "COMPLETED"
  return {
    id: `c${i + 1}`,
    reference: `BAPA-${date.getUTCFullYear()}-${String(1000 + 48 - i).padStart(5, "0")}`,
    memberId,
    projectId: projects[i % 4].id,
    amount,
    currency,
    amountXaf: currency === "XAF" ? amount : Math.round(amount * XAF_RATES[currency]),
    method,
    status,
    createdAt: date.toISOString(),
    recordedById: method === "CASH" ? "m2" : undefined,
    anonymous: i % 11 === 0,
  }
})
