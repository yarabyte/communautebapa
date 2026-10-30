"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, CheckCheck, MoreVertical, Paperclip, Search, Send, Smile, Users } from "lucide-react"
import { isSameDay, isToday, isYesterday } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate, formatTime, toDate } from "@/lib/format"
import type { Conversation, Member, Message } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MemberAvatar } from "./member-avatar"

type ChatMember = Pick<Member, "id" | "firstName" | "lastName" | "avatar" | "city">
type ChatConversation = Conversation & { messages: Message[]; unread?: number }

type Props = {
  currentUserId: string
  conversations: ChatConversation[]
  members: Record<string, ChatMember>
  startWith?: string
}

function dayLabel(iso: string) {
  const d = toDate(iso)
  if (isToday(d)) return "Aujourd'hui"
  if (isYesterday(d)) return "Hier"
  return formatDate(iso, "EEEE d MMMM")
}

function shortStamp(iso?: string) {
  if (!iso) return ""
  const d = toDate(iso)
  if (isToday(d)) return formatTime(iso)
  if (isYesterday(d)) return "Hier"
  return formatDate(iso, "dd/MM")
}

export function ChatApp({ currentUserId, conversations: initial, members, startWith }: Props) {
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    if (!startWith || startWith === currentUserId || !members[startWith]) return initial
    const exists = initial.some((c) => c.type === "DIRECT" && c.participantIds.includes(startWith))
    if (exists) return initial
    return [{ id: `new-${startWith}`, type: "DIRECT", participantIds: [currentUserId, startWith], messages: [] }, ...initial]
  })
  const [activeId, setActiveId] = useState<string | undefined>(() => {
    if (startWith) {
      const c = conversations.find((c) => c.type === "DIRECT" && c.participantIds.includes(startWith))
      if (c) return c.id
    }
    return undefined
  })
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId)

  const meta = (c: ChatConversation) => {
    if (c.type === "GROUP") return { title: c.name ?? "Groupe", subtitle: `${c.participantIds.length} participants`, other: undefined }
    const other = members[c.participantIds.find((id) => id !== currentUserId) ?? ""]
    return { title: other ? `${other.firstName} ${other.lastName}` : "Membre", subtitle: other?.city ?? "", other }
  }

  const filtered = useMemo(
    () => conversations.filter((c) => meta(c).title.toLowerCase().includes(query.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversations, query]
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [activeId, active?.messages.length])

  const open = (id: string) => {
    setActiveId(id)
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !active) return
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId: active.id,
      authorId: currentUserId,
      content: draft.trim(),
      createdAt: new Date().toISOString(),
    }
    setConversations((list) => list.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, message] } : c)))
    setDraft("")
  }

  return (
    <div className="flex h-[calc(100svh-10rem)] min-h-[520px] overflow-hidden rounded-3xl border border-border bg-card">
      <aside className={cn("flex w-full flex-col border-r border-border md:w-80 lg:w-96", active && "hidden md:flex")}>
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <h2 className="font-heading text-lg text-brun">Discussions</h2>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher" className="bg-background pl-9" />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const m = meta(c)
            const last = c.messages.at(-1)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                    c.id === activeId && "bg-accent"
                  )}
                >
                  {m.other ? (
                    <MemberAvatar member={m.other} className="size-11" />
                  ) : (
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-terre text-creme-light">
                      <Users className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-medium text-brun">{m.title}</p>
                      <span className={cn("shrink-0 text-xs", c.unread ? "text-terre" : "text-muted-foreground")}>{shortStamp(last?.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-muted-foreground">
                        {last
                          ? `${last.authorId === currentUserId ? "Vous" : c.type === "GROUP" ? members[last.authorId]?.firstName : ""}${last.authorId === currentUserId || c.type === "GROUP" ? " : " : ""}${last.content}`
                          : "Nouvelle conversation"}
                      </p>
                      {!!c.unread && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-terre text-[10px] font-medium text-creme-light">{c.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {active ? (
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveId(undefined)} aria-label="Retour">
              <ArrowLeft />
            </Button>
            {meta(active).other ? (
              <MemberAvatar member={meta(active).other!} className="size-10" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full bg-terre text-creme-light">
                <Users className="size-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-brun">{meta(active).title}</p>
              <p className="truncate text-xs text-muted-foreground">{meta(active).subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Options">
              <MoreVertical />
            </Button>
          </header>

          <div className="bapa-motif-light relative flex-1 overflow-y-auto bg-secondary/40 px-4 py-5 sm:px-8">
            <div className="flex flex-col gap-1.5">
              {active.messages.length === 0 && (
                <p className="mx-auto mt-10 rounded-xl bg-card px-4 py-2 text-center text-sm text-muted-foreground shadow-sm">
                  Démarrez la conversation avec {meta(active).title}.
                </p>
              )}
              {active.messages.map((msg, i) => {
                const mine = msg.authorId === currentUserId
                const prev = active.messages[i - 1]
                const newDay = !prev || !isSameDay(toDate(prev.createdAt), toDate(msg.createdAt))
                const showAuthor = active.type === "GROUP" && !mine && (newDay || prev?.authorId !== msg.authorId)
                return (
                  <div key={msg.id} className="flex flex-col">
                    {newDay && (
                      <span className="mx-auto my-3 rounded-lg bg-card px-3 py-1 text-xs text-muted-foreground capitalize shadow-sm">{dayLabel(msg.createdAt)}</span>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[65%]",
                        mine ? "self-end rounded-br-sm bg-terre text-creme-light" : "self-start rounded-bl-sm bg-card text-brun"
                      )}
                    >
                      {showAuthor && <p className="mb-0.5 text-xs font-medium text-or-dark">{members[msg.authorId]?.firstName}</p>}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10px]", mine ? "text-creme/70" : "text-muted-foreground")}>
                        {formatTime(msg.createdAt)}
                        {mine && <CheckCheck className="size-3" />}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
            <Button type="button" variant="ghost" size="icon" aria-label="Émoji">
              <Smile />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Joindre un fichier">
              <Paperclip />
            </Button>
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrire un message" className="h-11 flex-1 rounded-full bg-background px-4" />
            <Button type="submit" size="icon" className="size-11 rounded-full" disabled={!draft.trim()} aria-label="Envoyer">
              <Send />
            </Button>
          </form>
        </section>
      ) : (
        <section className="bapa-motif-light hidden flex-1 flex-col items-center justify-center gap-3 bg-secondary/40 p-8 text-center md:flex">
          <span className="flex size-16 items-center justify-center rounded-full bg-terre/10 text-terre">
            <Send className="size-7" />
          </span>
          <h2 className="font-heading text-xl text-brun">Messagerie de la communauté</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Sélectionnez une discussion ou écrivez à un membre depuis l&apos;annuaire.
          </p>
        </section>
      )}
    </div>
  )
}
