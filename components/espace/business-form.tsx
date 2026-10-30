"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Loader2, Plus, Save, Send, Trash2 } from "lucide-react"
import { Controller, useFieldArray, useForm, type FieldErrors } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { BusinessLogo } from "@/components/shared/business-card"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { businessVisibilityLabels, currencyLabels, jobTypeLabels } from "@/lib/labels"
import type { Business, BusinessSector, Currency, JobOffer, JobType } from "@/lib/types"
import { cn } from "@/lib/utils"

const optionalUrl = z.union([z.literal(""), z.string().url("Adresse web invalide (https://…)")])
const optionalPhone = z.union([z.literal(""), z.string().regex(/^\+?[0-9 ]{8,18}$/, "Numéro invalide")])

const schema = z
  .object({
    name: z.string().trim().min(2, "Nom requis"),
    sectorId: z.string().min(1, "Choisissez un secteur"),
    description: z.string().trim().min(30, "30 caractères minimum").max(1500, "1 500 caractères maximum"),
    visibility: z.enum(["PUBLIC", "MEMBERS"]),
    services: z.array(
      z.object({
        name: z.string().trim().min(2, "Nom du service requis"),
        description: z.string(),
        price: z.union([z.literal(""), z.string().regex(/^\d+([.,]\d{1,2})?$/, "Montant invalide")]),
        currency: z.enum(["XAF", "EUR", "USD"]),
      }),
    ),
    phone: optionalPhone,
    whatsapp: optionalPhone,
    email: z.union([z.literal(""), z.string().email("Adresse email invalide")]),
    website: optionalUrl,
    facebook: optionalUrl,
    instagram: optionalUrl,
    linkedin: optionalUrl,
    tiktok: optionalUrl,
    address: z.string(),
    city: z.string().trim().min(2, "Ville requise"),
    country: z.string().trim().min(2, "Pays requis"),
    mapsUrl: optionalUrl,
    jobs: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(3, "Intitulé requis"),
        type: z.enum(["CDI", "CDD", "STAGE", "FREELANCE"]),
        city: z.string().trim().min(2, "Ville requise"),
        description: z.string().trim().min(10, "Décrivez le poste"),
        applyContact: z.string().trim().min(5, "Email ou téléphone requis"),
        status: z.enum(["OPEN", "CLOSED"]),
      }),
    ),
  })
  .refine((v) => v.phone || v.whatsapp || v.email || v.website, {
    path: ["phone"],
    message: "Indiquez au moins un moyen de contact (téléphone, WhatsApp, email ou site)",
  })

type Values = z.infer<typeof schema>

const TABS = [
  { value: "infos", label: "Informations", fields: ["name", "sectorId", "description", "visibility"] },
  { value: "services", label: "Services", fields: ["services"] },
  { value: "contacts", label: "Contacts", fields: ["phone", "whatsapp", "email", "website", "facebook", "instagram", "linkedin", "tiktok"] },
  { value: "adresse", label: "Adresse", fields: ["address", "city", "country", "mapsUrl"] },
  { value: "emplois", label: "Offres d'emploi", fields: ["jobs"] },
] as const

const tabOf = (errors: FieldErrors<Values>) => TABS.find((t) => t.fields.some((f) => f in errors))?.value

