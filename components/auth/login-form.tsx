"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, Mail, Smartphone } from "lucide-react"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { OrSeparator, SocialButtons } from "./social-buttons"
import { PhoneInput } from "./phone-input"

const emailSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  remember: z.boolean(),
})

const phoneSchema = z.object({
  dialCode: z.string(),
  phone: z.string().regex(/^[0-9 ]{8,14}$/, "Numéro invalide"),
  channel: z.enum(["sms", "whatsapp"]),
})

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function EmailLogin() {
  const router = useRouter()
  const redirect = useSearchParams().get("redirect") ?? "/espace"
  const [show, setShow] = useState(false)
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "", remember: true },
  })

  const onSubmit = async (v: z.infer<typeof emailSchema>) => {
    const result = await signIn("credentials", {
      email: v.email,
      password: v.password,
      redirect: false,
    })
    if (result?.error) {
      const message =
        result.error === "ACCOUNT_REJECTED"
          ? "Votre inscription n'a pas été retenue."
          : result.error === "ACCOUNT_SUSPENDED"
            ? "Votre compte est suspendu."
            : "Email ou mot de passe incorrect."
      toast.error(message)
      return
    }
    toast.success("Bon retour parmi nous !")
    router.push(redirect)
    router.refresh()
  }

  const { errors, isSubmitting } = form.formState

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Adresse email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" className="h-11 bg-card" aria-invalid={!!errors.email} {...form.register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <Link href="/mot-de-passe-oublie" className="text-sm text-terre hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 bg-card pr-11"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-brun"
              aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError errors={[errors.password]} />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="remember" checked={form.watch("remember")} onCheckedChange={(v) => form.setValue("remember", v === true)} />
          <FieldLabel htmlFor="remember" className="font-normal">
            Rester connecté sur cet appareil
          </FieldLabel>
        </Field>
        <Button type="submit" size="lg" className="h-11 rounded-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Se connecter
        </Button>
      </FieldGroup>
    </form>
  )
}

function PhoneLogin() {
  const router = useRouter()
  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { dialCode: "+237", phone: "", channel: "sms" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (v: z.infer<typeof phoneSchema>) => {
    await wait(600)
    toast.success(`Code envoyé par ${v.channel === "sms" ? "SMS" : "WhatsApp"}`)
    router.push(`/verification?cible=${encodeURIComponent(`${v.dialCode} ${v.phone}`)}&canal=${v.channel}&suite=/espace`)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Numéro de téléphone</FieldLabel>
          <PhoneInput
            dialCode={form.watch("dialCode")}
            onDialCodeChange={(v) => form.setValue("dialCode", v)}
            invalid={!!errors.phone}
            inputProps={{ id: "phone", ...form.register("phone") }}
          />
          <FieldError errors={[errors.phone]} />
        </Field>
        <Field>
          <FieldLabel>Recevoir le code par</FieldLabel>
          <RadioGroup
            value={form.watch("channel")}
            onValueChange={(v) => form.setValue("channel", v as "sms" | "whatsapp")}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: "sms", label: "SMS" },
              { value: "whatsapp", label: "WhatsApp" },
            ].map((o) => (
              <Label
                key={o.value}
                htmlFor={`ch-${o.value}`}
                className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 has-data-[state=checked]:border-terre has-data-[state=checked]:bg-accent"
              >
                <RadioGroupItem id={`ch-${o.value}`} value={o.value} /> {o.label}
              </Label>
            ))}
          </RadioGroup>
        </Field>
        <Button type="submit" size="lg" className="h-11 rounded-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Recevoir mon code
        </Button>
      </FieldGroup>
    </form>
  )
}

export function LoginForm() {
  const redirect = useSearchParams().get("redirect") ?? "/espace"

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="email" className="gap-5">
        <TabsList className="grid h-11! w-full grid-cols-2 rounded-full bg-muted p-1">
          <TabsTrigger value="email" className="rounded-full data-active:bg-card">
            <Mail /> Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="rounded-full data-active:bg-card">
            <Smartphone /> Téléphone
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <EmailLogin />
        </TabsContent>
        <TabsContent value="phone">
          <PhoneLogin />
        </TabsContent>
      </Tabs>
      <OrSeparator label="ou continuer avec" />
      <SocialButtons callbackUrl={redirect} />
    </div>
  )
}
