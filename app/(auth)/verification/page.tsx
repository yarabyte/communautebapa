import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { AuthHeading } from "@/components/auth/auth-heading"
import { OtpForm } from "@/components/auth/otp-form"

export const metadata: Metadata = { title: "Vérification" }

export default function VerificationPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <AuthHeading tag="Sécurité" title="Saisissez votre code" />
      <Suspense>
        <OtpForm />
      </Suspense>
      <Link href="/connexion" className="text-center text-sm text-terre hover:underline">
        Utiliser une autre méthode de connexion
      </Link>
    </div>
  )
}
