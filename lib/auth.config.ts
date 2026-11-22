import type { NextAuthConfig } from "next-auth"

import type { MemberStatus, Role } from "@/lib/types"

export const authConfig = {
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isEspace = pathname.startsWith("/espace") || pathname.startsWith("/admin")
      if (isEspace) return !!auth
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role as Role
        token.status = user.status as MemberStatus
      }
      if (trigger === "update" && token.id) {
        // refresh handled in full auth.ts when available
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as Role) ?? "MEMBER"
        session.user.status = (token.status as MemberStatus) ?? "PENDING"
      }
      return session
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig
