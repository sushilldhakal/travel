import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Navigation from "@/userDefinedComponents/Navigation"
import {
  Menu,
  PanelLeft,
  Search,
} from "lucide-react"
import { ModeToggle } from "./ModeToggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./Avatar";
import { getUserId } from "@/util/authUtils";

interface DashboardHeaderProps {
  handleLogout: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const DashboardHeader = ({ handleLogout, isCollapsed, setIsCollapsed }: DashboardHeaderProps) => {

  const handleClick = () => {
    handleLogout();
  }
  return (
    <header className={cn(
      "flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 from-slate-900 via-slate-800 to-slate-900",
      "border-blue-200 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 dark:border-slate-700/50 dark:bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900",
    )}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SheetTitle>Navigation Menu</SheetTitle>
          <Navigation navCollapse={false} setNavCollapse={() => { }} />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 flex items-center gap-3">
        {/* Sidebar Toggle Button - Always visible in main content */}
        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-300 group",
              "bg-blue-100 hover:bg-blue-200 border border-blue-200 shadow-sm",
              "flex items-center justify-center",
              "hover:shadow-md hover:border-blue-300",
              "dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600",
              "dark:hover:border-slate-500"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white transition-colors" />
          </button>
        )}

        <form className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-blue-50 border border-blue-200 pl-8 shadow-none md:w-2/3 lg:w-1/3 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
        </form>
      </div>
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full p-0 h-10 w-10">
            <UserAvatar
              userId={getUserId() || ''}
              size="sm"
              alt="User menu"
              className="h-10 w-10"
            />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSeparator />
          <DropdownMenuItem><Link to="/"> Home Page </Link></DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleClick()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default DashboardHeader