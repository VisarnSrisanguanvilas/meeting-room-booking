"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"

import {
  Home,
  Calendar,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react"

/* shadcn */
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { getPayloadFromToken } from "@/lib/jwt"
import type { TokenPayload } from "@/app/types/types"

const items = [
  { title: "Dashboard", url: "/user", icon: Home },
  { title: "Calendar", url: "/user/calendar", icon: Calendar },
  { title: "Payment", url: "/user/payment", icon: Wallet },
]

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<TokenPayload | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const payload = getPayloadFromToken()
      if (payload) {
        setUser(payload)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const initial = useMemo(() => {
    return user?.email?.[0]?.toUpperCase() ?? "?"
  }, [user])

  const logout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
        
        <Sidebar
          className={`
            shrink-0 bg-white shadow-md
            transition-all duration-300 ease-in-out
            ${collapsed ? "w-16" : "w-64"}
          `}
        >
          <SidebarHeader className="h-14 flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed((p) => !p)}
              className="rounded-xl"
            >
              {collapsed ? <PanelLeft /> : <PanelLeftClose />}
            </Button>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                const active = pathname === item.url

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={collapsed ? item.title : undefined}
                      className={`
                        h-11 rounded-xl transition-all
                        hover:bg-slate-100
                        ${active && "bg-slate-200 font-medium"}
                      `}
                    >
                      <Link
                        href={item.url}
                        className={`
                          flex items-center
                          ${collapsed ? "justify-center" : "gap-3 px-3"}
                        `}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    w-full rounded-xl
                    ${collapsed ? "justify-center px-0" : "justify-start gap-3"}
                  `}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>

                  {!collapsed && (
                    <div className="text-left text-sm">
                      <p className="font-medium truncate">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="gap-2">
                  <Settings size={14} />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logout}
                  className="gap-2 text-red-500 cursor-pointer"
                >
                  <LogOut size={14} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 w-full overflow-auto p-6">
          <div className="w-full min-h-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}