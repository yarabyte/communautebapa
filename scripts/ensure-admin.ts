/**
 * Crée / met à jour le SUPER_ADMIN de secours si absent.
 * Usage : npx tsx scripts/ensure-admin.ts
 * (aussi appelé depuis docker-start.sh)
 */
import { hash } from "bcryptjs"
import { PrismaClient, Role, MemberStatus, AuthProvider, Gender, BapaLink } from "@prisma/client"

const prisma = new PrismaClient()

const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@bapa-officiel.com"
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "AdminBapa2026!"

async function main() {
  const passwordHash = await hash(PASSWORD, 12)
  const existing = await prisma.user.findUnique({ where: { email: EMAIL }, include: { profile: true } })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: Role.SUPER_ADMIN,
        status: MemberStatus.ACTIVE,
        emailVerified: existing.emailVerified ?? new Date(),
      },
    })
    console.log(`Admin mis à jour : ${EMAIL}`)
    return
  }

  await prisma.user.create({
    data: {
      email: EMAIL,
      phone: "+237600000001",
      passwordHash,
      emailVerified: new Date(),
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
      provider: AuthProvider.EMAIL,
      profile: {
        create: {
          firstName: "Arnaud",
          lastName: "Kamga",
          gender: Gender.HOMME,
          family: "Famille Kamga Tchoua",
          link: BapaLink.NAISSANCE,
          country: "Cameroun",
          city: "Yaoundé",
          profession: "Administrateur",
          showInDirectory: true,
          onboardedAt: new Date(),
        },
      },
    },
  })
  console.log(`Admin créé : ${EMAIL}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
