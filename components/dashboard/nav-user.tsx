"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  Home,
  LogOut,
} from "lucide-react"
import { useTransition } from "react"
import Link from "next/link"
import { logoutAction } from "@/app/actions/auth"
import { useCurrentProfile } from "@/hooks/use-current-profile"
import { dashboardRoutes } from "@/lib/dashboard-routes"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    id: string
    name: string
    email: string
    avatar: string
    role: string
  }
}) {
  const { isMobile } = useSidebar()
  const [, startTransition] = useTransition()

  const { data: profile } = useCurrentProfile()
  const router = useRouter()

  const profileData = {
    id: profile?.id ?? user.id,
    full_name: profile?.full_name ?? user.name,
    avatar_url: profile?.avatar_url ?? user.avatar,
    role: profile?.role ?? user.role,
  }

  function handleGoToHome() {
    router.push("/")
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={profileData.avatar_url ?? user.avatar} alt={profileData.full_name ?? user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profileData.full_name ?? user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={profileData.avatar_url ?? user.avatar} alt={profileData.full_name ?? user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{profileData.full_name ?? user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={dashboardRoutes.perfiles.editar(profileData.id)}>
                    <BadgeCheck />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleGoToHome}
                >
                  <Home />
                  Ir a la página
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  startTransition(async () => {
                    await logoutAction();
                    window.location.href = "/";
                  })
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
