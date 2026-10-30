import type { Metadata } from "next"
import Link from "next/link"

import { AuthHeading } from "@/components/auth/auth-heading"
import { EmailRequestForm } from "@/components/auth/email-request-form"

export const metadata: Metadata = { title: "Lien de connexion" }

export default function MagicLinkPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <AuthHeading
        tag="Sans mot de passe"
        title="Connexion par lien magique"
        description="Recevez un lien de connexion sécurisé par email. Un clic suffit, aucun mot de passe à retenir."
      />
      <EmailRequestForm
        submitLabel="Recevoir mon lien"
        successTitle="Lien envoyé"
        successText="Ouvrez l'email que nous venons d'envoyer et cliquez sur le lien de connexion, valable 15 minutes. Adresse :"
      />
      <Link href="/connexion" className="text-center text-sm text-terre hover:underline">
        Revenir aux autres méthodes de connexion
      </Link>
    </div>
  )
}
