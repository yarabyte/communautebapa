import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"

import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/db"
import { notifyRegistrationReceived } from "@/lib/notifications"
import { verifyPassword } from "@/lib/password"
import type { Role } from "@/lib/types"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const oauthProviderMap = {
  google: "GOOGLE",
  apple: "APPLE",
} as const

function splitDisplayName(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || "Membre",
    lastName: parts.slice(1).join(" ") || "Bapa",
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ allowDangerousEmailAccountLinking: true })]
      : []),
    // Services ID uniquement (ex. com.bapa-officiel.communaute), pas l'App ID …communaute1
    ...(process.env.AUTH_APPLE_ID &&
    process.env.AUTH_APPLE_SECRET?.startsWith("eyJ") &&
    !process.env.AUTH_APPLE_ID.endsWith("1")
      ? [Apple({ allowDangerousEmailAccountLinking: true })]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const email = parsed.data.email.toLowerCase().trim()
        const user = await prisma.user.findUnique({
          where: { email },
          include: { profile: true },
        })
        if (!user?.passwordHash) return null

        const valid = await verifyPassword(parsed.data.password, user.passwordHash)
        if (!valid) return null

        if (user.status === "REJECTED" || user.status === "SUSPENDED") {
          return null
        }

        const name = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : email
        return {
          id: user.id,
          email: user.email,
          name,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user?.id || account?.provider === "credentials") return true

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
      if (!dbUser) return true
      if (dbUser.status === "REJECTED") return "/connexion?error=AccountRejected"
      if (dbUser.status === "SUSPENDED") return "/connexion?error=AccountSuspended"
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id
        const fresh = await prisma.user.findUnique({ where: { id: user.id } })
        if (fresh) {
          token.role = fresh.role
          token.status = fresh.status
        } else if (user.role && user.status) {
          token.role = user.role
          token.status = user.status
        }
      }

      if ((trigger === "update" || !token.role) && token.id) {
        const fresh = await prisma.user.findUnique({ where: { id: token.id as string } })
        if (fresh) {
          token.role = fresh.role
          token.status = fresh.status
        }
      }
      return token
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return
      const { firstName, lastName } = splitDisplayName(user.name)
      await prisma.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          avatarUrl: user.image ?? undefined,
        },
      })
      await notifyRegistrationReceived({
        firstName,
        lastName,
        email: user.email,
      })
    },
    async linkAccount({ user, account }) {
      if (!user.id) return
      const provider = oauthProviderMap[account.provider as keyof typeof oauthProviderMap]
      if (!provider) return

      const accountCount = await prisma.account.count({ where: { userId: user.id } })
      if (accountCount > 1) return

      await prisma.user.update({
        where: { id: user.id },
        data: { provider },
      })
    },
  },
})

export async function requireSession() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

export async function requireRole(...roles: Role[]) {
  const session = await requireSession()
  if (!session) return null
  if (!roles.includes(session.user.role)) return null
  return session
}
