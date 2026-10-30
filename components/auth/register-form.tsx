"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, Mail, Smartphone } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PhoneInput } from "./phone-input"
import { OrSeparator, SocialButtons } from "./social-buttons"

const schema = z
  .object({
    firstName: z.string().trim().min(2, "Prénom requis"),
    lastName: z.string().trim().min(2, "Nom requis"),
    method: z.enum(["email", "phone"]),
    email: z.string(),
    dialCode: z.string(),
    phone: z.string(),
    password: z.string().min(8, "8 caractères minimum"),
  })
  .superRefine((v, ctx) => {
    if (v.method === "email" && !z.string().email().safeParse(v.email).success)
      ctx.addIssue({ code: "custom", path: ["email"], message: "Adresse email invalide" })
    if (v.method === "phone" && !/^[0-9 ]{8,14}$/.test(v.phone)) ctx.addIssue({ code: "custom", path: ["phone"], message: "Numéro invalide" })
  })

type Values = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const association = useSearchParams().get("association")
  const [show, setShow] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", method: "email", email: "", dialCode: "+237", phone: "", password: "" },
  })
  const { register, control, watch, formState } = form
  const { errors, isSubmitting } = formState
  const method = watch("method")

  const onSubmit = async (v: Values) => {
    await new Promise((r) => setTimeout(r, 700))
    toast.success("Compte créé", { description: "Il ne reste qu'à vérifier vos coordonnées." })
    const welcome = `/espace/bienvenue${association ? `?association=${encodeURIComponent(association)}` : ""}`
    if (v.method === "email") {
      router.push(`/en-attente?email=${encodeURIComponent(v.email)}${association ? `&association=${encodeURIComponent(association)}` : ""}`)
    } else {
      router.push(`/verification?cible=${encodeURIComponent(`${v.dialCode} ${v.phone}`)}&canal=sms&suite=${encodeURIComponent(welcome)}`)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        <SocialButtons mode="register" />
        <OrSeparator label="ou avec" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
            <Input id="firstName" autoComplete="given-name" className="h-11 bg-card" aria-invalid={!!errors.firstName} {...register("firstName")} />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName">Nom</FieldLabel>
            <Input id="lastName" autoComplete="family-name" className="h-11 bg-card" aria-invalid={!!errors.lastName} {...register("lastName")} />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </div>

        <Controller
          control={control}
          name="method"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-3" aria-label="S'inscrire avec">
              {[
                { value: "email", label: "Email", icon: Mail },
                { value: "phone", label: "Téléphone", icon: Smartphone },
              ].map((o) => (
                <Label
                  key={o.value}
                  htmlFor={`m-${o.value}`}
                  className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 has-data-[state=checked]:border-terre has-data-[state=checked]:bg-accent"
                >
                  <RadioGroupItem id={`m-${o.value}`} value={o.value} />
                  <o.icon className="size-4 text-terre" /> {o.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        />

        {method === "email" ? (
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Adresse email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" className="h-11 bg-card" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>
        ) : (
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Numéro de téléphone</FieldLabel>
            <PhoneInput
              dialCode={watch("dialCode")}
              onDialCodeChange={(v) => form.setValue("dialCode", v)}
              invalid={!!errors.phone}
              inputProps={{ id: "phone", autoComplete: "tel-national", ...register("phone") }}
            />
            <FieldDescription>Un code de vérification vous sera envoyé par SMS ou WhatsApp.</FieldDescription>
            <FieldError errors={[errors.phone]} />
          </Field>
        )}

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              className="h-11 bg-card pr-11"
              aria-invalid={!!errors.password}
              {...register("password")}
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
          <FieldDescription>8 caractères minimum.</FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Button type="submit" size="lg" className="h-11 rounded-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Créer mon compte
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          En créant un compte, vous acceptez la{" "}
          <Link href="/a-propos#charte" className="text-terre underline">
            charte de la communauté
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="text-terre underline">
            politique de confidentialité
          </Link>
          . Vous compléterez votre profil (origines, résidence, associations, entreprise) après l&apos;inscription.
        </p>
      </FieldGroup>
    </form>
  )
}
