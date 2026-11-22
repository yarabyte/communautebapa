"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"
import { getProviders, signIn } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.6ZM14.6 6.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.2Z" />
    </svg>
  )
}

type SocialProvider = "google" | "apple"

const providerLabels: Record<SocialProvider, string> = {
  google: "Google",
  apple: "Apple",
}

export function SocialButtons({
  mode = "login",
  callbackUrl,
}: {
  mode?: "login" | "register"
  callbackUrl?: string
}) {
  const [loading, setLoading] = useState<SocialProvider | null>(null)
  const [enabled, setEnabled] = useState<Record<SocialProvider, boolean>>({ google: true, apple: true })

  useEffect(() => {
    getProviders()
      .then((providers) => {
        setEnabled({
          google: Boolean(providers?.google),
          apple: Boolean(providers?.apple),
        })
      })
      .catch(() => {
        setEnabled({ google: false, apple: false })
      })
  }, [])

  const connect = async (provider: SocialProvider) => {
    if (!enabled[provider]) {
      toast.message(`${providerLabels[provider]} n'est pas encore configuré`, {
        description: `Ajoutez AUTH_${provider.toUpperCase()}_ID et AUTH_${provider.toUpperCase()}_SECRET dans .env, puis redémarrez le serveur.`,
      })
      return
    }

    setLoading(provider)
    try {
      const target = callbackUrl ?? (mode === "register" ? "/espace/bienvenue" : "/espace")
      await signIn(provider, { callbackUrl: target })
    } catch {
      toast.error(`Impossible de continuer avec ${providerLabels[provider]}`)
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full bg-card"
          disabled={!!loading}
          onClick={() => connect("google")}
        >
          {loading === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full bg-card"
          disabled={!!loading}
          onClick={() => connect("apple")}
        >
          {loading === "apple" ? <Loader2 className="size-4 animate-spin" /> : <AppleIcon />}
          Apple
        </Button>
      </div>
      {mode === "login" && (
        <Button asChild variant="ghost" className="h-10 rounded-full text-terre hover:text-terre-dark">
          <Link href="/lien-magique">
            <Mail /> Recevoir un lien de connexion par email
          </Link>
        </Button>
      )}
    </div>
  )
}

export function OrSeparator({ label = "ou" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
