"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Member, Quartier } from "@/lib/types"

const schema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.union([z.literal(""), z.string().email("Adresse email invalide")]),
  phone: z.union([z.literal(""), z.string().min(8, "Numéro invalide")]),
  quartierId: z.string(),
  family: z.string(),
  country: z.string(),
  city: z.string(),
  profession: z.string(),
  bio: z.string().max(400, "400 caractères maximum"),
})

type Values = z.infer<typeof schema>

export function ProfileForm({ member, quartiers }: { member: Member; quartiers: Quartier[] }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      quartierId: member.quartierId ?? "",
      family: member.family ?? "",
      country: member.country ?? "",
      city: member.city ?? "",
      profession: member.profession ?? "",
      bio: member.bio ?? "",
    },
  })
  const { errors, isSubmitting, isDirty } = form.formState

  const text = (name: keyof Values, label: string, type = "text") => (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} type={type} className="h-10 bg-background" aria-invalid={!!errors[name]} {...form.register(name)} />
      <FieldError errors={[errors[name]]} />
    </Field>
  )

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(async (v) => {
        await new Promise((r) => setTimeout(r, 600))
        form.reset(v)
        toast.success("Profil mis à jour")
      })}
    >
      <FieldGroup className="gap-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {text("firstName", "Prénom")}
          {text("lastName", "Nom")}
          {text("email", "Email", "email")}
          {text("phone", "Téléphone", "tel")}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.quartierId}>
            <FieldLabel>Quartier d&apos;origine</FieldLabel>
            <Controller
              control={form.control}
              name="quartierId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10! w-full bg-background">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    {quartiers.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {text("family", "Famille / lignage")}
          {text("country", "Pays de résidence")}
          {text("city", "Ville")}
        </div>
        {text("profession", "Profession")}
        <Field data-invalid={!!errors.bio}>
          <FieldLabel htmlFor="bio">Présentation</FieldLabel>
          <Textarea id="bio" rows={4} className="bg-background" {...form.register("bio")} />
          <FieldError errors={[errors.bio]} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={!isDirty} onClick={() => form.reset()}>
            Annuler
          </Button>
          <Button type="submit" className="rounded-full px-5" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
