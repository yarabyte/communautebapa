import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

import { XAF_RATES } from "./constants"
import type { Currency } from "./types"

export function formatMoney(amount: number, currency: Currency = "XAF") {
  if (currency === "XAF") {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} FCFA`
  }
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount)
}

export function toXaf(amount: number, currency: Currency) {
  return Math.round(amount * XAF_RATES[currency])
}

/** Heure du Cameroun (UTC+1, sans heure d'été). */
const DOUALA_OFFSET_MINUTES = 60

function parseInstant(iso: string) {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso)
  return new Date(hasZone || !iso.includes("T") ? iso : `${iso}+01:00`)
}

/**
 * Date dont les champs locaux correspondent à l'heure de Douala, quel que soit le fuseau
 * du serveur ou du navigateur (évite les écarts d'hydratation). Une date ISO sans fuseau
 * est interprétée comme heure de Douala.
 */
export function toDate(iso: string) {
  const instant = parseInstant(iso)
  return new Date(instant.getTime() + (DOUALA_OFFSET_MINUTES + instant.getTimezoneOffset()) * 60_000)
}

export function formatDate(iso: string, pattern = "d MMMM yyyy") {
  return format(toDate(iso), pattern, { locale: fr })
}

export function formatDateTime(iso: string) {
  return format(toDate(iso), "d MMM yyyy 'à' HH'h'mm", { locale: fr })
}

export function formatTime(iso: string) {
  return format(toDate(iso), "HH:mm", { locale: fr })
}

export function fromNow(iso: string) {
  return formatDistanceToNow(parseInstant(iso), { addSuffix: true, locale: fr })
}

export function initials(firstName: string, lastName?: string) {
  return `${firstName.charAt(0)}${lastName?.charAt(0) ?? ""}`.toUpperCase()
}

export function formatFileSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1).replace(".", ",")} Mo` : `${kb} Ko`
}

export function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.min(100, Math.round((part / total) * 100))
}
