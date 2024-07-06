import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Breadcrumbs from './Breadcrumb';
import { ModeToggle } from '@/userDefinedComponents/ModeToggle';
import useTokenStore from '@/store';
import Navigation from './Navigation';
import DashboardHeader from '@/userDefinedComponents/DashboardHeader';


const DashboardLayout = () => {

  const { token, setToken } = useTokenStore((state) => state);
  if (token === '') {
      return <Navigate to={'/auth/login'} replace />;
  }
  const logout = () => {
      console.log('Logging out!');
      setToken('');
  };

  const signOut = () => {
      logout();
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">eTravel</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        
        <Navigation />
       
      </div>
    </div>



    <div className="flex flex-col">
    <DashboardHeader signoutButtons={signOut}/>

 

    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <Breadcrumbs />

<Outlet></Outlet>

      </main>





  </div>
  </div>
  )
}

export default DashboardLayout