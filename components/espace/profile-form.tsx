"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { bapaLinkLabels } from "@/lib/labels"
import type { BapaLink, Member, Quartier } from "@/lib/types"

const COUNTRIES = ["Cameroun", "France", "Belgique", "Suisse", "Allemagne", "Italie", "Royaume-Uni", "Canada", "États-Unis", "Gabon", "Afrique du Sud", "Autre"]

const schema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.union([z.literal(""), z.string().email("Adresse email invalide")]),
  phone: z.union([z.literal(""), z.string().min(8, "Numéro invalide")]),
  quartierId: z.string(),
  link: z.string(),
  gender: z.string(),
  birthYear: z.union([z.literal(""), z.string().regex(/^(19|20)\d{2}$/, "Année invalide")]),
  country: z.string(),
  city: z.string(),
  profession: z.string(),
  bio: z.string().max(400, "400 caractères maximum"),
  showInDirectory: z.boolean(),
})

type Values = z.infer<typeof schema>

export function ProfileForm({ member, quartiers }: { member: Member; quartiers: Quartier[] }) {
  const router = useRouter()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      quartierId: member.quartierId ?? "",
      link: member.link ?? "",
      gender: member.gender ?? "",
      birthYear: member.birthYear ? String(member.birthYear) : "",
      country: member.country ?? "",
      city: member.city ?? "",
      profession: member.profession ?? "",
      bio: member.bio ?? "",
      showInDirectory: member.showInDirectory ?? true,
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
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: v.firstName,
            lastName: v.lastName,
            email: v.email || undefined,
            phone: v.phone || null,
            quartierId: v.quartierId || null,
            link: (v.link as BapaLink) || null,
            gender: v.gender === "FEMME" || v.gender === "HOMME" ? v.gender : null,
            birthYear: v.birthYear ? Number(v.birthYear) : null,
            country: v.country || null,
            city: v.city || null,
            profession: v.profession || null,
            bio: v.bio || null,
            showInDirectory: v.showInDirectory,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error(data.error || "Enregistrement impossible")
          return
        }
        form.reset(v)
        toast.success("Profil mis à jour")
        router.refresh()
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
          <Field>
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
          <Field>
            <FieldLabel>Votre lien avec Bapa</FieldLabel>
            <Controller
              control={form.control}
              name="link"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10! w-full bg-background">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(bapaLinkLabels) as [BapaLink, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel>Genre</FieldLabel>
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex h-10 items-center gap-6">
                  {[
                    { value: "FEMME", label: "Femme" },
                    { value: "HOMME", label: "Homme" },
                  ].map((o) => (
                    <Label key={o.value} htmlFor={`pf-g-${o.value}`} className="flex items-center gap-2 font-normal">
                      <RadioGroupItem id={`pf-g-${o.value}`} value={o.value} /> {o.label}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            />
          </Field>
          <Field data-invalid={!!errors.birthYear}>
            <FieldLabel htmlFor="birthYear">Année de naissance</FieldLabel>
            <Input
              id="birthYear"
              inputMode="numeric"
              maxLength={4}
              placeholder="1985"
              className="h-10 bg-background"
              aria-invalid={!!errors.birthYear}
              {...form.register("birthYear")}
            />
            <FieldError errors={[errors.birthYear]} />
          </Field>
          <Field>
            <FieldLabel>Pays de résidence</FieldLabel>
            <Controller
              control={form.control}
              name="country"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10! w-full bg-background">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {text("city", "Ville")}
        </div>

        {text("profession", "Profession")}
        <Field data-invalid={!!errors.bio}>
          <FieldLabel htmlFor="bio">Présentation</FieldLabel>
          <Textarea id="bio" rows={4} className="bg-background" {...form.register("bio")} />
          <FieldError errors={[errors.bio]} />
        </Field>

        <Controller
          control={form.control}
          name="showInDirectory"
          render={({ field }) => (
            <Field orientation="horizontal" className="justify-between rounded-2xl border border-border bg-background p-4">
              <div>
                <FieldLabel htmlFor="showInDirectory">Apparaître dans l&apos;annuaire des membres</FieldLabel>
                <FieldDescription>Visible sur le site public et dans l&apos;espace membre.</FieldDescription>
              </div>
              <Switch id="showInDirectory" checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />

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
