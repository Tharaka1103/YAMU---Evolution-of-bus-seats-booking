"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function MobileThemeSwitcher() {
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
    return null
  }

  const currentTheme = themes.find((t) => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Sun
  const CurrentName = currentTheme?.name || "Light"


  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="lg:hidden backdrop-blur-sm border border-border fixed flex flex-row items-center justify-center bottom-3 left-3 z-40 p-3 rounded-full  transition-all duration-300"
          aria-label="Toggle theme"
        >
          <CurrentIcon className="w-5 h-5 text-primary mr-2" />
          <p>{CurrentName}</p>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-fit p-3 bg-transparent rounded-sm backdrop-blur-sm">
        <div className="flex flex-col gap-2 ">
          {themes.map((t) => {
            const Icon = t.icon
            const isActive = theme === t.value
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-300 text-sm font-medium ${
                  isActive
                    ? " bg-primary text-background"
                    : " bg-transparent text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.name}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
