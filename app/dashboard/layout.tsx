import type { ReactNode } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (data) {
      profile = {
        id: data.id,
        full_name: data.full_name ?? null,
        avatar_url: data.avatar_url ?? null,
        role: data.role ?? "user",
        email: data.email ?? user.email ?? null,
      }
    } else {
      profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role: "user",
        email: user.email ?? null,
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Dashboard Crea Caps
            </p>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
