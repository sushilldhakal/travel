import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Package2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Breadcrumbs from './Breadcrumb';
import useTokenStore from '@/store';
import Navigation from './Navigation';
import DashboardHeader from '@/userDefinedComponents/DashboardHeader';
import GetTitle from '@/userDefinedComponents/GetTitle';
import { routePaths } from '@/router';
import { BreadcrumbsProvider } from '@/Provider/BreadcrumbsProvider';
const DashboardLayout = () => {
  const { token, setToken } = useTokenStore((state) => state);
  const navigate = useNavigate();
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem("token-store");
    navigate('/');
  };

  if (!token) {
    return <Navigate to="/" state={{ path: location.pathname }} />;
  }



  return (
    <BreadcrumbsProvider>
      <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex flex-col h-full gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link to={routePaths.dashboard.home} className="flex items-center gap-2 font-semibold">
                <Package2 className="h-6 w-6" />
                <span>eTravel</span>
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
          <DashboardHeader handleLogout={handleLogout} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 relative">
            <Breadcrumbs />
            <div className="flex items-center">
              <h1 className="text-lg font-semibold md:text-2xl"> <GetTitle /></h1>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </BreadcrumbsProvider>
  );
};
export default DashboardLayout