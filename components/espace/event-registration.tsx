"use client"

import { useState } from "react"
import { CalendarCheck, CalendarPlus, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function EventRegistration({ title, initiallyRegistered = false, withTransport = false }: { title: string; initiallyRegistered?: boolean; withTransport?: boolean }) {
  const [registered, setRegistered] = useState(initiallyRegistered)
  const [guests, setGuests] = useState(0)
  const [open, setOpen] = useState(false)

  if (registered) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-olive/30 bg-olive/10 p-4 text-sm text-olive">
          <CalendarCheck className="size-5" />
          <span>
            Vous êtes inscrit{guests > 0 && ` avec ${guests} accompagnant${guests > 1 ? "s" : ""}`}.
          </span>
        </div>
        <Button
          variant="ghost"
          className="text-destructive"
          onClick={() => {
            setRegistered(false)
            toast("Inscription annulée")
          }}
        >
          Annuler mon inscription
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-11 w-full rounded-full">
          <CalendarPlus /> S&apos;inscrire
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Inscription</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Label>Accompagnants</Label>
            <div className="flex items-center gap-3">
              <Button size="icon-sm" variant="outline" onClick={() => setGuests((g) => Math.max(0, g - 1))} aria-label="Retirer">
                <Minus />
              </Button>
              <span className="w-6 text-center font-medium">{guests}</span>
              <Button size="icon-sm" variant="outline" onClick={() => setGuests((g) => Math.min(5, g + 1))} aria-label="Ajouter">
                <Plus />
              </Button>
            </div>
          </div>
          {withTransport && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="transport">Transport groupé</Label>
                <p className="text-xs text-muted-foreground">Bus au départ de Yaoundé ou Douala</p>
              </div>
              <Switch id="transport" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Message aux organisateurs (facultatif)</Label>
            <Textarea id="note" rows={3} placeholder="Régime alimentaire, besoin d'hébergement…" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            className="rounded-full"
            onClick={() => {
              setRegistered(true)
              setOpen(false)
              toast.success("Inscription confirmée", { description: "Un rappel vous sera envoyé la veille." })
            }}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
