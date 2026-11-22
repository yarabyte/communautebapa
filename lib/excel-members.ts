import * as XLSX from "xlsx"

import type { MembershipRole } from "@/lib/types"

export type ImportRow = {
  row: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: MembershipRole
}

export type ImportError = { row: number; message: string }

const ROLE_MAP: Record<string, MembershipRole> = {
  membre: "MEMBRE",
  responsable: "RESPONSABLE",
  tresorier: "TRESORIER",
  trésorier: "TRESORIER",
  secretaire: "SECRETAIRE",
  secrétaire: "SECRETAIRE",
}

function cell(v: unknown) {
  if (v == null) return ""
  return String(v).trim()
}

export function parseMembersWorkbook(buffer: ArrayBuffer): { rows: ImportRow[]; errors: ImportError[] } {
  const wb = XLSX.read(buffer, { type: "array" })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const rows: ImportRow[] = []
  const errors: ImportError[] = []

  json.forEach((raw, i) => {
    const row = i + 2
    const keys = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), v]))
    const firstName = cell(keys.prenom ?? keys["prénom"] ?? keys.firstname ?? keys.first_name)
    const lastName = cell(keys.nom ?? keys.lastname ?? keys.last_name)
    const email = cell(keys.email ?? keys.courriel ?? keys.mail).toLowerCase()
    const phone = cell(keys.telephone ?? keys["téléphone"] ?? keys.phone ?? keys.tel) || undefined
    const roleRaw = cell(keys.role ?? keys.rôle).toLowerCase()
    const role = ROLE_MAP[roleRaw] ?? "MEMBRE"

    if (!firstName || !lastName) {
      errors.push({ row, message: "Prénom et nom requis" })
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row, message: "Email invalide" })
      return
    }

    rows.push({ row, firstName, lastName, email, phone, role })
  })

  return { rows, errors }
}

export function buildMembersTemplateBuffer() {
  const wb = XLSX.utils.book_new()
  const data = [
    ["prenom", "nom", "email", "telephone", "role"],
    ["Jean", "Kamga", "jean.kamga@exemple.com", "+237 6 00 00 00 00", "MEMBRE"],
    ["Marie", "Fotso", "marie.fotso@exemple.com", "+237 6 11 11 11 11", "MEMBRE"],
  ]
  const sheet = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, sheet, "Membres")
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer
}
