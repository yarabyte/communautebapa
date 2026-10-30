"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

const channelLabels: Record<string, string> = { sms: "par SMS", whatsapp: "sur WhatsApp", email: "par email" }

export function OtpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const target = params.get("cible") ?? "votre numéro"
  const channel = params.get("canal") ?? "sms"
  const nextPath = params.get("suite") ?? "/espace"

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [countdown, setCountdown] = useState(45)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const verify = async (value = code) => {
    if (value.length < 6) {
      setError("Saisissez les 6 chiffres du code")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    toast.success("Vérification réussie")
    router.push(nextPath)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-brun-soft">
        Nous avons envoyé un code à 6 chiffres {channelLabels[channel]} à <span className="font-medium text-brun">{target}</span>.
      </p>
      <InputOTP
        maxLength={6}
        value={code}
        onChange={(v) => {
          setCode(v)
          setError(undefined)
          if (v.length === 6) verify(v)
        }}
        containerClassName="justify-center sm:justify-start"
        aria-invalid={!!error}
      >
        <InputOTPGroup className="*:data-[slot=input-otp-slot]:size-12 *:data-[slot=input-otp-slot]:bg-card *:data-[slot=input-otp-slot]:text-lg">
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup className="*:data-[slot=input-otp-slot]:size-12 *:data-[slot=input-otp-slot]:bg-card *:data-[slot=input-otp-slot]:text-lg">
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button size="lg" className="h-11 rounded-full" onClick={() => verify()} disabled={loading}>
        {loading && <Loader2 className="animate-spin" />} Vérifier
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Vous n&apos;avez rien reçu ?{" "}
        {countdown > 0 ? (
          <span>Nouvel envoi possible dans {countdown} s</span>
        ) : (
          <button
            type="button"
            className="font-medium text-terre hover:underline"
            onClick={() => {
              setCountdown(45)
              toast.success("Nouveau code envoyé")
            }}
          >
            Renvoyer le code
          </button>
        )}
      </p>
    </div>
  )
}
