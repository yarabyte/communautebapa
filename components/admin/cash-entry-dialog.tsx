"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Banknote } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatMoney, toXaf } from "@/lib/format"
import type { Currency } from "@/lib/types"

const schema = z.object({
  memberId: z.string().min(1, "Choisissez le contributeur"),
  projectId: z.string().min(1, "Choisissez le projet"),
  amount: z.coerce.number<string>().positive("Montant invalide"),
  currency: z.enum(["XAF", "EUR", "USD"]),
  date: z.string().min(1, "Date requise"),
  receiptNumber: z.string().optional(),
  note: z.string().optional(),
})

type Values = z.input<typeof schema>
type Option = { value: string; label: string }

export function CashEntryDialog({ members, projects }: { members: Option[]; projects: Option[] }) {
  const [open, setOpen] = useState(false)
  const form = useForm<Values, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { memberId: "", projectId: "", amount: "", currency: "XAF", date: "2026-10-30", receiptNumber: "", note: "" },
  })
  const { errors } = form.formState
  const amount = Number(form.watch("amount")) || 0
  const currency = form.watch("currency") as Currency

  const onSubmit = form.handleSubmit((v) => {
    setOpen(false)
    form.reset()
    toast.success("Versement en espèces enregistré", {
      description: `${formatMoney(v.amount, v.currency)} · le reçu a été envoyé au contributeur.`,
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Banknote /> Saisir des espèces
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Saisir un versement en espèces</DialogTitle>
          <DialogDescription>Enregistrez une somme remise en main propre. Un reçu numérique sera généré pour le contributeur.</DialogDescription>
        </DialogHeader>
        <form id="cash-entry" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Contributeur</Label>
            <Controller
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.memberId}>
                    <SelectValue placeholder="Choisir un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.memberId && <p className="text-xs text-destructive">{errors.memberId.message}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Projet</Label>
            <Controller
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.projectId}>
                    <SelectValue placeholder="Choisir un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.projectId && <p className="text-xs text-destructive">{errors.projectId.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cash-amount">Montant</Label>
            <Input id="cash-amount" type="number" min={1} {...form.register("amount")} aria-invalid={!!errors.amount} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Devise</Label>
            <Controller
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XAF">FCFA</SelectItem>
                    <SelectItem value="EUR">Euro</SelectItem>
                    <SelectItem value="USD">Dollar US</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {currency !== "XAF" && amount > 0 && <p className="-mt-2 text-xs text-muted-foreground sm:col-span-2">Contre-valeur : {formatMoney(toXaf(amount, currency))}</p>}
          <div className="flex flex-col gap-2">
            <Label htmlFor="cash-date">Date de remise</Label>
            <Input id="cash-date" type="date" {...form.register("date")} aria-invalid={!!errors.date} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cash-receipt">N° de reçu papier</Label>
            <Input id="cash-receipt" placeholder="Facultatif" {...form.register("receiptNumber")} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="cash-note">Note</Label>
            <Textarea id="cash-note" rows={3} placeholder="Ex. : remis lors de la réunion de Yaoundé" {...form.register("note")} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="cash-entry">
            Enregistrer le versement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
