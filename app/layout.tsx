import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Méthodo — L'assistant intelligent des profs",
  description: "Planifiez vos cours, créez votre matériel et simplifiez votre quotidien d'enseignant.",
  keywords: ["enseignants", "pédagogie", "planification", "Québec", "primaire", "IA"],
  icons: { icon: '/logo.jpeg' },
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
