"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileCode2, FolderKanban, Download, Settings, Moon, Sun } from "lucide-react"
import Link from "next/link"

export function SidebarNav() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navItems = [
    { icon: FolderKanban, label: "Projects", href: "/editor" },
    { icon: FileCode2, label: "Templates", href: "/templates" },
    { icon: Download, label: "Exports", href: "/exports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
      <Link href="/" className="mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <FileCode2 className="w-5 h-5 text-accent" />
        </div>
      </Link>

      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            asChild
          >
            <Link href={item.href} aria-label={item.label}>
              <item.icon className="w-5 h-5" />
            </Link>
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </aside>
  )
}
