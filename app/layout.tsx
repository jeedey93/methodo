import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Méthodo — La plateforme collaborative des profs québécois",
  description: "Partagez vos ressources, planifiez votre semaine, créez votre matériel. Gratuit pour toujours.",
  keywords: ["enseignants", "pédagogie", "planification", "Québec", "primaire", "ressources partagées"],
  icons: { icon: '/logo-icon.jpeg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
