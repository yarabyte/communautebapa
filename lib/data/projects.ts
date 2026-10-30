import { contributions, projects } from "../mock/projects"
import type { ContributionStatus, PaymentMethod } from "../types"

export async function getProjects() {
  const order = { EN_COURS: 0, A_VENIR: 1, TERMINE: 2 }
  return [...projects].sort((a, b) => order[a.status] - order[b.status])
}

export async function getProject(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null
}

export function projectById(id: string) {
  return projects.find((p) => p.id === id)
}

export async function getContributions(opts: { memberId?: string; projectId?: string; status?: ContributionStatus; method?: PaymentMethod } = {}) {
  return contributions
    .filter((c) => !opts.memberId || c.memberId === opts.memberId)
    .filter((c) => !opts.projectId || c.projectId === opts.projectId)
    .filter((c) => !opts.status || c.status === opts.status)
    .filter((c) => !opts.method || c.method === opts.method)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getContributionStats() {
  const done = contributions.filter((c) => c.status === "COMPLETED")
  const totalXaf = done.reduce((s, c) => s + c.amountXaf, 0)
  const byMethod = Object.entries(
    done.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.method]: (acc[c.method] ?? 0) + c.amountXaf }), {})
  ).map(([method, amountXaf]) => ({ method: method as PaymentMethod, amountXaf }))

  const months = ["mai", "juin", "juil.", "août", "sept.", "oct."]
  const byMonth = months.map((label, i) => {
    const month = 4 + i
    const amountXaf = done
      .filter((c) => new Date(c.createdAt).getUTCMonth() === month)
      .reduce((s, c) => s + c.amountXaf, 0)
    return { label, amountXaf }
  })

  return {
    totalXaf,
    count: done.length,
    pending: contributions.filter((c) => c.status === "PENDING").length,
    contributors: new Set(done.map((c) => c.memberId)).size,
    byMethod,
    byMonth,
  }
}
