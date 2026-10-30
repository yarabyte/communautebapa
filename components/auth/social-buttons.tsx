"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"
      />
    </svg>
  )
}

export function SocialButtons({ mode = "login" }: { mode?: "login" | "register" }) {
  const router = useRouter()

  const connect = (provider: string) => {
    toast.success(`Connexion avec ${provider} (démonstration)`)
    router.push(mode === "login" ? "/espace" : "/espace/bienvenue")
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Button type="button" variant="outline" className="h-11 rounded-full bg-card" onClick={() => connect("Google")}>
          <GoogleIcon /> Google
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-full bg-card" onClick={() => connect("Facebook")}>
          <FacebookIcon /> Facebook
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
