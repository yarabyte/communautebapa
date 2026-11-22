import { randomBytes } from "crypto"
import { compare, hash } from "bcryptjs"

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

/** Mot de passe temporaire lisible (12 caractères alphanumériques). */
export function generateTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  const bytes = randomBytes(12)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}
