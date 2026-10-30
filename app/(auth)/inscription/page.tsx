import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { AuthHeading } from "@/components/auth/auth-heading"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = { title: "Inscription" }

export default function InscriptionPage() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <AuthHeading
        tag="Adhésion"
        title="Rejoindre la communauté"
        description="Une minute suffit : vous compléterez votre profil ensuite. Un responsable valide chaque nouveau membre."
      />
      <Suspense>
        <RegisterForm />
      </Suspense>
      <p className="text-center text-sm text-brun-soft">
        Déjà membre ?{" "}
        <Link href="/connexion" className="font-medium text-terre hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
