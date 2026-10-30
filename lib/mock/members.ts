import type { Member, Quartier } from "../types"

/* Quartiers déduits des associations de quartier de la liste officielle (Douala, Yaoundé, Bafoussam). */
export const quartiers: Quartier[] = [
  { id: "q1", name: "Tsela" },
  { id: "q2", name: "Djeukou" },
  { id: "q3", name: "Top" },
  { id: "q4", name: "Ndenpa" },
  { id: "q5", name: "Lagou" },
  { id: "q6", name: "Djeuwang" },
  { id: "q7", name: "Lou'g" },
]

type Seed = [
  id: string,
  firstName: string,
  lastName: string,
  gender: NonNullable<Member["gender"]>,
  quartierId: string,
  family: string,
  city: string,
  country: string,
  profession: string,
  role: Member["role"],
  status: Member["status"],
  joinedAt: string,
]

const seeds: Seed[] = [
  ["m1", "Arnaud", "Kamga", "HOMME", "q1", "Famille Kamga Tchoua", "Yaoundé", "Cameroun", "Ingénieur informatique", "SUPER_ADMIN", "ACTIVE", "2024-02-11"],
  ["m2", "Brigitte", "Fotso", "FEMME", "q2", "Famille Fotso Ndé", "Douala", "Cameroun", "Pharmacienne", "TREASURER", "ACTIVE", "2024-03-02"],
  ["m3", "Christian", "Tchoupo", "HOMME", "q3", "Famille Tchoupo", "Paris", "France", "Médecin", "ASSOCIATION_ADMIN", "ACTIVE", "2024-03-15"],
  ["m4", "Danielle", "Nguemo", "FEMME", "q4", "Famille Nguemo Kuaté", "Montréal", "Canada", "Comptable", "ASSOCIATION_ADMIN", "ACTIVE", "2024-04-20"],
  ["m5", "Emmanuel", "Djoumessi", "HOMME", "q1", "Famille Djoumessi", "Bapa", "Cameroun", "Agriculteur", "MEMBER", "ACTIVE", "2024-05-08"],
  ["m6", "Florence", "Tchatchoua", "FEMME", "q5", "Famille Tchatchoua", "Bafoussam", "Cameroun", "Enseignante", "MEMBER", "ACTIVE", "2024-05-21"],
  ["m7", "Gaston", "Kengne", "HOMME", "q6", "Famille Kengne Fokou", "Lyon", "France", "Architecte", "MEMBER", "ACTIVE", "2024-06-03"],
  ["m8", "Hélène", "Mbouda", "FEMME", "q2", "Famille Mbouda", "Yaoundé", "Cameroun", "Avocate", "MEMBER", "ACTIVE", "2024-06-17"],
  ["m9", "Ibrahim", "Ngassa", "HOMME", "q7", "Famille Ngassa", "Houston", "États-Unis", "Ingénieur pétrolier", "ASSOCIATION_ADMIN", "ACTIVE", "2024-07-01"],
  ["m10", "Josiane", "Kuaté", "FEMME", "q3", "Famille Kuaté Simo", "Douala", "Cameroun", "Commerçante", "MEMBER", "ACTIVE", "2024-07-19"],
  ["m11", "Kevin", "Simo", "HOMME", "q3", "Famille Simo", "Bapa", "Cameroun", "Étudiant", "MEMBER", "ACTIVE", "2024-08-05"],
  ["m12", "Laure", "Fokou", "FEMME", "q4", "Famille Fokou", "Bruxelles", "Belgique", "Infirmière", "MEMBER", "ACTIVE", "2024-08-22"],
  ["m13", "Martin", "Tagne", "HOMME", "q5", "Famille Tagne", "Yaoundé", "Cameroun", "Fonctionnaire", "MEMBER", "ACTIVE", "2024-09-10"],
  ["m14", "Nadège", "Wamba", "FEMME", "q6", "Famille Wamba", "Berlin", "Allemagne", "Chercheuse", "MEMBER", "ACTIVE", "2024-10-01"],
  ["m15", "Olivier", "Tchinda", "HOMME", "q1", "Famille Tchinda", "Douala", "Cameroun", "Entrepreneur", "MEMBER", "ACTIVE", "2024-11-12"],
  ["m16", "Patricia", "Ndé", "FEMME", "q7", "Famille Ndé", "Bafoussam", "Cameroun", "Sage-femme", "MEMBER", "ACTIVE", "2025-01-09"],
  ["m17", "Roger", "Fotsing", "HOMME", "q5", "Famille Fotsing", "Atlanta", "États-Unis", "Chef cuisinier", "MEMBER", "ACTIVE", "2025-02-14"],
  ["m18", "Sandrine", "Tsafack", "FEMME", "q2", "Famille Tsafack", "Paris", "France", "Juriste", "MEMBER", "ACTIVE", "2025-03-30"],
  ["m19", "Thierry", "Nana", "HOMME", "q3", "Famille Nana", "Yaoundé", "Cameroun", "Journaliste", "MEMBER", "SUSPENDED", "2025-04-18"],
  ["m20", "Valérie", "Kamdem", "FEMME", "q4", "Famille Kamdem", "Genève", "Suisse", "Banquière", "MEMBER", "ACTIVE", "2025-06-02"],
  ["m21", "Yannick", "Feutcheu", "HOMME", "q5", "Famille Feutcheu", "Douala", "Cameroun", "Électricien", "MEMBER", "PENDING", "2026-10-26"],
  ["m22", "Aline", "Mbiandou", "FEMME", "", "", "", "", "", "MEMBER", "PENDING", "2026-10-27"],
  ["m23", "Bertrand", "Youmbi", "HOMME", "q1", "Famille Youmbi", "", "", "", "MEMBER", "PENDING", "2026-10-28"],
  ["m24", "Cécile", "Talla", "FEMME", "q7", "Famille Talla", "Toronto", "Canada", "Analyste financière", "MEMBER", "PENDING", "2026-10-29"],
  ["m25", "Didier", "Sop", "HOMME", "q7", "Famille Sop", "Yaoundé", "Cameroun", "Chauffeur", "MEMBER", "REJECTED", "2026-09-12"],
]

