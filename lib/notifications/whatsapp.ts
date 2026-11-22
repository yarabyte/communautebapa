type TemplateKind = "registration" | "temp_password" | "validated" | "rejected"

const TEMPLATE_ENV: Record<TemplateKind, string> = {
  registration: "WHATSAPP_TEMPLATE_REGISTRATION",
  temp_password: "WHATSAPP_TEMPLATE_TEMP_PASSWORD",
  validated: "WHATSAPP_TEMPLATE_VALIDATED",
  rejected: "WHATSAPP_TEMPLATE_REJECTED",
}

/** Normalise un numéro vers E.164 sans + (exigé par Meta). */
export function toWhatsAppDigits(phone: string) {
  const digits = phone.replace(/[^\d]/g, "")
  return digits
}

async function sendTemplate(to: string, kind: TemplateKind, bodyParams: string[]) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const templateName = process.env[TEMPLATE_ENV[kind]]
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || "fr"

  if (!token || !phoneId || !templateName) {
    console.warn(`[whatsapp] non configuré (${kind}) — message non envoyé →`, to)
    return { ok: false as const, skipped: true }
  }

  const toDigits = toWhatsAppDigits(to)
  if (!toDigits) {
    console.warn("[whatsapp] numéro invalide:", to)
    return { ok: false as const, skipped: true }
  }

  const payload = {
    messaging_product: "whatsapp",
    to: toDigits,
    type: "template",
    template: {
      name: templateName,
      language: { code: lang },
      components: bodyParams.length
        ? [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({ type: "text", text })),
            },
          ]
        : undefined,
    },
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error("[whatsapp] erreur API:", res.status, body)
      return { ok: false as const, error: body }
    }
    return { ok: true as const }
  } catch (err) {
    console.error("[whatsapp] échec:", err)
    return { ok: false as const, error: err }
  }
}

export async function notifyRegistrationWhatsApp(phone: string, name: string) {
  return sendTemplate(phone, "registration", [name])
}

export async function notifyValidatedWhatsApp(phone: string, name: string) {
  return sendTemplate(phone, "validated", [name])
}

export async function notifyRejectedWhatsApp(phone: string, name: string) {
  return sendTemplate(phone, "rejected", [name])
}

export async function notifyTempPasswordWhatsApp(phone: string, name: string, password: string) {
  return sendTemplate(phone, "temp_password", [name, password])
}