export function BusinessForm({
  sectors,
  business,
  jobs = [],
  defaults,
}: {
  sectors: BusinessSector[]
  business?: Business
  jobs?: JobOffer[]
  defaults?: { city?: string; country?: string; email?: string; phone?: string }
}) {
  const router = useRouter()
  const [tab, setTab] = useState<string>("infos")
  const [logo, setLogo] = useState(business?.logo)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: business?.name ?? "",
      sectorId: business?.sectorId ?? "",
      description: business?.description ?? "",
      visibility: business?.visibility ?? "PUBLIC",
      services: business?.services.map((s) => ({
        name: s.name,
        description: s.description ?? "",
        price: s.price != null ? String(s.price) : "",
        currency: s.currency ?? "XAF",
      })) ?? [],
      phone: business?.phone ?? defaults?.phone ?? "",
      whatsapp: business?.whatsapp ?? "",
      email: business?.email ?? defaults?.email ?? "",
      website: business?.website ?? "",
      facebook: business?.socials.facebook ?? "",
      instagram: business?.socials.instagram ?? "",
      linkedin: business?.socials.linkedin ?? "",
      tiktok: business?.socials.tiktok ?? "",
      address: business?.address ?? "",
      city: business?.city ?? defaults?.city ?? "",
      country: business?.country ?? defaults?.country ?? "",
      mapsUrl: business?.mapsUrl ?? "",
      jobs: jobs.map((j) => ({ id: j.id, title: j.title, type: j.type, city: j.city, description: j.description, applyContact: j.applyContact, status: j.status })),
    },
  })
  const { register, control, formState, watch } = form
  const { errors, isSubmitting } = formState
  const services = useFieldArray({ control, name: "services" })
  const jobFields = useFieldArray({ control, name: "jobs" })

  const saveDraft = () => {
    if (form.getValues("name").trim().length < 2) {
      setTab("infos")
      form.setError("name", { message: "Donnez au moins un nom à votre brouillon" })
      return
    }
    toast.success("Brouillon enregistré", { description: "Vous pourrez le compléter et le soumettre plus tard." })
    router.push("/espace/mes-entreprises")
  }

  const onSubmit = form.handleSubmit(
    async () => {
      await new Promise((r) => setTimeout(r, 600))
      toast.success(business?.status === "PUBLISHED" ? "Modifications envoyées" : "Fiche soumise pour validation", {
        description: "Un administrateur la vérifie avant publication, généralement sous 48 heures.",
      })
      router.push("/espace/mes-entreprises")
    },
    (errs) => {
      const target = tabOf(errs)
      if (target) setTab(target)
      toast.error("Certains champs sont à corriger")
    },
  )

  const text = (name: keyof Values, label: string, props: React.ComponentProps<"input"> = {}, description?: string) => {
    const error = errors[name] as { message?: string } | undefined
    return (
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input id={name} className="h-10 bg-background" aria-invalid={!!error} {...props} {...register(name)} />
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={[error]} />
      </Field>
    )
  }

  const preview = { name: watch("name") || "Mon entreprise", logo, tone: business?.tone ?? "terre" } as const

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab} className="gap-5">
        <TabsList variant="line" className="w-full justify-start gap-4 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="flex-none px-1">
              {t.label}
              {t.fields.some((f) => f in errors) && <span className="ml-1 size-1.5 rounded-full bg-destructive" aria-label="à corriger" />}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="infos">
          <Section>
            <FieldGroup className="gap-5">
              <div className="flex items-center gap-5">
                <BusinessLogo business={preview} className="size-20 text-lg" />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="logo" className="w-fit cursor-pointer">
                    <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm hover:bg-secondary">
                      <Camera className="size-4" /> {logo ? "Changer le logo" : "Ajouter un logo"}
                    </span>
                  </Label>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setLogo(URL.createObjectURL(f))
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Carré, 400 × 400 px conseillé. Sinon, un monogramme est affiché.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {text("name", "Nom de l'entreprise", { placeholder: "Ex. : Ferme Djoumessi" })}
                <Field data-invalid={!!errors.sectorId}>
                  <FieldLabel>Secteur d&apos;activité</FieldLabel>
                  <Controller
                    control={control}
                    name="sectorId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10! w-full bg-background" aria-invalid={!!errors.sectorId}>
                          <SelectValue placeholder="Choisir…" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.sectorId]} />
                </Field>
              </div>
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Présentation</FieldLabel>
                <Textarea id="description" rows={5} className="bg-background" aria-invalid={!!errors.description} {...register("description")} />
                <FieldDescription>Ce que vous faites, pour qui, depuis quand. {watch("description").length} / 1 500</FieldDescription>
                <FieldError errors={[errors.description]} />
              </Field>
              <Field>
                <FieldLabel>Visibilité de la fiche</FieldLabel>
                <Controller
                  control={control}
                  name="visibility"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2">
                      {(["PUBLIC", "MEMBERS"] as const).map((v) => (
                        <Label
                          key={v}
                          htmlFor={`v-${v}`}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 font-normal has-data-[state=checked]:border-terre has-data-[state=checked]:bg-accent"
                        >
                          <RadioGroupItem id={`v-${v}`} value={v} className="mt-0.5" />
                          <span>
                            <span className="block font-medium text-brun">{businessVisibilityLabels[v]}</span>
                            <span className="text-xs text-muted-foreground">
                              {v === "PUBLIC" ? "Visible par tous sur communaute.bapa-officiel.com." : "Visible uniquement par les membres connectés."}
                            </span>
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </Field>
            </FieldGroup>
          </Section>
        </TabsContent>

        <TabsContent value="services">
          <Section title="Services et produits" description="Listez ce que vous proposez. Le prix est facultatif.">
            <div className="flex flex-col gap-4">
              {services.fields.length === 0 && <p className="text-sm text-muted-foreground">Aucun service pour le moment.</p>}
              {services.fields.map((f, i) => {
                const err = errors.services?.[i]
                return (
                  <div key={f.id} className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-[1fr_8rem_7rem_auto] sm:items-start">
                    <div className="flex flex-col gap-2">
                      <Input placeholder="Nom du service" aria-label="Nom du service" aria-invalid={!!err?.name} className="h-10" {...register(`services.${i}.name`)} />
                      {err?.name && <p className="text-xs text-destructive">{err.name.message}</p>}
                      <Input placeholder="Précision (facultatif)" aria-label="Précision" className="h-9 text-sm" {...register(`services.${i}.description`)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Input placeholder="Prix" inputMode="decimal" aria-label="Prix" aria-invalid={!!err?.price} className="h-10" {...register(`services.${i}.price`)} />
                      {err?.price && <p className="text-xs text-destructive">{err.price.message}</p>}
                    </div>
                    <Controller
                      control={control}
                      name={`services.${i}.currency`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={(v) => field.onChange(v as Currency)}>
                          <SelectTrigger className="h-10! w-full" aria-label="Devise">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(currencyLabels) as Currency[]).map((c) => (
                              <SelectItem key={c} value={c}>
                                {c === "XAF" ? "FCFA" : c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" aria-label="Supprimer le service" onClick={() => services.remove(i)}>
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </div>
                )
              })}
              <Button
                type="button"
                variant="outline"
                className="w-fit rounded-full"
                onClick={() => services.append({ name: "", description: "", price: "", currency: "XAF" })}
              >
                <Plus /> Ajouter un service
              </Button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="contacts">
          <Section title="Contacts" description="Au moins un moyen de contact. Les boutons Appeler, WhatsApp et Email apparaîtront sur votre fiche.">
            <FieldGroup className="gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {text("phone", "Téléphone", { type: "tel", placeholder: "+237 6 70 00 00 00" })}
                {text("whatsapp", "WhatsApp", { type: "tel", placeholder: "+237 6 70 00 00 00" })}
                {text("email", "Email professionnel", { type: "email" })}
                {text("website", "Site web", { type: "url", placeholder: "https://" })}
              </div>
              <p className="text-sm font-medium text-brun">Réseaux sociaux</p>
              <div className="grid gap-5 sm:grid-cols-2">
                {text("facebook", "Facebook", { type: "url", placeholder: "https://facebook.com/…" })}
                {text("instagram", "Instagram", { type: "url", placeholder: "https://instagram.com/…" })}
                {text("linkedin", "LinkedIn", { type: "url", placeholder: "https://linkedin.com/…" })}
                {text("tiktok", "TikTok", { type: "url", placeholder: "https://tiktok.com/@…" })}
              </div>
            </FieldGroup>
          </Section>
        </TabsContent>

        <TabsContent value="adresse">
          <Section title="Adresse">
            <FieldGroup className="gap-5">
              {text("address", "Adresse", { placeholder: "Rue, quartier, repère" })}
              <div className="grid gap-5 sm:grid-cols-2">
                {text("city", "Ville")}
                {text("country", "Pays")}
              </div>
              {text("mapsUrl", "Lien Google Maps", { type: "url", placeholder: "https://maps.google.com/…" }, "Facultatif : ajoute un bouton « Voir sur la carte ».")}
            </FieldGroup>
          </Section>
        </TabsContent>

        <TabsContent value="emplois">
          <Section title="Offres d'emploi" description="Publiées sur votre fiche et dans « Offres d'emploi » une fois l'entreprise validée.">
            <div className="flex flex-col gap-4">
              {jobFields.fields.length === 0 && <p className="text-sm text-muted-foreground">Aucune offre pour le moment.</p>}
              {jobFields.fields.map((f, i) => {
                const err = errors.jobs?.[i]
                const closed = watch(`jobs.${i}.status`) === "CLOSED"
                return (
                  <div key={f.id} className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-background p-4", closed && "opacity-70")}>
                    <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem]">
                      <div>
                        <Input placeholder="Intitulé du poste" aria-label="Intitulé du poste" aria-invalid={!!err?.title} className="h-10" {...register(`jobs.${i}.title`)} />
                        {err?.title && <p className="mt-1 text-xs text-destructive">{err.title.message}</p>}
                      </div>
                      <Controller
                        control={control}
                        name={`jobs.${i}.type`}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={(v) => field.onChange(v as JobType)}>
                            <SelectTrigger className="h-10! w-full" aria-label="Type de contrat">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(jobTypeLabels) as JobType[]).map((t) => (
                                <SelectItem key={t} value={t}>
                                  {jobTypeLabels[t]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <div>
                        <Input placeholder="Ville" aria-label="Ville du poste" aria-invalid={!!err?.city} className="h-10" {...register(`jobs.${i}.city`)} />
                        {err?.city && <p className="mt-1 text-xs text-destructive">{err.city.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Textarea placeholder="Missions, profil recherché…" rows={3} aria-label="Description du poste" aria-invalid={!!err?.description} {...register(`jobs.${i}.description`)} />
                      {err?.description && <p className="mt-1 text-xs text-destructive">{err.description.message}</p>}
                    </div>
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-56 flex-1">
                        <Input placeholder="Pour postuler : email ou téléphone" aria-label="Contact pour postuler" aria-invalid={!!err?.applyContact} className="h-10" {...register(`jobs.${i}.applyContact`)} />
                        {err?.applyContact && <p className="mt-1 text-xs text-destructive">{err.applyContact.message}</p>}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => form.setValue(`jobs.${i}.status`, closed ? "OPEN" : "CLOSED", { shouldDirty: true })}
                      >
                        {closed ? "Rouvrir l'offre" : "Clôturer l'offre"}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="Supprimer l'offre" onClick={() => jobFields.remove(i)}>
                        <Trash2 className="text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              <Button
                type="button"
                variant="outline"
                className="w-fit rounded-full"
                onClick={() =>
                  jobFields.append({ title: "", type: "CDI", city: watch("city"), description: "", applyContact: watch("email") || watch("phone"), status: "OPEN" })
                }
              >
                <Plus /> Ajouter une offre
              </Button>
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <p className="text-xs text-muted-foreground">Chaque fiche est vérifiée par un administrateur avant publication.</p>
        <div className="flex gap-2">
          {business?.status !== "PUBLISHED" && (
            <Button type="button" variant="ghost" className="rounded-full" disabled={isSubmitting} onClick={saveDraft}>
              <Save /> Enregistrer le brouillon
            </Button>
          )}
          <Button type="submit" className="rounded-full px-5" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} {business?.status === "PUBLISHED" ? "Enregistrer" : "Soumettre pour validation"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Section({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      {title && <h2 className="font-heading text-lg text-brun">{title}</h2>}
      {description && <p className="mb-5 text-sm text-muted-foreground">{description}</p>}
      {!description && title && <div className="mb-5" />}
      {children}
    </section>
  )
}
