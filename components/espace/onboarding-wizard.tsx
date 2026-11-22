"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Briefcase, Check, Loader2, Store } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AssociationPicker } from "@/components/auth/association-picker"
import { Stepper } from "@/components/auth/stepper"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { bapaLinkLabels } from "@/lib/labels"
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/profile"
import type { Association, BapaLink, Member, Quartier } from "@/lib/types"

const STEP_LABELS: Record<OnboardingStep, string> = {
  origines: "Origines",
  residence: "Vous",
  associations: "Associations",
  entreprise: "Entreprise",
}

const COUNTRIES = ["Cameroun", "France", "Belgique", "Suisse", "Allemagne", "Italie", "Royaume-Uni", "Canada", "États-Unis", "Gabon", "Afrique du Sud", "Autre"]

const schema = z.object({
  quartierId: z.string(),
  link: z.string(),
  gender: z.string(),
  birthYear: z.union([z.literal(""), z.string().regex(/^(19|20)\d{2}$/, "Année invalide")]),
  country: z.string(),
  city: z.string(),
  profession: z.string(),
  bio: z.string().max(400, "400 caractères maximum"),
  showInDirectory: z.boolean(),
  associationIds: z.array(z.string()),
})

type Values = z.infer<typeof schema>

type Props = {
  member: Member
  quartiers: Quartier[]
  associations: Association[]
  memberAssociationIds: string[]
  initialStep?: OnboardingStep
  preselectedSlug?: string
}

