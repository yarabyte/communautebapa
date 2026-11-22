"use client"

import { KeyRound, Mail, Smartphone, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { SectionCard } from "@/components/espace/section-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Member } from "@/lib/types"

const notifRows = [
  { key: "events", label: "Événements et rappels" },
  { key: "news", label: "Annonces de la chefferie" },
  { key: "messages", label: "Nouveaux messages" },
  { key: "contrib", label: "Reçus de contribution" },
]
const channels = ["Email", "SMS", "WhatsApp"]

export function SettingsPanels({ member }: { member: Member }) {
  const saved = () => toast.success("Préférence enregistrée")

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Connexion et sécurité" contentClassName="flex flex-col divide-y divide-border p-0">
        {[
          { icon: Mail, label: "Email", value: member.email, action: "Modifier" },
          { icon: Smartphone, label: "Téléphone", value: member.phone, action: "Modifier" },
          { icon: KeyRound, label: "Mot de passe", value: "Modifié il y a 3 mois", action: "Changer" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-4 px-5 py-4">
            <r.icon className="size-5 text-or" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-brun">{r.label}</p>
              <p className="truncate text-sm text-muted-foreground">{r.value}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => toast("Fonctionnalité disponible prochainement")}>
              {r.action}
            </Button>
          </div>
        ))}
        <div className="flex flex-col gap-3 px-5 py-4">
          <p className="text-sm font-medium text-brun">Comptes associés</p>
          {[
            { name: "Google", linked: true },
            { name: "Facebook", linked: false },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                {p.name}
                {p.linked && <Badge className="bg-olive/15 text-olive">Associé</Badge>}
              </span>
              <Button variant="ghost" size="sm" onClick={() => toast.success(p.linked ? `${p.name} dissocié` : `${p.name} associé`)}>
                {p.linked ? "Dissocier" : "Associer"}
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notifications" description="Choisissez comment être prévenu." contentClassName="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wider text-muted-foreground uppercase">
              <th className="px-5 py-3 font-medium">Sujet</th>
              {channels.map((c) => (
                <th key={c} className="px-3 py-3 text-center font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notifRows.map((r, i) => (
              <tr key={r.key} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-brun">{r.label}</td>
                {channels.map((c, j) => (
                  <td key={c} className="px-3 py-3 text-center">
                    <Switch defaultChecked={j === 0 || (j === 2 && i < 3)} onCheckedChange={saved} aria-label={`${r.label} par ${c}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard title="Confidentialité" contentClassName="flex flex-col gap-4">
        {[
          { id: "dir", label: "Apparaître dans l'annuaire", desc: "Votre profil est visible par les membres validés.", on: true },
          { id: "phone", label: "Afficher mon téléphone", desc: "Visible sur votre fiche dans l'annuaire.", on: false },
          { id: "anon", label: "Contributions anonymes par défaut", desc: "Votre nom n'apparaît pas dans la liste des contributeurs.", on: false },
        ].map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor={o.id}>{o.label}</Label>
              <p className="text-sm text-muted-foreground">{o.desc}</p>
            </div>
            <Switch id={o.id} defaultChecked={o.on} onCheckedChange={saved} />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Zone sensible" className="border-destructive/30" contentClassName="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">La suppression de votre compte est définitive. Vos reçus de contribution restent archivés.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="rounded-full">
              <Trash2 /> Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous quitterez toutes vos associations et perdrez l&apos;accès à vos messages. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => toast("Demande de suppression enregistrée")}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SectionCard>
    </div>
  )
}
