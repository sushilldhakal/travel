"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SidebarNavItemProps {
  item: {
    id: string
    title: string
    url?: string
    icon: React.ComponentType<{ className?: string }>
    children?: Array<{
      id: string
      title: string
      url?: string
      icon?: React.ComponentType<{ className?: string }>
    }>
  }
  isCollapsed: boolean
  badge?: number
  // level param removed as it's not being used
  isActive?: boolean
}

export function SidebarNavItem({ item, isCollapsed, badge }: SidebarNavItemProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(() => {
    // Check if this item or any children are active
    const isItemActive = item.url && location.pathname.startsWith(item.url)
    const isChildActive = item.children?.some(child => child.url && location.pathname.startsWith(child.url))
    return isItemActive || isChildActive
  })

  const hasChildren = item.children && item.children.length > 0
  const ItemIcon = item.icon

  // Check if this item or any of its children are active
  const isItemActive = item.url && location.pathname.startsWith(item.url)
  const isChildActive = hasChildren && item.children?.some(child => child.url && location.pathname.startsWith(child.url))
  const isActive = isItemActive || isChildActive

  // If a child becomes active, open the parent
  useEffect(() => {
    if (isChildActive && !isOpen) {
      setIsOpen(true)
    }
  }, [isChildActive, isOpen])

  if (hasChildren) {
    if (isCollapsed) {
      // Collapsed: show popover on icon click
      return (
        <SidebarMenuItem className="hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300">
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton isActive={isActive} tooltip={item.title} className="bg-blue-100/50 hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300 dark:bg-slate-800">
                <ItemIcon className="h-4 w-4 mr-2 shrink-0" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="min-w-[180px] p-1">
              <div className="flex flex-col">
                {item.children?.map((child) => {
                  const ChildIcon = child.icon || ItemIcon;
                  const allToursUrl = item.children?.[0]?.url; // First child's URL
                  const isActive = !!(child.url && (
                    location.pathname === child.url ||
                    (child.url !== allToursUrl && location.pathname.startsWith(child.url + "/"))
                  ));
                  return (
                    <SidebarMenuSubButton
                      asChild
                      key={child.id}
                      isActive={isActive}
                      className="hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300"
                    >
                      <Link to={child.url || "#"} className="flex items-center gap-2 px-2 py-1 rounded bg-blue-100/30 hover:bg-emerald-500/10 dark:bg-slate-800/50">
                        <ChildIcon className="h-4 w-4 mr-2 shrink-0" />

                        <span className="whitespace-nowrap">{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem >
      );
    } else {
      // Expanded: keep accordion/collapsible
      return (
        <SidebarMenuItem>
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={undefined}
                aria-expanded={isOpen}
                aria-controls={`submenu-${item.id}`}
                className="hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300"
              >
                <ItemIcon className="h-4 w-4 mr-2 shrink-0" />
                <span className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                )}>
                  {item.title}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 ml-auto shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent id={`submenu-${item.id}`}>
              <SidebarMenuSub>
                {item.children?.map((child) => {
                  const ChildIcon = child.icon || ItemIcon;
                  const isActive = !!(child.url && (
                    location.pathname === child.url ||
                    (child.url !== item.children?.[0]?.url && location.pathname.startsWith(child.url + "/"))
                  ));
                  return (
                    <SidebarMenuSubItem key={child.id}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive}
                        className="bg-blue-100/30 hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300 dark:bg-slate-800/50"
                      >
                        <Link to={child.url || "#"}>
                          <ChildIcon className="h-3.5 w-3.5 mr-2 shrink-0" />
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      );
    }
  }

  return (
    <SidebarMenuItem className="hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300">
      <SidebarMenuButton
        asChild
        className="w-full bg-blue-100/50 hover:bg-emerald-500/10 hover:text-emerald-400 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300 dark:bg-slate-800"
        isActive={!!isActive}
        tooltip={isCollapsed ? item.title : undefined}
      >
        <Link to={item.url || "#"}>
          <ItemIcon className="h-4 w-4 mr-2 shrink-0" />
          <span className={cn(
            "transition-all duration-300",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
          )}>
            {item.title}
          </span>
          {badge !== undefined && badge > 0 ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
