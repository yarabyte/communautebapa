"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock, Smartphone } from "lucide-react"
import { toast } from "sonner"

import { Stepper } from "@/components/auth/stepper"
import { PaymentMethodIcon } from "@/components/shared/payment-method-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatMoney, percent, toXaf } from "@/lib/format"
import { paymentMethodLabels } from "@/lib/labels"
import type { Currency, PaymentMethod, Project } from "@/lib/types"
import { cn } from "@/lib/utils"

const STEPS = ["Projet", "Montant", "Paiement", "Confirmation"]

const presets: Record<Currency, number[]> = {
  XAF: [5_000, 10_000, 25_000, 50_000, 100_000],
  EUR: [10, 25, 50, 100, 250],
  USD: [10, 25, 50, 100, 250],
}

const methods: { value: PaymentMethod; hint: string }[] = [
  { value: "ORANGE_MONEY", hint: "Validation sur votre téléphone" },
  { value: "MTN_MOMO", hint: "Validation sur votre téléphone" },
  { value: "CARD", hint: "Visa, Mastercard" },
  { value: "PAYPAL", hint: "Idéal pour la diaspora" },
  { value: "CASH", hint: "Remise au trésorier" },
]

type Props = { projects: Project[]; initialProjectSlug?: string }

export function PaymentWizard({ projects, initialProjectSlug }: Props) {
  const initial = projects.find((p) => p.slug === initialProjectSlug)
  const [step, setStep] = useState(initial ? 1 : 0)
  const [projectId, setProjectId] = useState(initial?.id ?? "")
  const [currency, setCurrency] = useState<Currency>("XAF")
  const [amount, setAmount] = useState<number>(10_000)
  const [anonymous, setAnonymous] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>("ORANGE_MONEY")
  const [phone, setPhone] = useState("")
  const [processing, setProcessing] = useState(false)
  const [reference, setReference] = useState<string>()

  const project = projects.find((p) => p.id === projectId)
  const amountXaf = toXaf(amount || 0, currency)

  const canContinue = [!!projectId, amount > 0, method !== "ORANGE_MONEY" && method !== "MTN_MOMO" ? true : /^[0-9 ]{8,14}$/.test(phone)][step] ?? true

  const pay = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1600))
    setProcessing(false)
    setReference(`BAPA-2026-${Math.floor(10000 + Math.random() * 89999)}`)
    setStep(3)
    toast.success(method === "CASH" ? "Promesse de don enregistrée" : "Paiement confirmé")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_1fr]">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-5 sm:p-7">
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xl text-brun">Quel projet souhaitez-vous soutenir ?</h2>
            <div className="grid gap-3">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProjectId(p.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-3 text-left transition-colors",
                    projectId === p.id ? "border-terre bg-accent" : "border-border hover:border-terre/40"
                  )}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brun">{p.title}</p>
                    <Progress value={percent(p.raisedXaf, p.goalXaf)} className="mt-2 h-1.5" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {percent(p.raisedXaf, p.goalXaf)} % de {formatMoney(p.goalXaf)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-xl text-brun">Montant de votre contribution</h2>
            <div className="flex flex-col gap-2">
              <Label>Devise</Label>
              <ToggleGroup
                type="single"
                value={currency}
                onValueChange={(v) => {
                  if (!v) return
                  setCurrency(v as Currency)
                  setAmount(presets[v as Currency][1])
                }}
                variant="outline"
                className="w-fit"
              >
                {(["XAF", "EUR", "USD"] as Currency[]).map((c) => (
                  <ToggleGroupItem key={c} value={c} className="px-5 data-[state=on]:bg-terre data-[state=on]:text-creme-light">
                    {c === "XAF" ? "FCFA" : c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {presets[currency].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={cn(
                    "rounded-xl border py-3 text-sm font-medium transition-colors",
                    amount === v ? "border-terre bg-terre text-creme-light" : "border-border hover:border-terre/40"
                  )}
                >
                  {formatMoney(v, currency)}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Autre montant</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="h-12 bg-background pr-16 text-lg"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">{currency === "XAF" ? "FCFA" : currency}</span>
              </div>
              {currency !== "XAF" && <p className="text-sm text-muted-foreground">Contre-valeur indicative : {formatMoney(amountXaf)}</p>}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary p-4">
              <div>
                <Label htmlFor="anon">Contribution anonyme</Label>
                <p className="text-xs text-muted-foreground">Votre nom n&apos;apparaîtra pas dans la liste des contributeurs.</p>
              </div>
              <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-xl text-brun">Moyen de paiement</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {methods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    method === m.value ? "border-terre bg-accent" : "border-border hover:border-terre/40"
                  )}
                >
                  <PaymentMethodIcon method={m.value} />
                  <span>
                    <span className="block text-sm font-medium text-brun">{paymentMethodLabels[m.value]}</span>
                    <span className="text-xs text-muted-foreground">{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>

            {(method === "ORANGE_MONEY" || method === "MTN_MOMO") && (
              <div className="flex flex-col gap-2 rounded-2xl border border-border p-4">
                <Label htmlFor="momo">Numéro {paymentMethodLabels[method]}</Label>
                <div className="flex gap-2">
                  <span className="flex h-11 items-center rounded-lg border border-input bg-muted px-3 text-sm">+237</span>
                  <Input id="momo" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6 70 00 00 00" className="h-11 bg-background" inputMode="tel" />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="size-3.5" /> Vous recevrez une demande de confirmation à valider avec votre code secret. Montant débité : {formatMoney(amountXaf)}.
                </p>
              </div>
            )}
            {method === "CARD" && (
              <div className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="cc">Numéro de carte</Label>
                  <Input id="cc" placeholder="4242 4242 4242 4242" className="h-11 bg-background" inputMode="numeric" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="exp">Expiration</Label>
                  <Input id="exp" placeholder="MM/AA" className="h-11 bg-background" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" className="h-11 bg-background" inputMode="numeric" />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
                  <Lock className="size-3.5" /> Paiement sécurisé. Les données de carte ne sont jamais stockées par la communauté.
                </p>
              </div>
            )}
            {method === "PAYPAL" && (
              <p className="rounded-2xl border border-border p-4 text-sm text-brun-soft">
                Vous serez redirigé vers PayPal pour finaliser le paiement de {formatMoney(amount, currency)}, puis ramené ici automatiquement.
              </p>
            )}
            {method === "CASH" && (
              <p className="rounded-2xl border border-border p-4 text-sm text-brun-soft">
                Votre promesse de don sera enregistrée avec une référence. Remettez le montant au trésorier de votre association, qui
                confirmera la réception dans la plateforme. Votre reçu sera alors disponible.
              </p>
            )}
          </div>
        )}

        {step === 3 && reference && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-16 text-olive" />
            <h2 className="font-heading text-2xl text-brun">{method === "CASH" ? "Promesse enregistrée" : "Merci pour votre contribution !"}</h2>
            <p className="max-w-md text-brun-soft">
              {method === "CASH"
                ? "Le trésorier confirmera la réception des espèces. Vous serez notifié et votre reçu sera disponible."
                : `Votre contribution de ${formatMoney(amount, currency)} au projet « ${project?.title} » a bien été reçue.`}
            </p>
            <p className="rounded-full bg-secondary px-4 py-1.5 text-sm">
              Référence : <span className="font-medium">{reference}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full">
                <Link href="/espace/contributions">Voir mes contributions</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/espace/projets/${project?.slug}`}>Suivre le projet</Link>
              </Button>
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
            {step > 0 ? (
              <Button variant="ghost" className="rounded-full" onClick={() => setStep(step - 1)}>
                <ArrowLeft /> Retour
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button size="lg" className="h-11 rounded-full px-6" disabled={!canContinue} onClick={() => setStep(step + 1)}>
                Continuer <ArrowRight />
              </Button>
            ) : (
              <Button size="lg" className="h-11 rounded-full px-6" disabled={!canContinue || processing} onClick={pay}>
                {processing && <Loader2 className="animate-spin" />}
                {method === "CASH" ? "Enregistrer ma promesse" : `Payer ${formatMoney(amount, currency)}`}
              </Button>
            )}
          </div>
        )}
      </div>

      <aside className="tone-creme flex h-fit flex-col gap-4 rounded-3xl border border-or/40 p-6 lg:sticky lg:top-24">
        <h2 className="font-heading text-lg text-brun">Récapitulatif</h2>
        {project ? (
          <>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={project.image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
            </div>
            <p className="font-medium text-brun">{project.title}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Choisissez un projet.</p>
        )}
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Montant</dt>
            <dd className="font-medium">{formatMoney(amount || 0, currency)}</dd>
          </div>
          {currency !== "XAF" && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Contre-valeur</dt>
              <dd>{formatMoney(amountXaf)}</dd>
            </div>
          )}
          {step >= 2 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Moyen</dt>
              <dd>{paymentMethodLabels[method]}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Visibilité</dt>
            <dd>{anonymous ? "Anonyme" : "Nom affiché"}</dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}
