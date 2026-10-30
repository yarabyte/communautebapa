"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { forumCategoryLabels } from "@/lib/labels"

export function NewThreadDialog() {
  const [open, setOpen] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (String(data.get("title")).trim().length < 6) return toast.error("Le titre doit faire au moins 6 caractères.")
    setOpen(false)
    toast.success("Sujet publié", { description: "Il est maintenant visible par les membres." })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus /> Nouveau sujet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Ouvrir une discussion</DialogTitle>
          <DialogDescription>Restez courtois et respectez la charte de la communauté.</DialogDescription>
        </DialogHeader>
        <form id="new-thread" onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" placeholder="De quoi souhaitez-vous parler ?" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Catégorie</Label>
            <Select name="category" defaultValue="GENERAL">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(forumCategoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Message</Label>
            <Textarea id="content" name="content" rows={6} placeholder="Votre message…" />
          </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="new-thread">
            Publier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
