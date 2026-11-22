import { documents } from "../mock/community"
import { events, posts } from "../mock/content"

const NOW = new Date("2026-10-30T10:00:00")

export async function getEvents(opts: { publicOnly?: boolean; associationId?: string; upcoming?: boolean } = {}) {
  return events
    .filter((e) => !opts.publicOnly || e.isPublic)
    .filter((e) => !opts.associationId || e.associationId === opts.associationId)
    .filter((e) => opts.upcoming === undefined || (new Date(e.startsAt) >= NOW) === opts.upcoming)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export async function getEvent(slug: string) {
  return events.find((e) => e.slug === slug) ?? null
}

export function isPast(iso: string) {
  return new Date(iso) < NOW
}

export async function getPosts(opts: { associationId?: string; limit?: number } = {}) {
  const list = posts
    .filter((p) => !opts.associationId || p.associationId === opts.associationId)
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.publishedAt.localeCompare(a.publishedAt))
  return opts.limit ? list.slice(0, opts.limit) : list
}

export async function getPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null
}

export async function getDocuments(opts: { associationId?: string; associationIds?: string[] } = {}) {
  return documents
    .filter((d) => !!d.associationId)
    .filter((d) => !opts.associationId || d.associationId === opts.associationId)
    .filter((d) => !opts.associationIds || opts.associationIds.includes(d.associationId!))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}
