"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, MessageSquare, Settings, LogOut, User, Image } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, signOut } = useSupabase()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <h1 className="text-xl font-bold">交通事故慰謝料Bot</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="h-5 w-5" />
                    <span>ダッシュボード</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => router.push("/dashboard/account")}>
                    <User className="h-5 w-5" />
                    <span>LINEアカウント設定</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => router.push("/dashboard/messages")}>
                    <MessageSquare className="h-5 w-5" />
                    <span>メッセージ設定</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => router.push("/dashboard/images")}>
                    <Image className="h-5 w-5" />
                    <span>画像ギャラリー</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="h-5 w-5" />
                    <span>システム設定</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="ml-2 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="rounded-full p-2 hover:bg-muted">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">ログアウト</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

