"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function ReplyForm({ locked }: { locked?: boolean }) {
  const [value, setValue] = useState("")

  if (locked) {
    return <p className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">Ce sujet est verrouillé par la modération.</p>
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        setValue("")
        toast.success("Réponse publiée")
      }}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4"
    >
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} placeholder="Votre réponse…" className="bg-background" />
      <div className="flex justify-end">
        <Button type="submit" className="rounded-full" disabled={!value.trim()}>
          <Send /> Répondre
        </Button>
      </div>
    </form>
  )
}
