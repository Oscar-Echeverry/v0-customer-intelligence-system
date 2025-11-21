import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// Metadata optimizada para Quindío AI
export const metadata: Metadata = {
  title: "Quindío AI – Inteligencia de Clientes",
  description: "Customer Intelligence System for digital marketing agencies",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`
          ${geist.variable}
          ${geistMono.variable}
          font-sans
          antialiased
          min-h-screen
          bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900
          text-slate-100
        `}
      >
        {/* Wrapper for content */}
        <main className="min-h-screen w-full">
          {children}
        </main>

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
