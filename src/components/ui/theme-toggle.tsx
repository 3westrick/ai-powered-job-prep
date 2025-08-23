"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const themes = [
    {
        label: "Light",
        value: "light",
        icon: <Sun />,
    },

    {
        label: "Dark",
        value: "dark",
        icon: <Moon />,
    },

    {
        label: "System",
        value: "system",
        icon: <Monitor />,
    },
] as const

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { setTheme, theme, resolvedTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    {resolvedTheme === "dark" ? <Moon /> : <Sun />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themes.map(({ value, label, icon }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => setTheme(value)}
                        className={cn(
                            "flex items-center gap-2",
                            value === theme &&
                                "bg-accent text-accent-foreground"
                        )}
                    >
                        {icon}
                        <span>{label}</span>
                        {value === resolvedTheme && (
                            <span className="ml-auto">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
