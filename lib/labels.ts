import type {
  BapaLink,
  BusinessStatus,
  BusinessVisibility,
  JobType,
  AssociationCategory,
  AssociationZone,
  AuthProvider,
  ContributionStatus,
  Currency,
  DocumentType,
  EventCategory,
  ForumCategory,
  MemberStatus,
  MembershipRole,
  PaymentMethod,
  PostCategory,
  ProjectCategory,
  ProjectStatus,
  Role,
} from "./types"

export const roleLabels: Record<Role, string> = {
  MEMBER: "Membre",
  ASSOCIATION_ADMIN: "Responsable d'association",
  TREASURER: "Trésorier",
  SUPER_ADMIN: "Super administrateur",
}

export const providerLabels: Record<AuthProvider, string> = {
  EMAIL: "Email et mot de passe",
  PHONE: "Téléphone (OTP)",
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  MAGIC_LINK: "Lien magique",
}

export const bapaLinkLabels: Record<BapaLink, string> = {
  NAISSANCE: "Né(e) à Bapa",
  FILIATION: "Parent originaire de Bapa",
  ALLIANCE: "Par alliance (mariage)",
  AMI: "Ami(e) du village",
}

export const memberStatusLabels: Record<MemberStatus, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  REJECTED: "Refusé",
}

export const associationCategoryLabels: Record<AssociationCategory, string> = {
  COMMUNAUTE: "Communauté",
  HOMMES: "Hommes",
  FEMMES: "Femmes",
  QUARTIER: "Quartier d'origine",
  GROUPE: "Cercle / groupe",
  DIASPORA: "Diaspora",
}

export const associationZoneLabels: Record<AssociationZone, string> = {
  AFRIQUE: "Afrique",
  EUROPE: "Europe",
  AMERIQUE_DU_NORD: "Amérique du Nord",
}

export const membershipRoleLabels: Record<MembershipRole, string> = {
  MEMBRE: "Membre",
  RESPONSABLE: "Responsable",
  TRESORIER: "Trésorier",
  SECRETAIRE: "Secrétaire",
}

export const eventCategoryLabels: Record<EventCategory, string> = {
  FESTIVAL: "Festival",
  REUNION: "Réunion",
  CULTURE: "Culture",
  SOLIDARITE: "Solidarité",
  SPORT: "Sport",
}

export const postCategoryLabels: Record<PostCategory, string> = {
  ANNONCE: "Annonce",
  VIE_DU_VILLAGE: "Vie du village",
  PROJET: "Projet",
  ASSOCIATION: "Association",
  CARNET: "Carnet",
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
}

export const projectCategoryLabels: Record<ProjectCategory, string> = {
  EDUCATION: "Éducation",
  SANTE: "Santé",
  INFRASTRUCTURE: "Infrastructure",
  CULTURE: "Culture",
  EAU: "Eau et assainissement",
}

export const currencyLabels: Record<Currency, string> = {
  XAF: "FCFA",
  EUR: "Euro",
  USD: "Dollar US",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MOMO: "MTN Mobile Money",
  CARD: "Carte bancaire",
  PAYPAL: "PayPal",
  CASH: "Espèces",
}

export const contributionStatusLabels: Record<ContributionStatus, string> = {
  PENDING: "En attente",
  COMPLETED: "Confirmée",
  FAILED: "Échouée",
  REFUNDED: "Remboursée",
}

export const documentTypeLabels: Record<DocumentType, string> = {
  PV: "Procès-verbal",
  STATUTS: "Statuts",
  RAPPORT: "Rapport",
  FINANCIER: "Financier",
  AUTRE: "Autre",
}

export const forumCategoryLabels: Record<ForumCategory, string> = {
  GENERAL: "Général",
  VILLAGE: "Vie du village",
  PROJETS: "Projets",
  CULTURE: "Culture et traditions",
  ENTRAIDE: "Entraide",
}

export const businessStatusLabels: Record<BusinessStatus, string> = {
  DRAFT: "Brouillon",
  PENDING: "En attente de validation",
  PUBLISHED: "Publiée",
  REJECTED: "Refusée",
}

export const businessVisibilityLabels: Record<BusinessVisibility, string> = {
  PUBLIC: "Publique (site et moteurs de recherche)",
  MEMBERS: "Réservée aux membres",
}

export const jobTypeLabels: Record<JobType, string> = {
  CDI: "CDI",
  CDD: "CDD",
  STAGE: "Stage",
  FREELANCE: "Mission / freelance",
}
