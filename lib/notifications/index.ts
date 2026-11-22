import {
  accountRejectedEmail,
  accountValidatedEmail,
  registrationReceivedEmail,
  sendEmail,
  tempPasswordEmail,
} from "./email"
import {
  notifyRegistrationWhatsApp,
  notifyRejectedWhatsApp,
  notifyTempPasswordWhatsApp,
  notifyValidatedWhatsApp,
} from "./whatsapp"

type Person = { firstName: string; lastName: string; email?: string | null; phone?: string | null }

function fullName(p: Person) {
  return `${p.firstName} ${p.lastName}`.trim()
}

export async function notifyRegistrationReceived(person: Person) {
  const name = fullName(person)
  const jobs: Promise<unknown>[] = []
  if (person.email) {
    const mail = registrationReceivedEmail(name)
    jobs.push(sendEmail({ to: person.email, ...mail }))
  }
  if (person.phone) {
    jobs.push(notifyRegistrationWhatsApp(person.phone, name))
  }
  await Promise.allSettled(jobs)
}

export async function notifyAccountValidated(person: Person) {
  const name = fullName(person)
  const jobs: Promise<unknown>[] = []
  if (person.email) {
    const mail = accountValidatedEmail(name)
    jobs.push(sendEmail({ to: person.email, ...mail }))
  }
  if (person.phone) {
    jobs.push(notifyValidatedWhatsApp(person.phone, name))
  }
  await Promise.allSettled(jobs)
}

export async function notifyAccountRejected(person: Person, comment?: string | null) {
  const name = fullName(person)
  const jobs: Promise<unknown>[] = []
  if (person.email) {
    const mail = accountRejectedEmail(name, comment)
    jobs.push(sendEmail({ to: person.email, ...mail }))
  }
  if (person.phone) {
    jobs.push(notifyRejectedWhatsApp(person.phone, name))
  }
  await Promise.allSettled(jobs)
}

export async function notifyTempPassword(person: Person & { email: string }, password: string) {
  const name = fullName(person)
  const jobs: Promise<unknown>[] = [
    sendEmail({ to: person.email, ...tempPasswordEmail(name, person.email, password) }),
  ]
  if (person.phone) {
    jobs.push(notifyTempPasswordWhatsApp(person.phone, name, password))
  }
  await Promise.allSettled(jobs)
}
