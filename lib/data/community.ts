import { conversations, forumReplies, forumThreads, messages } from "../mock/community"
import type { ForumCategory } from "../types"

export async function getForumThreads(opts: { associationId?: string; category?: ForumCategory; reported?: boolean } = {}) {
  return forumThreads
    .filter((t) => !opts.associationId || t.associationId === opts.associationId)
    .filter((t) => !opts.category || t.category === opts.category)
    .filter((t) => opts.reported === undefined || !!t.reported === opts.reported)
    .map((t) => ({ ...t, repliesCount: forumReplies.filter((r) => r.threadId === t.id).length }))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.lastReplyAt.localeCompare(a.lastReplyAt))
}

export async function getForumThread(id: string) {
  const thread = forumThreads.find((t) => t.id === id)
  if (!thread) return null
  return { thread, replies: forumReplies.filter((r) => r.threadId === id) }
}

export async function getConversations(memberId: string) {
  return conversations
    .filter((c) => c.participantIds.includes(memberId))
    .map((c) => {
      const list = messages.filter((m) => m.conversationId === c.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      return { ...c, messages: list, lastMessage: list.at(-1) }
    })
    .sort((a, b) => (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? ""))
}
