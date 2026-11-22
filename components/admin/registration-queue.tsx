"use client"

import { useState } from "react"
import { Check, Mail, MapPin, MessageSquareMore, Phone, UserCheck, X } from "lucide-react"
import { toast } from "sonner"

import { MemberAvatar } from "@/components/espace/member-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, fromNow } from "@/lib/format"
import { bapaLinkLabels, providerLabels } from "@/lib/labels"
import type { ProfileCompletion } from "@/lib/profile"
import type { Member } from "@/lib/types"
import { cn } from "@/lib/utils"

type Registration = Member & { quartierName: string; completion: ProfileCompletion }

export function RegistrationQueue({ registrations }: { registrations: Registration[] }) {
  const [items, setItems] = useState(registrations)
  const [rejecting, setRejecting] = useState<Registration>()
  const [reason, setReason] = useState("")

  const remove = (id: string) => setItems((list) => list.filter((m) => m.id !== id))

  const review = async (m: Registration, decision: "ACTIVE" | "REJECTED", comment?: string) => {
    const res = await fetch(`/api/admin/registrations/${m.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || "Action impossible")
      return false
    }
    remove(m.id)
    return true
  }

  const approve = async (m: Registration) => {
    if (!(await review(m, "ACTIVE"))) return
    toast.success(`${m.firstName} ${m.lastName} a été accepté(e)`, {
      description: "Un email et un message WhatsApp de bienvenue ont été envoyés.",
    })
  }

  const askMore = (m: Registration) =>
    toast.success(`Demande de compléments envoyée à ${m.firstName}`, {
      description: m.completion.missing.length ? `À compléter : ${m.completion.missing.map((i) => i.label.toLowerCase()).join(", ")}.` : undefined,
    })

  const reject = async () => {
    if (!rejecting) return
    if (!(await review(rejecting, "REJECTED", reason))) return
    toast(`Demande de ${rejecting.firstName} ${rejecting.lastName} refusée`, { description: reason ? `Motif : ${reason}` : undefined })
    setRejecting(undefined)
    setReason("")
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-14 text-center">
        <UserCheck className="size-10 text-olive" />
        <p className="font-heading text-lg text-brun">Aucune demande en attente</p>
        <p className="text-sm text-muted-foreground">Toutes les inscriptions ont été traitées.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((m) => (
          <article key={m.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
            <header className="flex items-start gap-3">
              <MemberAvatar member={m} className="size-12" />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-lg text-brun">
                  {m.firstName} {m.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {[m.profession, m.birthYear && `né(e) en ${m.birthYear}`].filter(Boolean).join(" · ") || "Profil à compléter"}
                </p>
              </div>
              <Badge variant="outline">{fromNow(m.joinedAt)}</Badge>
            </header>

            <div className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profil complété</span>
                <span className={cn("font-medium tabular-nums", m.completion.percent < 50 ? "text-destructive" : "text-terre")}>
                  {m.completion.percent} %
                </span>
              </div>
              <Progress value={m.completion.percent} className="mt-2 h-1.5" />
              {m.completion.missing.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Manque : {m.completion.missing.map((i) => i.label.toLowerCase()).join(", ")}
                </p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Quartier d&apos;origine</dt>
                <dd className="font-medium text-brun">{m.quartierName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Famille</dt>
                <dd className="font-medium text-brun">{m.family ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Parrain</dt>
                <dd className="font-medium text-brun">{m.sponsorName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Lien avec Bapa</dt>
                <dd className="font-medium text-brun">{m.link ? bapaLinkLabels[m.link] : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Inscription via</dt>
                <dd className="font-medium text-brun">{providerLabels[m.provider]}</dd>
              </div>
            </dl>

            <ul className="flex flex-col gap-1.5 text-sm text-brun-soft">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-or" /> {[m.city, m.country].filter(Boolean).join(", ") || "Résidence non renseignée"}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-or" /> {m.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-or" /> {m.phone}
              </li>
            </ul>

            {m.motivation && <blockquote className="rounded-2xl bg-secondary p-4 text-sm text-brun-soft italic">« {m.motivation} »</blockquote>}

            <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Demande du {formatDate(m.joinedAt)}</span>
              <div className="flex flex-wrap gap-2">
                {m.completion.missing.length > 0 && (
                  <Button variant="ghost" className="rounded-full text-terre" onClick={() => askMore(m)}>
                    <MessageSquareMore /> Demander des compléments
                  </Button>
                )}
                <Button variant="outline" className="rounded-full" onClick={() => setRejecting(m)}>
                  <X /> Refuser
                </Button>
                <Button className="rounded-full bg-olive hover:bg-olive/90" onClick={() => approve(m)}>
                  <Check /> Valider
                </Button>
              </div>
            </footer>
          </article>
        ))}
      </div>

      <Dialog open={!!rejecting} onOpenChange={(v) => !v && setRejecting(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Refuser la demande</DialogTitle>
            <DialogDescription>
              {rejecting?.firstName} {rejecting?.lastName} sera informé(e) par email. Le motif est facultatif.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Motif</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Ex. : informations d'origine à préciser, parrain non identifié…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(undefined)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={reject}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
