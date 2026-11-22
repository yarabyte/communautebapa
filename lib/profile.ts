import type { Member } from "./types"

export type CompletionItem = {
  key: string
  label: string
  hint: string
  done: boolean
  href: string
  /** N'entre pas dans le pourcentage (ex. : entreprise). */
  optional?: boolean
}

export type ProfileCompletion = { percent: number; items: CompletionItem[]; missing: CompletionItem[] }

export const ONBOARDING_STEPS = ["origines", "residence", "associations", "entreprise"] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

const welcome = (step: OnboardingStep) => `/espace/bienvenue?etape=${step}`

export function profileCompletion(
  member: Member,
  { associations = 0, businesses = 0 }: { associations?: number; businesses?: number } = {},
): ProfileCompletion {
  const items: CompletionItem[] = [
    {
      key: "origines",
      label: "Origines",
      hint: "Quartier d'origine et lien avec Bapa",
      done: !!(member.quartierId && member.link),
      href: welcome("origines"),
    },
    {
      key: "identite",
      label: "Identité",
      hint: "Genre et année de naissance",
      done: !!(member.gender && member.birthYear),
      href: welcome("residence"),
    },
    {
      key: "residence",
      label: "Résidence",
      hint: "Pays et ville où vous vivez",
      done: !!(member.country && member.city),
      href: welcome("residence"),
    },
    { key: "profession", label: "Profession", hint: "Votre métier ou activité", done: !!member.profession, href: welcome("residence") },
    {
      key: "photo",
      label: "Photo de profil",
      hint: "Issue de votre compte Google si connecté ainsi",
      done: !!member.avatar,
      href: "/espace/profil",
      optional: true,
    },
    { key: "bio", label: "Présentation", hint: "Quelques mots sur vous", done: !!member.bio, href: "/espace/profil" },
    {
      key: "associations",
      label: "Associations",
      hint: "Rejoindre au moins une association",
      done: associations > 0,
      href: welcome("associations"),
    },
    {
      key: "entreprise",
      label: "Entreprise",
      hint: "Vous avez une entreprise ? Faites-la connaître",
      done: businesses > 0,
      href: "/espace/mes-entreprises/nouvelle",
      optional: true,
    },
  ]
  const counted = items.filter((i) => !i.optional)
  const percent = Math.round((counted.filter((i) => i.done).length / counted.length) * 100)
  return { percent, items, missing: counted.filter((i) => !i.done) }
}
