import type { Metadata } from "next"
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Menfess c9",
  description: "Menfess khusus c9.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-semibold text-base tracking-tight">
                Menfess c9
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/kirim" className={cn(buttonVariants({ size: "sm" }))}>
                  + Kirim Pesan
                </Link>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-border/40 mt-16">
            <div className="max-w-2xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground/50">
              Pesan akan otomatis hilang setelah 7 hari
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
