"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Productos</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isDashboardRoot = item.url === "/dashboard"
          const isActive = isDashboardRoot
            ? pathname === "/dashboard"
            : pathname === item.url || pathname.startsWith(`${item.url}/`)

          return (
            <SidebarMenuItem className="mt-2" key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link href={item.url} className="cursor-pointer">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
