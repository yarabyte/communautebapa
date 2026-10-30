import type { Metadata } from "next"
import Link from "next/link"

import { AuthHeading } from "@/components/auth/auth-heading"
import { EmailRequestForm } from "@/components/auth/email-request-form"

export const metadata: Metadata = { title: "Mot de passe oublié" }

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <AuthHeading
        tag="Accès"
        title="Mot de passe oublié"
        description="Indiquez l'adresse email de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe."
      />
      <EmailRequestForm
        submitLabel="Envoyer le lien"
        successTitle="Vérifiez votre boîte de réception"
        successText="Si un compte existe, un lien de réinitialisation valable 30 minutes a été envoyé à"
      />
      <p className="text-center text-sm text-brun-soft">
        Inscrit avec votre téléphone ?{" "}
        <Link href="/connexion" className="font-medium text-terre hover:underline">
          Connectez-vous par code SMS
        </Link>
      </p>
    </div>
  )
}
