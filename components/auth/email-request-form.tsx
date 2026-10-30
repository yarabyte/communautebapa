"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MailCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const schema = z.object({ email: z.string().email("Adresse email invalide") })

export function EmailRequestForm({ submitLabel, successTitle, successText }: { submitLabel: string; successTitle: string; successText: string }) {
  const [sentTo, setSentTo] = useState<string>()
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } })
  const { errors, isSubmitting } = form.formState

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-olive/30 bg-olive/5 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-olive/15 text-olive">
          <MailCheck className="size-7" />
        </span>
        <h2 className="font-heading text-xl text-brun">{successTitle}</h2>
        <p className="text-sm text-brun-soft">
          {successText} <span className="font-medium text-brun">{sentTo}</span>.
        </p>
        <Button variant="link" onClick={() => setSentTo(undefined)}>
          Utiliser une autre adresse
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(async (v) => {
        await new Promise((r) => setTimeout(r, 700))
        setSentTo(v.email)
      })}
    >
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Adresse email</FieldLabel>
        <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" className="h-11 bg-card" aria-invalid={!!errors.email} {...form.register("email")} />
        <FieldError errors={[errors.email]} />
      </Field>
      <Button type="submit" size="lg" className="h-11 rounded-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />} {submitLabel}
      </Button>
    </form>
  )
}
