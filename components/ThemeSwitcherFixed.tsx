"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeSwitcherFixed() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ]

  if (!mounted) {
    return <div className="hidden lg:fixed lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:z-40 lg:flex lg:flex-col lg:gap-6" />
  }

  return (
    <div className="hidden lg:fixed lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:z-40 lg:flex lg:flex-col lg:gap-6">
      {themes.map((t) => {
        const Icon = t.icon
        const isActive = theme === t.value
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 group`}
            title={t.name}
          >
            <div
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-transparent hover:border-primary hover:bg-primary/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className={`text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
              {t.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
