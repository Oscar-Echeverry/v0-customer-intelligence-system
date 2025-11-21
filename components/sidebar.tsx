"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, LayoutDashboard, UserX, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Bot de Leads", href: "/bot", icon: MessageSquare },
  { name: "Dashboard de Leads", href: "/dashboard/leads", icon: LayoutDashboard },
  { name: "Dashboard de Churn", href: "/dashboard/churn", icon: UserX },
  { name: "Insights", href: "/insights", icon: Lightbulb },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-full bg-sidebar border-r border-sidebar-border">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
