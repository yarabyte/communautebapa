"use client"

import { useMemo, useState } from "react"
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatFileSize } from "@/lib/format"
import { documentTypeLabels } from "@/lib/labels"
import type { BapaDocument, DocumentType } from "@/lib/types"

type Row = BapaDocument & { associationName?: string }

const ALL = "tous"

export function DocumentsTable({ documents, showAssociation = true }: { documents: Row[]; showAssociation?: boolean }) {
  const [q, setQ] = useState("")
  const [type, setType] = useState<string>(ALL)

  const rows = useMemo(
    () =>
      documents.filter(
        (d) =>
          (type === ALL || d.type === type) &&
          `${d.title} ${d.associationName ?? ""}`.toLowerCase().includes(q.toLowerCase())
      ),
    [documents, q, type]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un document…" className="h-10 bg-card pl-9" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-10! w-full bg-card sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les types</SelectItem>
            {(Object.keys(documentTypeLabels) as DocumentType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {documentTypeLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="pl-4">Document</TableHead>
              {showAssociation && <TableHead className="hidden md:table-cell">Association</TableHead>}
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => {
              const Icon = d.fileType === "xlsx" ? FileSpreadsheet : FileText
              return (
                <TableRow key={d.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-terre/10 text-terre">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium whitespace-normal text-brun">{d.title}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {d.fileType} · {formatFileSize(d.sizeKb)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {showAssociation && (
                    <TableCell className="hidden text-muted-foreground md:table-cell">{d.associationName ?? "Communauté"}</TableCell>
                  )}
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{documentTypeLabels[d.type]}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(d.uploadedAt, "d MMM yyyy")}</TableCell>
                  <TableCell>
                    <Button size="icon-sm" variant="ghost" aria-label="Télécharger" onClick={() => toast.success(`Téléchargement de « ${d.title} »`)}>
                      <Download />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Aucun document trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