export function OnboardingWizard({ member, quartiers, associations, memberAssociationIds, initialStep, preselectedSlug }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(Math.max(0, ONBOARDING_STEPS.indexOf(initialStep ?? "origines")))
  const preselected = associations.find((a) => a.slug === preselectedSlug)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      quartierId: member.quartierId ?? "",
      link: member.link ?? "",
      gender: member.gender ?? "",
      birthYear: member.birthYear ? String(member.birthYear) : "",
      country: member.country ?? "",
      city: member.city ?? "",
      profession: member.profession ?? "",
      bio: member.bio ?? "",
      showInDirectory: member.showInDirectory ?? true,
      associationIds: [...new Set([...memberAssociationIds, ...(preselected ? [preselected.id] : [])])],
    },
  })
  const { register, control, formState, watch } = form
  const { errors, isSubmitting } = formState
  const current = ONBOARDING_STEPS[step]

  const goTo = (next: number) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const persist = async (done: boolean) => {
    const v = form.getValues()
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quartierId: v.quartierId || null,
        link: (v.link as BapaLink) || null,
        gender: v.gender === "FEMME" || v.gender === "HOMME" ? v.gender : null,
        birthYear: v.birthYear ? Number(v.birthYear) : null,
        country: v.country || null,
        city: v.city || null,
        profession: v.profession || null,
        bio: v.bio || null,
        showInDirectory: v.showInDirectory,
        associationIds: v.associationIds,
        ...(done ? { onboardedAt: true } : {}),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || "Enregistrement impossible")
      return false
    }
    return true
  }

  const finish = async () => {
    if (!(await persist(true))) return
    toast.success("Profil enregistré", { description: "Vous pourrez le compléter à tout moment depuis « Mon profil »." })
    router.push("/espace")
    router.refresh()
  }

  const save = form.handleSubmit(async (v) => {
    if (current === "origines" && (!v.quartierId || !v.link)) {
      toast.error("Indiquez votre quartier d'origine et votre lien avec Bapa")
      return
    }
    if (current === "associations" && v.associationIds.length === 0) {
      toast.error("Choisissez au moins une association")
      return
    }
    if (!(await persist(false))) return
    toast.success("Informations enregistrées")
    goTo(step + 1)
  })

  return (
    <div className="flex flex-col gap-8">
      <Stepper steps={ONBOARDING_STEPS.map((s) => STEP_LABELS[s])} current={step} />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-5 sm:p-7"
      >
        {current === "origines" && (
          <FieldGroup className="gap-5">
            <StepTitle title="Vos origines" text="Ces informations aident le responsable à valider votre demande et vous relient aux membres de votre quartier." />
            <Field>
              <FieldLabel>Quartier d&apos;origine</FieldLabel>
              <Controller
                control={control}
                name="quartierId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11! w-full bg-background">
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
                control={control}
                name="link"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2">
                    {(Object.entries(bapaLinkLabels) as [BapaLink, string][]).map(([value, label]) => (
                      <Label
                        key={value}
                        htmlFor={`l-${value}`}
                        className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 font-normal has-data-[state=checked]:border-terre has-data-[state=checked]:bg-accent"
                      >
                        <RadioGroupItem id={`l-${value}`} value={value} /> {label}
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>
          </FieldGroup>
        )}

        {current === "residence" && (
          <FieldGroup className="gap-5">
            <StepTitle title="Vous" text="Pour que les membres de votre ville et de votre profession puissent vous retrouver." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel>Genre</FieldLabel>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex h-11 items-center gap-6">
                      {[
                        { value: "FEMME", label: "Femme" },
                        { value: "HOMME", label: "Homme" },
                      ].map((o) => (
                        <Label key={o.value} htmlFor={`g-${o.value}`} className="flex items-center gap-2 font-normal">
                          <RadioGroupItem id={`g-${o.value}`} value={o.value} /> {o.label}
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </Field>
              <Field data-invalid={!!errors.birthYear}>
                <FieldLabel htmlFor="birthYear">Année de naissance</FieldLabel>
                <Input id="birthYear" inputMode="numeric" maxLength={4} placeholder="1985" className="h-11 bg-background" aria-invalid={!!errors.birthYear} {...register("birthYear")} />
                <FieldError errors={[errors.birthYear]} />
              </Field>
              <Field>
                <FieldLabel>Pays de résidence</FieldLabel>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11! w-full bg-background">
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
              <Field>
                <FieldLabel htmlFor="city">Ville</FieldLabel>
                <Input id="city" autoComplete="address-level2" className="h-11 bg-background" {...register("city")} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="profession">Profession</FieldLabel>
              <Input id="profession" placeholder="Enseignant, commerçante, étudiant…" className="h-11 bg-background" {...register("profession")} />
            </Field>
            <Field data-invalid={!!errors.bio}>
              <FieldLabel htmlFor="bio">Quelques mots sur vous</FieldLabel>
              <Textarea id="bio" rows={3} className="bg-background" {...register("bio")} />
              <FieldError errors={[errors.bio]} />
            </Field>
            <Controller
              control={control}
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
          </FieldGroup>
        )}

        {current === "associations" && (
          <FieldGroup className="min-w-0 gap-5">
            <StepTitle
              title="Vos associations"
              text="Quartier d'origine, association de votre ville ou de votre pays de résidence : chaque responsable recevra votre demande d'adhésion."
            />
            <Controller
              control={control}
              name="associationIds"
              render={({ field }) => (
                <AssociationPicker
                  associations={associations}
                  value={field.value}
                  onChange={field.onChange}
                  initialCountry={preselected?.country ?? (watch("country") || undefined)}
                />
              )}
            />
          </FieldGroup>
        )}

        {current === "entreprise" && (
          <div className="flex flex-col gap-5">
            <StepTitle
              title="Avez-vous une entreprise ?"
              text="Commerce, cabinet, atelier, exploitation, société de services… Présentez-la dans « Entrepreneurs Bapa » pour que la communauté fasse appel à vous."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/espace/mes-entreprises/nouvelle"
                className="group flex flex-col gap-3 rounded-2xl border border-terre/40 bg-accent p-5 transition-colors hover:border-terre"
              >
                <Store className="size-7 text-terre" />
                <span className="font-medium text-brun">Oui, je présente mon entreprise</span>
                <span className="text-sm text-brun-soft">Nom, services, contacts et adresse. Elle sera publiée après validation.</span>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-terre">
                  Créer ma fiche <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <button
                type="button"
                onClick={finish}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 text-left transition-colors hover:border-terre/40"
              >
                <Briefcase className="size-7 text-muted-foreground" />
                <span className="font-medium text-brun">Pas pour l&apos;instant</span>
                <span className="text-sm text-brun-soft">Vous pourrez l&apos;ajouter plus tard depuis « Mes entreprises ».</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => goTo(step - 1)}>
              <ArrowLeft /> Retour
            </Button>
          ) : (
            <span />
          )}
          {current === "entreprise" ? (
            <Button type="button" className="rounded-full px-5" onClick={finish}>
              <Check /> Terminer
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => goTo(step + 1)}>
                Passer
              </Button>
              <Button type="submit" className="rounded-full px-5" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />} Enregistrer et continuer <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-heading text-xl text-brun">{title}</h2>
      <p className="mt-1 text-sm text-brun-soft">{text}</p>
    </div>
  )
}
