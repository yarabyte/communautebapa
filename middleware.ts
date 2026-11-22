import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

const AUTH_PAGES = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/lien-magique", "/verification", "/en-attente"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isEspace = pathname.startsWith("/espace") || pathname.startsWith("/admin")

  if (isEspace && !session) {
    const url = req.nextUrl.clone()
    url.pathname = "/connexion"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (session && isAuthPage && pathname !== "/en-attente") {
    const url = req.nextUrl.clone()
    url.pathname = "/espace"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/admin") && session && session.user.role === "MEMBER") {
    const url = req.nextUrl.clone()
    url.pathname = "/espace"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*", "/connexion", "/inscription", "/mot-de-passe-oublie", "/lien-magique", "/verification", "/en-attente"],
}
