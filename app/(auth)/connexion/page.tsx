import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { AuthHeading } from "@/components/auth/auth-heading"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Connexion" }

export default function ConnexionPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <AuthHeading tag="Espace membre" title="Bon retour" description="Connectez-vous pour retrouver vos associations, vos projets et vos messages." />
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-brun-soft">
        Pas encore membre ?{" "}
        <Link href="/inscription" className="font-medium text-terre hover:underline">
          Rejoindre la communauté
        </Link>
      </p>
    </div>
  )
}
