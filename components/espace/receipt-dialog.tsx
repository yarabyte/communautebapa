"use client"

import Image from "next/image"
import { Printer, ReceiptText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatDateTime, formatMoney } from "@/lib/format"
import { contributionStatusLabels, paymentMethodLabels } from "@/lib/labels"
import type { Contribution } from "@/lib/types"

export function ReceiptDialog({ contribution, projectTitle, memberName }: { contribution: Contribution; projectTitle: string; memberName: string }) {
  const rows: [string, string][] = [
    ["Référence", contribution.reference],
    ["Date", formatDateTime(contribution.createdAt)],
    ["Contributeur", memberName],
    ["Projet", projectTitle],
    ["Moyen de paiement", paymentMethodLabels[contribution.method]],
    ["Statut", contributionStatusLabels[contribution.status]],
  ]
  if (contribution.currency !== "XAF") rows.push(["Contre-valeur", formatMoney(contribution.amountXaf)])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" disabled={contribution.status !== "COMPLETED"}>
          <ReceiptText /> Reçu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <Image src="/images/logo-bapa.png" alt="" width={48} height={56} className="h-14 w-auto" />
          <DialogTitle className="font-heading text-xl">Reçu de contribution</DialogTitle>
          <DialogDescription>Communauté Bapa · Royaume Bapa</DialogDescription>
        </DialogHeader>
        <div className="tone-creme rounded-2xl border border-or/40 p-5 text-center">
          <p className="text-xs tracking-[0.2em] text-or-dark uppercase">Montant</p>
          <p className="font-heading mt-1 text-3xl text-terre">{formatMoney(contribution.amount, contribution.currency)}</p>
        </div>
        <dl className="flex flex-col divide-y divide-border text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium text-brun">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-center text-xs text-muted-foreground">Merci pour votre soutien au développement de Bapa.</p>
        <Button variant="outline" className="rounded-full" onClick={() => window.print()}>
          <Printer /> Imprimer ou enregistrer en PDF
        </Button>
      </DialogContent>
    </Dialog>
  )
}
