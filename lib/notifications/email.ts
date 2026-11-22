import nodemailer from "nodemailer"

function transporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user) {
    return null
  }
  const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false"
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized, servername: host },
    connectionTimeout: 15_000,
  })
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }) {
  const tx = transporter()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@bapa-officiel.com"
  if (!tx) {
    console.warn("[email] SMTP non configuré — message non envoyé:", opts.subject, "→", opts.to)
    return { ok: false as const, skipped: true }
  }
  if (!process.env.SMTP_PASS) {
    console.warn("[email] SMTP_PASS manquant — message loggé uniquement:", opts.subject, "→", opts.to)
    console.info(opts.text)
    return { ok: false as const, skipped: true }
  }
  try {
    await tx.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html ?? opts.text })
    return { ok: true as const }
  } catch (err) {
    console.error("[email] échec envoi:", err)
    return { ok: false as const, error: err }
  }
}

export function registrationReceivedEmail(name: string) {
  return {
    subject: "Inscription reçue — Communauté Bapa",
    text: `Bonjour ${name},\n\nVotre demande d'inscription à la Communauté Bapa a bien été reçue. Un administrateur la validera sous peu. Vous recevrez un message dès que votre compte sera activé.\n\nÀ bientôt,\nL'équipe Communauté Bapa`,
  }
}

export function accountValidatedEmail(name: string) {
  return {
    subject: "Compte validé — Communauté Bapa",
    text: `Bonjour ${name},\n\nVotre inscription a été validée. Vous pouvez dès maintenant vous connecter et compléter votre profil sur ${process.env.NEXT_PUBLIC_SITE_URL || "https://communaute.bapa-officiel.com"}.\n\nÀ bientôt,\nL'équipe Communauté Bapa`,
  }
}

export function accountRejectedEmail(name: string, comment?: string | null) {
  return {
    subject: "Inscription non retenue — Communauté Bapa",
    text: `Bonjour ${name},\n\nVotre demande d'inscription n'a pas pu être validée.${comment ? `\n\nMotif : ${comment}` : ""}\n\nPour toute question, répondez à cet email.\n\nL'équipe Communauté Bapa`,
  }
}

export function tempPasswordEmail(name: string, email: string, password: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://communaute.bapa-officiel.com"
  return {
    subject: "Compte créé — Communauté Bapa",
    text: `Bonjour ${name},\n\nUn responsable d'association a créé votre compte sur la Communauté Bapa.\n\nIdentifiant : ${email}\nMot de passe temporaire : ${password}\n\nConnectez-vous sur ${site}/connexion puis changez votre mot de passe. Votre compte sera activé après validation par un administrateur.\n\nÀ bientôt,\nL'équipe Communauté Bapa`,
  }
}
