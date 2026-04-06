"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
