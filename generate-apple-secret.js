/**
 * Génère AUTH_APPLE_SECRET (JWT ES256) à partir de la clé .p8 Apple.
 *
 * Usage :
 *   node generate-apple-secret.js [chemin/vers/AuthKey_XXXX.p8]
 *
 * Par défaut : ~/Downloads/AuthKey_4F9WJ4JQ3G.p8
 */
const fs = require("fs")
const os = require("os")
const path = require("path")
const jwt = require("jsonwebtoken")

const TEAM_ID = process.env.APPLE_TEAM_ID || "F2222U7374"
const KEY_ID = process.env.APPLE_KEY_ID || "4F9WJ4JQ3G"
/** Services ID (= AUTH_APPLE_ID), pas l'App ID */
const CLIENT_ID = process.env.AUTH_APPLE_ID || "com.bapa-officiel.communaute"

const keyPath =
  process.argv[2] || path.join(os.homedir(), "Downloads", `AuthKey_${KEY_ID}.p8`)

if (!fs.existsSync(keyPath)) {
  console.error(`Fichier .p8 introuvable : ${keyPath}`)
  process.exit(1)
}

const PRIVATE_KEY = fs.readFileSync(keyPath, "utf8")
const now = Math.floor(Date.now() / 1000)

const token = jwt.sign(
  {
    iss: TEAM_ID,
    iat: now,
    exp: now + 86400 * 180, // ~6 mois (max Apple)
    aud: "https://appleid.apple.com",
    sub: CLIENT_ID,
  },
  PRIVATE_KEY,
  {
    algorithm: "ES256",
    header: { alg: "ES256", kid: KEY_ID },
  }
)

console.log(token)
console.error(`\nOK — Team=${TEAM_ID} Key=${KEY_ID} ClientID=${CLIENT_ID}`)
console.error(`Source : ${keyPath}`)
console.error("Copie la ligne ci-dessus dans AUTH_APPLE_SECRET=...")
