"use client"

import { useState } from "react"
import { Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PaymentMethodIcon } from "@/components/shared/payment-method-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MAIN_SITE_URL, XAF_RATES } from "@/lib/constants"
import { paymentMethodLabels } from "@/lib/labels"
import type { PaymentMethod, Quartier } from "@/lib/types"

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
      <header>
        <h2 className="font-heading text-lg text-brun">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

function Field({ id, label, hint, ...props }: React.ComponentProps<typeof Input> & { id: string; label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="bg-background" {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Toggle({ id, label, hint, defaultChecked }: { id: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  )
}

const paymentConfig: { method: PaymentMethod; fields: { id: string; label: string; placeholder: string }[] }[] = [
  { method: "ORANGE_MONEY", fields: [{ id: "om-merchant", label: "Code marchand", placeholder: "OM-BAPA-0001" }] },
  { method: "MTN_MOMO", fields: [{ id: "momo-key", label: "Clé API (collection)", placeholder: "••••••••••••" }] },
  { method: "CARD", fields: [{ id: "card-key", label: "Clé publique du prestataire", placeholder: "pk_live_••••" }] },
  { method: "PAYPAL", fields: [{ id: "paypal-id", label: "Client ID PayPal", placeholder: "AX••••" }] },
  { method: "CASH", fields: [] },
]

export function AdminSettings({ quartiers: initialQuartiers }: { quartiers: Quartier[] }) {
  const [quartiers, setQuartiers] = useState(initialQuartiers)
  const [newQuartier, setNewQuartier] = useState("")
  const save = () => toast.success("Paramètres enregistrés")

  return (
    <Tabs defaultValue="general" className="gap-6">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
        <TabsTrigger value="paiements">Paiements</TabsTrigger>
        <TabsTrigger value="quartiers">Quartiers</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="flex flex-col gap-6">
        <Panel title="Identité de la communauté">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Nom" defaultValue="Communauté Bapa" />
            <Field id="tagline" label="Devise" defaultValue="Ngouon' a Pa'a" />
            <Field id="email" label="Email de contact" type="email" defaultValue="communaute@bapa-officiel.com" />
            <Field id="phone" label="Téléphone" defaultValue="+237 6 99 00 00 00" />
            <Field id="main" label="Site principal" defaultValue={MAIN_SITE_URL} />
            <Field id="whatsapp" label="Lien WhatsApp communautaire" placeholder="https://chat.whatsapp.com/…" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="welcome">Message d&apos;accueil des nouveaux membres</Label>
            <Textarea
              id="welcome"
              rows={4}
              className="bg-background"
              defaultValue="Bienvenue dans la communauté des fils et filles de Bapa. Complétez votre profil et rejoignez votre association."
            />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="inscriptions" className="flex flex-col gap-6">
        <Panel title="Règles d'adhésion" description="Contrôlez qui peut rejoindre l'espace membre.">
          <Toggle id="moderation" label="Validation manuelle des inscriptions" hint="Chaque nouveau compte doit être approuvé par un administrateur." defaultChecked />
          <Toggle id="sponsor" label="Parrainage obligatoire" hint="Le candidat doit indiquer un membre parrain." />
          <Toggle id="invites" label="Valider d'office les invitations" hint="Les membres invités par un administrateur sont acceptés automatiquement." defaultChecked />
          <Toggle id="phone-verif" label="Vérification du téléphone par OTP" defaultChecked />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="admins" label="Emails notifiés à chaque inscription" defaultValue="secretariat@bapa-officiel.com" />
            <Field id="delay" label="Délai de traitement annoncé (jours)" type="number" defaultValue={3} />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="paiements" className="flex flex-col gap-6">
        <Panel title="Moyens de paiement" description="Activez les moyens proposés aux contributeurs et renseignez les identifiants des prestataires.">
          <div className="flex flex-col gap-3">
            {paymentConfig.map(({ method, fields }) => (
              <div key={method} className="flex flex-col gap-4 rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <PaymentMethodIcon method={method} />
                  <Label htmlFor={`pm-${method}`} className="flex-1">
                    {paymentMethodLabels[method]}
                  </Label>
                  <Switch id={`pm-${method}`} defaultChecked />
                </div>
                {fields.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fields.map((f) => (
                      <Field key={f.id} id={f.id} label={f.label} placeholder={f.placeholder} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Taux de conversion" description="Utilisés pour afficher la contre-valeur en FCFA des contributions en devises.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="eur" label="1 EUR en FCFA" type="number" step="0.001" defaultValue={XAF_RATES.EUR} hint="Parité fixe BEAC" />
            <Field id="usd" label="1 USD en FCFA" type="number" step="0.01" defaultValue={XAF_RATES.USD} hint="Mis à jour manuellement" />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="quartiers" className="flex flex-col gap-6">
        <Panel title="Quartiers du village" description="Liste proposée lors de l'inscription (champ « quartier d'origine »).">
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
            {quartiers.map((q) => (
              <li key={q.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="size-2 rotate-45 bg-or" />
                <Input
                  defaultValue={q.name}
                  aria-label={`Nom du quartier ${q.name}`}
                  className="h-8 flex-1 border-transparent bg-transparent px-1 shadow-none focus-visible:border-input"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Supprimer ${q.name}`}
                  onClick={() => setQuartiers((list) => list.filter((x) => x.id !== q.id))}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newQuartier.trim()) return
              setQuartiers((list) => [...list, { id: `new-${list.length}`, name: newQuartier.trim() }])
              setNewQuartier("")
            }}
          >
            <Input value={newQuartier} onChange={(e) => setNewQuartier(e.target.value)} placeholder="Nouveau quartier" className="bg-background" />
            <Button type="submit" variant="outline">
              <Plus /> Ajouter
            </Button>
          </form>
        </Panel>
      </TabsContent>

      <TabsContent value="notifications" className="flex flex-col gap-6">
        <Panel title="Canaux d'envoi" description="Codes OTP, reçus de paiement et rappels d'événements.">
          <Toggle id="n-email" label="Email" hint="Envoi via le serveur SMTP du VPS" defaultChecked />
          <Toggle id="n-sms" label="SMS" hint="Codes OTP et reçus pour les numéros camerounais" defaultChecked />
          <Toggle id="n-wa" label="WhatsApp" hint="Codes OTP et rappels pour la diaspora" defaultChecked />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sms-sender" label="Nom d'expéditeur SMS" defaultValue="BAPA" maxLength={11} />
            <Field id="wa-number" label="Numéro WhatsApp Business" placeholder="+237 …" />
          </div>
        </Panel>
      </TabsContent>

      <div className="flex justify-end">
        <Button size="lg" className="h-11 rounded-full px-6" onClick={save}>
          <Save /> Enregistrer les modifications
        </Button>
      </div>
    </Tabs>
  )
}
