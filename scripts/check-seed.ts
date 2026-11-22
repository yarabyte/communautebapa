import { prisma } from "../lib/db"
import { verifyPassword } from "../lib/password"

async function main() {
  const u = await prisma.user.findUnique({
    where: { email: "admin@bapa-officiel.com" },
    include: { profile: true },
  })
  console.log("admin", u?.email, u?.role, u?.status, u?.profile?.firstName)
  console.log("pwd", u?.passwordHash ? await verifyPassword("AdminBapa2026!", u.passwordHash) : false)
  console.log("associations", await prisma.association.count(), "quartiers", await prisma.quartier.count())
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
