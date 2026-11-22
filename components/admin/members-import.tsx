"use client"

import { useRef, useState } from "react"
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type Props = {
  associationId: string
  associationName: string
}

export function MembersImport({ associationId, associationName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onUpload = async (file: File) => {
    setBusy(true)
    try {
      const form = new FormData()
      form.set("file", file)
      const res = await fetch(`/api/associations/${associationId}/members/import`, {
        method: "POST",
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Import impossible")
        return
      }
      const errCount = Array.isArray(data.errors) ? data.errors.length : 0
      toast.success(`Import terminé pour ${associationName}`, {
        description: `${data.created ?? 0} créé(s), ${data.skipped ?? 0} ignoré(s)/mis à jour${errCount ? `, ${errCount} erreur(s)` : ""}. Mot de passe temporaire envoyé par email et WhatsApp.`,
      })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-terre">
          <FileSpreadsheet className="size-5" />
        </span>
        <div>
          <p className="font-medium text-brun">Importer des membres</p>
          <p className="text-sm text-muted-foreground">
            Téléchargez le modèle Excel, renseignez prénom, nom, email, téléphone, puis importez. Les comptes sont créés en attente de validation.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <a href={`/api/associations/${associationId}/members/template`}>
            <Download /> Modèle Excel
          </a>
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void onUpload(file)
          }}
        />
        <Button className="rounded-full" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Importer
        </Button>
      </div>
    </div>
  )
}