const LINKS_CYCLE: NonNullable<Member["link"]>[] = ["NAISSANCE", "FILIATION", "NAISSANCE", "ALLIANCE", "FILIATION"]

const providers: Member["provider"][] = ["EMAIL", "PHONE", "GOOGLE", "FACEBOOK", "MAGIC_LINK"]

export const members: Member[] = seeds.map(
  ([id, firstName, lastName, gender, quartierId, family, city, country, profession, role, status, joinedAt], i) => ({
    id,
    firstName,
    lastName,
    gender: id === "m22" ? undefined : gender,
    quartierId: quartierId || undefined,
    family: family || undefined,
    link: quartierId ? LINKS_CYCLE[i % LINKS_CYCLE.length] : undefined,
    city: city || undefined,
    country: country || undefined,
    profession: profession || undefined,
    role,
    status,
    joinedAt,
    showInDirectory: status === "ACTIVE",
    onboardedAt: status === "PENDING" && !city ? undefined : joinedAt,
    email: `${firstName}.${lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@exemple.com",
    phone: `+237 6${(70 + i).toString()} ${String(100 + i * 7).slice(-3)} ${String(200 + i * 13).slice(-3)}`,
    birthYear: city ? 1960 + ((i * 7) % 42) : undefined,
    provider: providers[i % providers.length],
    bio:
      i % 3 === 0 && profession
        ? `Fils/fille de Bapa, ${profession.toLowerCase()} à ${city}. Engagé(e) pour le développement du village et la transmission de nos traditions.`
        : undefined,
    motivation:
      status === "PENDING" && city
        ? "Je souhaite rejoindre la communauté pour rester proche du village, participer aux projets et retrouver les ressortissants de ma ville."
        : undefined,
    sponsorName: status === "PENDING" && quartierId ? (i % 2 === 0 ? "Arnaud Kamga" : "Brigitte Fotso") : undefined,
  })
)
