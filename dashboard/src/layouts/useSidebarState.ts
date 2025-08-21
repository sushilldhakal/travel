
import { useState, useEffect, useCallback } from "react"

interface UseSidebarStateProps {
  initialState?: boolean
  storageKey?: string
  breakpoint?: number
}

export function useSidebarState({
  initialState = false,
  storageKey = "sidebar-collapsed",
  breakpoint = 1024,
}: UseSidebarStateProps = {}) {
  // Try to get the initial state from localStorage
  const getSavedState = (): boolean => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : initialState
    } catch (error) {
      console.error("Error reading sidebar state from localStorage:", error)
      return initialState
    }
  }

  const [isCollapsed, setIsCollapsed] = useState<boolean>(getSavedState())

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isCollapsed))
    } catch (error) {
      console.error("Error saving sidebar state to localStorage:", error)
    }
  }, [isCollapsed, storageKey])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < breakpoint) {
        setIsCollapsed(true)
      } else if (window.innerWidth >= breakpoint && getSavedState() !== isCollapsed) {
        // Only reset to saved state if we're above the breakpoint and the current state differs
        setIsCollapsed(getSavedState())
      }
    }

    // Set initial state based on window size
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint, isCollapsed])

  // Toggle function with memoization
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  return {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
  }
}
