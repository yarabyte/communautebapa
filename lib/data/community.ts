import { conversations, messages } from "../mock/community"

export async function getConversations(memberId: string) {
  return conversations
    .filter((c) => c.participantIds.includes(memberId))
    .map((c) => {
      const list = messages.filter((m) => m.conversationId === c.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      return { ...c, messages: list, lastMessage: list.at(-1) }
    })
    .sort((a, b) => (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? ""))
}
