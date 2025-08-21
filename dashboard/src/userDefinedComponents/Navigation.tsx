"use client"

import React, { useMemo } from "react"
import { menuItems } from "@/lib/MenuItems"
import useTokenStore from "@/store/store"
import { jwtDecode } from "jwt-decode"
import { useQuery } from "@tanstack/react-query"
import { getUnapprovedCommentsCount } from "@/http"
import { SidebarNavItem } from "./MenuItem"
import {
  SidebarContent,
  SidebarMenu,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

interface NavigationProps {
  navCollapse: boolean
  setNavCollapse: React.Dispatch<React.SetStateAction<boolean>>
}

interface MenuItem {
  id: string
  title: string
  href?: string
  children?: MenuItem[]
  icon: React.ComponentType<{ className?: string }>
  url?: string
  type?: string
}

// Move this outside the component to prevent recreation on each render
const filterMenuItems = (items: MenuItem[], roles: string) => {
  return items
    .map((item) => {
      // Create a new object to avoid mutating the original
      const newItem = { ...item }

      if (item.children) {
        newItem.children = filterMenuItems(item.children, roles)
      }

      // Role-based filtering
      if (roles !== "admin" && item.id === "createuser") {
        return null
      }

      if (roles !== "admin" && item.id === "subscribers") {
        return null
      }

      if (roles !== "admin" && item.id === "userlist") {
        return { ...newItem, title: "User Details" }
      }

      return newItem
    })
    .filter(Boolean) as MenuItem[]
}

const Navigation = React.memo(({ navCollapse }: NavigationProps) => {
  const { token } = useTokenStore((state) => state)

  // Use a more descriptive name and add error handling
  const { data: commentCounts } = useQuery({
    queryKey: ["commentsUnapproved"],
    queryFn: getUnapprovedCommentsCount,
    staleTime: 10000,
    retry: 2,
    refetchOnWindowFocus: true,
  })

  // Use useMemo to prevent re-decoding the token on every render
  const userRoles = useMemo(() => {
    if (!token) return ""
    try {
      const user = jwtDecode(token) as { roles?: string }
      return user?.roles || ""
    } catch (error) {
      console.error("Error decoding token:", error)
      return ""
    }
  }, [token])

  // Memoize the filtered menu items to prevent unnecessary recalculations
  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(menuItems.items, userRoles)
  }, [userRoles])

  // Group items by their top-level categories
  const menuGroups = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {}

    filteredMenuItems.forEach((item) => {
      const category = item.type || "default"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
    })

    return groups
  }, [filteredMenuItems])

  return (
    <>
      <SidebarContent>
        {/* Render menu groups */}
        {Object.entries(menuGroups).map(([category, items]) => (
          <SidebarGroup key={category}>
            {category !== "default" && !navCollapse && <SidebarGroupLabel>{category}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarNavItem
                    key={item.id}
                    item={item}
                    isCollapsed={navCollapse}
                    badge={item.id === "comments" ? commentCounts?.data?.unapprovedCount : undefined}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        {/* Version information or other footer content */}
        {!navCollapse && <div className="px-4 py-2 text-xs text-muted-foreground">Version 1.0</div>}
      </SidebarFooter>
    </>
  )
})

Navigation.displayName = "Navigation"

export default Navigation
