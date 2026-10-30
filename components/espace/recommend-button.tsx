"use client"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function RecommendButton({ businessName, initiallyRecommended = false, count }: { businessName: string; initiallyRecommended?: boolean; count: number }) {
  const [recommended, setRecommended] = useState(initiallyRecommended)
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  const total = count + (recommended && !initiallyRecommended ? 1 : 0) - (!recommended && initiallyRecommended ? 1 : 0)

  if (recommended) {
    return (
      <Button
        variant="outline"
        className="rounded-full border-olive/40 bg-olive/10 text-olive hover:bg-olive/15 hover:text-olive"
        onClick={() => {
          setRecommended(false)
          toast("Recommandation retirée")
        }}
      >
        <ThumbsUp className="fill-current" /> Vous recommandez · {total}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <ThumbsUp /> Je recommande · {total}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Recommander {businessName}</DialogTitle>
          <DialogDescription>Votre recommandation sera visible par les membres, avec votre nom.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rec-comment">Un mot sur votre expérience (facultatif)</Label>
          <Textarea id="rec-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={280} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              setRecommended(true)
              setOpen(false)
              toast.success("Merci pour votre recommandation")
            }}
          >
            <ThumbsUp /> Recommander
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
