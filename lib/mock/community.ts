import type { BapaDocument, Conversation, Message } from "../types"

/** Tous les documents sont rattachés à une association : visibles uniquement par ses membres. */
export const documents: BapaDocument[] = [
  { id: "d1", title: "Charte et règlement intérieur", type: "STATUTS", fileType: "pdf", sizeKb: 412, associationId: "as17", uploadedAt: "2024-01-20", uploadedById: "m1" },
  { id: "d2", title: "Statuts de FIDYBAY", type: "STATUTS", fileType: "pdf", sizeKb: 386, associationId: "as17", uploadedAt: "2024-02-12", uploadedById: "m1" },
  { id: "d3", title: "PV de l'assemblée générale 2025", type: "PV", fileType: "pdf", sizeKb: 228, associationId: "as17", uploadedAt: "2025-11-15", uploadedById: "m8" },
  { id: "d4", title: "Rapport financier T3 2026", type: "FINANCIER", fileType: "xlsx", sizeKb: 96, associationId: "as17", uploadedAt: "2026-10-05", uploadedById: "m2" },
  { id: "d5", title: "Programme du festival Pa'a Ngouo'ok 2026", type: "AUTRE", fileType: "pdf", sizeKb: 2140, associationId: "as17", uploadedAt: "2026-10-20", uploadedById: "m1" },
  { id: "d6", title: "PV de réunion du bureau (septembre)", type: "PV", fileType: "docx", sizeKb: 64, associationId: "as17", uploadedAt: "2026-09-28", uploadedById: "m1" },
  { id: "d7", title: "Rapport d'activité 2025", type: "RAPPORT", fileType: "pdf", sizeKb: 1820, associationId: "as73", uploadedAt: "2026-02-03", uploadedById: "m3" },
  { id: "d8", title: "Règlement intérieur", type: "STATUTS", fileType: "pdf", sizeKb: 302, associationId: "as34", uploadedAt: "2025-03-08", uploadedById: "m10" },
  { id: "d9", title: "Bilan de la campagne de bourses 2026", type: "RAPPORT", fileType: "pdf", sizeKb: 744, associationId: "as72", uploadedAt: "2026-09-30", uploadedById: "m4" },
  { id: "d10", title: "Compte rendu du conseil d'administration", type: "PV", fileType: "pdf", sizeKb: 180, associationId: "as73", uploadedAt: "2026-06-18", uploadedById: "m3" },
  { id: "d11", title: "Statuts de la COBAF", type: "STATUTS", fileType: "pdf", sizeKb: 420, associationId: "as73", uploadedAt: "2024-05-02", uploadedById: "m3" },
  { id: "d12", title: "PV assemblée générale 2026", type: "PV", fileType: "pdf", sizeKb: 256, associationId: "as34", uploadedAt: "2026-04-12", uploadedById: "m10" },
]

export const conversations: Conversation[] = [
  { id: "cv1", type: "GROUP", name: "FIDYBAY Yaoundé", associationId: "as17", participantIds: ["m1", "m8", "m13", "m6", "m19"] },
  { id: "cv2", type: "DIRECT", participantIds: ["m1", "m2"] },
  { id: "cv3", type: "GROUP", name: "Comité du festival", participantIds: ["m1", "m3", "m5", "m9", "m10"] },
  { id: "cv4", type: "DIRECT", participantIds: ["m1", "m3"] },
  { id: "cv5", type: "DIRECT", participantIds: ["m1", "m14"] },
]

export const messages: Message[] = [
  { id: "ms1", conversationId: "cv1", authorId: "m8", content: "Bonsoir à tous, le PV de la dernière réunion est en ligne dans Documents.", createdAt: "2026-10-29T18:02:00" },
  { id: "ms2", conversationId: "cv1", authorId: "m13", content: "Merci Hélène 🙏", createdAt: "2026-10-29T18:05:00" },
  { id: "ms3", conversationId: "cv1", authorId: "m1", content: "Rappel : assemblée générale le 8 novembre à 15h. Pensez à vous inscrire.", createdAt: "2026-10-29T19:20:00" },
  { id: "ms4", conversationId: "cv1", authorId: "m6", content: "Je serai présente avec deux personnes.", createdAt: "2026-10-30T08:12:00" },
  { id: "ms5", conversationId: "cv2", authorId: "m2", content: "Bonjour Arnaud, j'ai enregistré les cotisations en espèces de samedi.", createdAt: "2026-10-29T10:00:00" },
  { id: "ms6", conversationId: "cv2", authorId: "m1", content: "Parfait, merci Brigitte. Les reçus partent automatiquement ?", createdAt: "2026-10-29T10:04:00" },
  { id: "ms7", conversationId: "cv2", authorId: "m2", content: "Oui, chaque contributeur reçoit son reçu par SMS et par email.", createdAt: "2026-10-29T10:06:00" },
  { id: "ms8", conversationId: "cv3", authorId: "m9", content: "Les jeunes sont prêts pour l'accueil des visiteurs au festival.", createdAt: "2026-10-28T17:30:00" },
  { id: "ms9", conversationId: "cv3", authorId: "m3", content: "Super. Côté diaspora, 48 personnes confirmées depuis la France.", createdAt: "2026-10-28T18:10:00" },
  { id: "ms10", conversationId: "cv3", authorId: "m1", content: "Réunion de préparation samedi au palais, 10h.", createdAt: "2026-10-30T07:45:00" },
  { id: "ms11", conversationId: "cv4", authorId: "m3", content: "Peux-tu partager le programme du festival avec la diaspora ?", createdAt: "2026-10-27T21:00:00" },
  { id: "ms12", conversationId: "cv4", authorId: "m1", content: "C'est fait, il est dans les documents du comité.", createdAt: "2026-10-27T21:30:00" },
  { id: "ms13", conversationId: "cv5", authorId: "m14", content: "Bonjour, je souhaite créer une antenne de l'association en Allemagne. Comment procéder ?", createdAt: "2026-10-26T12:00:00" },
]
