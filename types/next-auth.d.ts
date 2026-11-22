import type { DefaultSession } from "next-auth"

import type { MemberStatus, Role } from "@/lib/types"

declare module "next-auth" {
  interface User {
    role?: Role
    status?: MemberStatus
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: Role
      status: MemberStatus
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: Role
    status?: MemberStatus
  }
}
