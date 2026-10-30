import type { Metadata } from "next"
import { Cinzel, Work_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RoleProvider } from "@/lib/role-context"
import "./globals.css"

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://communaute.bapa-officiel.com"),
  title: {
    default: "Communauté Bapa · Royaume Bapa",
    template: "%s · Communauté Bapa",
  },
  description:
    "L'espace des filles et fils du Royaume Bapa : associations, projets du village, événements et entraide, au Cameroun et dans la diaspora.",
  icons: { icon: "/images/logo-bapa.png" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${workSans.variable}`}>
      <body>
        <RoleProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </RoleProvider>
        <Toaster position="top-center" theme="light" />
      </body>
    </html>
  )
}
