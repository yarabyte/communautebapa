/* Types alignés sur prisma/schema.prisma */

export type Role = "MEMBER" | "ASSOCIATION_ADMIN" | "TREASURER" | "SUPER_ADMIN"
export type MemberStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED"
export type Gender = "FEMME" | "HOMME"
export type AuthProvider = "EMAIL" | "PHONE" | "GOOGLE" | "APPLE" | "FACEBOOK" | "MAGIC_LINK"

export type Quartier = { id: string; name: string }
export type BapaLink = "NAISSANCE" | "FILIATION" | "ALLIANCE" | "AMI"

/** Seuls le nom, le prénom et un identifiant (email ou téléphone) sont demandés à l'inscription ; le reste est complété ensuite. */
export type Member = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  gender?: Gender
  birthYear?: number
  quartierId?: string
  family?: string
  link?: BapaLink
  country?: string
  city?: string
  profession?: string
  bio?: string
  showInDirectory?: boolean
  onboardedAt?: string
  role: Role
  status: MemberStatus
  provider: AuthProvider
  joinedAt: string
  motivation?: string
  sponsorName?: string
}

export type AssociationCategory = "COMMUNAUTE" | "HOMMES" | "FEMMES" | "QUARTIER" | "GROUPE" | "DIASPORA"
export type AssociationZone = "AFRIQUE" | "EUROPE" | "AMERIQUE_DU_NORD"
export type Tone = "terre" | "nuit" | "ocre" | "indigo" | "olive" | "creme"

export type Association = {
  id: string
  slug: string
  /** Nom d'usage (tel que dans la liste officielle, rendu unique si besoin). */
  name: string
  shortName: string
  /** Nom développé du sigle, quand il est connu. */
  fullName?: string
  category: AssociationCategory
  zone: AssociationZone
  country: string
  region?: string
  city?: string
  description: string
  mission: string
  cover: string
  tone: Tone
  foundedYear?: number
  isPublic: boolean
  presidentId?: string
  meetingInfo?: string
  /** Figure dans la liste des associations affiliées à l'ADEVIPA. */
  adevipa: boolean
  source: string
  notes?: string
}

export type MembershipRole = "MEMBRE" | "RESPONSABLE" | "TRESORIER" | "SECRETAIRE"

export type Membership = {
  memberId: string
  associationId: string
  role: MembershipRole
  since: string
}

export type EventCategory = "FESTIVAL" | "REUNION" | "CULTURE" | "SOLIDARITE" | "SPORT"

export type BapaEvent = {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  startsAt: string
  endsAt?: string
  location: string
  image: string
  category: EventCategory
  isPublic: boolean
  associationId?: string
  capacity: number
  registered: number
}

export type PostCategory = "ANNONCE" | "VIE_DU_VILLAGE" | "PROJET" | "ASSOCIATION" | "CARNET"

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string[]
  image: string
  category: PostCategory
  publishedAt: string
  authorId: string
  associationId?: string
  pinned?: boolean
}

export type ProjectStatus = "A_VENIR" | "EN_COURS" | "TERMINE"
export type ProjectCategory = "EDUCATION" | "SANTE" | "INFRASTRUCTURE" | "CULTURE" | "EAU"

export type ProjectUpdate = { date: string; title: string; text: string }

export type Project = {
  id: string
  slug: string
  title: string
  summary: string
  description: string[]
  image: string
  category: ProjectCategory
  status: ProjectStatus
  goalXaf: number
  raisedXaf: number
  contributorsCount: number
  startDate: string
  endDate?: string
  associationId?: string
  updates: ProjectUpdate[]
}

export type Currency = "XAF" | "EUR" | "USD"
export type PaymentMethod = "ORANGE_MONEY" | "MTN_MOMO" | "CARD" | "PAYPAL" | "CASH"
export type ContributionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export type Contribution = {
  id: string
  reference: string
  memberId: string
  projectId: string
  amount: number
  currency: Currency
  amountXaf: number
  method: PaymentMethod
  status: ContributionStatus
  createdAt: string
  recordedById?: string
  anonymous?: boolean
}

export type DocumentType = "PV" | "STATUTS" | "RAPPORT" | "FINANCIER" | "AUTRE"

export type BapaDocument = {
  id: string
  title: string
  type: DocumentType
  fileType: "pdf" | "docx" | "xlsx"
  sizeKb: number
  associationId?: string
  uploadedAt: string
  uploadedById: string
}

export type Conversation = {
  id: string
  type: "DIRECT" | "GROUP"
  name?: string
  associationId?: string
  participantIds: string[]
}

export type Message = {
  id: string
  conversationId: string
  authorId: string
  content: string
  createdAt: string
}

/* ---------- Entrepreneurs Bapa ---------- */

export type BusinessSector = { id: string; name: string; icon: string }

export type BusinessVisibility = "PUBLIC" | "MEMBERS"
export type BusinessStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED"

export type BusinessService = { name: string; description?: string; price?: number; currency?: Currency }

export type BusinessSocials = { facebook?: string; instagram?: string; linkedin?: string; tiktok?: string }

export type Business = {
  id: string
  slug: string
  ownerId: string
  name: string
  logo?: string
  tone: Tone
  sectorId: string
  description: string
  services: BusinessService[]
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  socials: BusinessSocials
  address?: string
  city: string
  country: string
  mapsUrl?: string
  visibility: BusinessVisibility
  status: BusinessStatus
  /** Motif communiqué au membre en cas de refus. */
  reviewNote?: string
  /** « Entrepreneur du mois » sur l'accueil. */
  featured: boolean
  createdAt: string
}

export type Recommendation = { businessId: string; memberId: string; comment?: string; createdAt: string }

export type JobType = "CDI" | "CDD" | "STAGE" | "FREELANCE"

export type JobOffer = {
  id: string
  slug: string
  businessId: string
  title: string
  type: JobType
  city: string
  country: string
  description: string
  applyContact: string
  publishedAt: string
  expiresAt?: string
  status: "OPEN" | "CLOSED"
}
