"use client"

import {
  Boxes,
  ClipboardList,
  Palette,
  LayoutDashboard,
  Package,
  Percent,
  UserCircle2,
} from "lucide-react"
import type { ComponentProps } from "react"
import type { Profile } from "@/types"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  teams: [
    {
      name: "Crea Caps",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Productos",
      url: "/dashboard/productos",
      icon: Package,
    },
    {
      title: "Categorias",
      url: "/dashboard/categorias",
      icon: Boxes,
    },
    {
      title: "Estilos",
      url: "/dashboard/estilos",
      icon: Palette,
    },
    {
      title: "Descuentos",
      url: "/dashboard/descuentos",
      icon: Percent,
    },
    {
      title: "Ordenes",
      url: "/dashboard/ordenes",
      icon: ClipboardList,
    },
    {
      title: "Perfiles",
      url: "/dashboard/perfiles",
      icon: UserCircle2,
    },
  ],
}

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  profile: Profile | null
}

export function AppSidebar({ profile, ...props }: AppSidebarProps) {
  const fallbackName = profile?.full_name?.trim() || "Administrador"
  const fallbackEmail = profile?.email?.trim() || "Sin correo"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            id: profile?.id ?? "",
            name: fallbackName,
            email: fallbackEmail,
            avatar: profile?.avatar_url ?? "",
            role: profile?.role ?? "user",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
