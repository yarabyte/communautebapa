"use client"

import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type FieldConfig = {
  name: string
  label: string
  type?: "text" | "textarea" | "select" | "date" | "datetime-local" | "number" | "file" | "switch" | "email"
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  full?: boolean
  defaultValue?: string
  hint?: string
}

type Props = {
  title: string
  description?: string
  fields: FieldConfig[]
  triggerLabel?: string
  trigger?: React.ReactNode
  submitLabel?: string
  successMessage: string
}

export function EntityFormDialog({ title, description, fields, triggerLabel = "Ajouter", trigger, submitLabel = "Enregistrer", successMessage }: Props) {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const isEmpty = (v: FormDataEntryValue | null) => (v instanceof File ? v.size === 0 : !String(v ?? "").trim())
    const missing = fields.filter((f) => f.required && isEmpty(data.get(f.name))).map((f) => f.name)
    setErrors(missing)
    if (missing.length) return
    setOpen(false)
    toast.success(successMessage)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        setErrors([])
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-full">
            <Plus /> {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form id={`form-${title}`} onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          {fields.map((f) => {
            const invalid = errors.includes(f.name)
            const id = `f-${f.name}`
            return (
              <div key={f.name} className={cn("flex flex-col gap-2", (f.full || f.type === "textarea" || f.type === "file") && "sm:col-span-2")}>
                {f.type === "switch" ? (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
                    <div>
                      <Label htmlFor={id}>{f.label}</Label>
                      {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                    </div>
                    <Switch id={id} name={f.name} defaultChecked={f.defaultValue === "true"} />
                  </div>
                ) : (
                  <>
                    <Label htmlFor={id}>
                      {f.label}
                      {f.required && <span className="text-terre">*</span>}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea id={id} name={f.name} rows={5} placeholder={f.placeholder} defaultValue={f.defaultValue} aria-invalid={invalid} />
                    ) : f.type === "select" ? (
                      <Select name={f.name} defaultValue={f.defaultValue}>
                        <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
                          <SelectValue placeholder={f.placeholder ?? "Choisir…"} />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options?.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === "file" ? (
                      <label
                        htmlFor={id}
                        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-secondary/40 p-6 text-center text-sm text-muted-foreground hover:border-terre/50"
                      >
                        <Upload className="size-5 text-terre" />
                        <span>{f.placeholder ?? "Glissez un fichier ou cliquez pour parcourir"}</span>
                        <input id={id} name={f.name} type="file" className="sr-only" />
                      </label>
                    ) : (
                      <Input id={id} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder} defaultValue={f.defaultValue} aria-invalid={invalid} />
                    )}
                    {invalid ? <p className="text-xs text-destructive">Ce champ est requis.</p> : f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                  </>
                )}
              </div>
            )
          })}
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form={`form-${title}`}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
