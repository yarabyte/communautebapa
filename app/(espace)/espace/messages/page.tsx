import type { Metadata } from "next"

import { ChatApp } from "@/components/espace/chat-app"
import { getConversations } from "@/lib/data/community"
import { getMembers } from "@/lib/data/members"
import { CURRENT_USER_ID } from "@/lib/constants"

export const metadata: Metadata = { title: "Messages" }

const unread: Record<string, number> = { cv1: 1, cv3: 2 }

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const { a } = await searchParams
  const [conversations, members] = await Promise.all([getConversations(CURRENT_USER_ID), getMembers()])
  const directory = Object.fromEntries(
    members.map((m) => [m.id, { id: m.id, firstName: m.firstName, lastName: m.lastName, avatar: m.avatar, city: m.city }])
  )

  return (
    <ChatApp
      currentUserId={CURRENT_USER_ID}
      conversations={conversations.map((c) => ({ ...c, unread: unread[c.id] }))}
      members={directory}
      startWith={a}
    />
  )
}
