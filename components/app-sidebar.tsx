"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Settings } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { title: "Leads", url: "/dashboard", icon: Users, disabled: false },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, disabled: false },
]

const PLACEHOLDER_USER = {
  name: "Admin",
  email: "admin@tryalma.ai",
  avatar: "",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ─ Logo / Brand ─ */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!px-2 py-4 h-auto"
            >
              <Link href="/dashboard">
                <Image
                  src="/logo.png" alt="Alma logo" width={100} height={0}
                  sizes="100px" className="w-[100px] h-auto object-contain"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ─ Navigation ─ */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    {item.disabled ? (
                      <SidebarMenuButton
                        isActive={false}
                        tooltip={item.title}
                        disabled
                        className="opacity-50 cursor-not-allowed gap-3"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="gap-3"
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ─ User profile ─ */}
      <SidebarFooter>
        <NavUser user={PLACEHOLDER_USER} />
      </SidebarFooter>
    </Sidebar>
  )
}

