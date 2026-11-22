import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/espace/app-sidebar"
import { PendingGate } from "@/components/espace/pending-gate"
import { SessionRoleProvider } from "@/components/providers/session-role-provider"
import { Topbar } from "@/components/espace/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getBusinessStats } from "@/lib/data/businesses"
import { getCurrentMember, getPendingRegistrations } from "@/lib/data/members"

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  let member
  try {
    member = await getCurrentMember()
  } catch {
    redirect("/connexion")
  }
  const [pending, businessStats] = await Promise.all([getPendingRegistrations(), getBusinessStats()])
  const isPending = member.status === "PENDING"

  return (
    <SessionRoleProvider role={member.role}>
      <SidebarProvider>
        <AppSidebar
          member={member}
          pendingAccount={isPending}
          badges={{ pending: pending.length, messages: isPending ? 0 : 3, businesses: businessStats.pending }}
        />
        <SidebarInset className="min-w-0 bg-background">
          <Topbar pendingAccount={isPending} realRole={member.role} />
          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PendingGate pending={isPending}>{children}</PendingGate>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionRoleProvider>
  )
}
