import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Package2 } from "lucide-react";
import Breadcrumbs from '@/userDefinedComponents/Breadcrumb';
import useTokenStore from '@/store/store';
import Navigation from '@/userDefinedComponents/Navigation';
import DashboardHeader from '@/userDefinedComponents/DashboardHeader';
import GetTitle from '@/userDefinedComponents/GetTitle';
import routePaths from '@/lib/routePath';
import { BreadcrumbsProvider } from '@/Provider/BreadcrumbsProvider';
import { startTransition, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const { token, setToken } = useTokenStore((state) => state);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ... your useEffect for resizing and localStorage here ...

  const handleLogout = () => {
    startTransition(() => {
      localStorage.removeItem("token");
      setToken('');
      navigate("/login");
    });
  };

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <BreadcrumbsProvider>
      <SidebarProvider defaultOpen={!isCollapsed} open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <div className="flex min-h-screen w-full">
          {/* Modern Sidebar */}
          <div className={cn(
            "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex flex-col transition-all duration-300 overflow-hidden",
            "bg-linear-to-b from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
            "border-r border-blue-200 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl",
            isCollapsed ? "w-[70px]" : "w-[280px]"
          )} style={{ height: '100vh' }}>

            {/* Enhanced Header/Branding */}
            <div className={cn(
              "flex items-center border-b border-slate-700/50",
              "bg-linear-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xs",
              isCollapsed ? "h-[70px] justify-center p-2" : "h-[80px] justify-between p-4"
            )}>
              {/* Logo/Brand Section */}
              <Link
                to={routePaths.dashboard.home}
                className={cn(
                  "flex items-center gap-3 group transition-all duration-300 hover:scale-105",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                aria-label="Dashboard Home"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-linear-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Package2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className={cn(
                  "transition-all duration-300 overflow-hidden",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    eTravel
                  </span>
                  <div className="text-xs text-slate-400 font-medium tracking-wide">
                    Dashboard
                  </div>
                </div>
              </Link>

            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              <Navigation navCollapse={isCollapsed} setNavCollapse={setIsCollapsed} />
            </div>

            {/* Footer/Bottom Section */}
            <div className={cn(
              "p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-xs",
              isCollapsed ? "px-2" : "px-4"
            )}>
              <div className={cn(
                "flex items-center gap-3 text-xs text-slate-400",
                isCollapsed ? "justify-center" : "justify-start"
              )}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                )}>
                  System Online
                </span>
              </div>
            </div>
          </div>
          {/* Main Content */}

          <div
            className={cn(
              "flex flex-1 flex-col transition-all duration-300",
              !isCollapsed ? "md:ml-[280px]" : "md:ml-[70px]"
            )}
          >
            <div className="min-h-screen bg-linear-to-b from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <DashboardHeader
                handleLogout={handleLogout}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="flex items-center justify-between">
                  <Breadcrumbs />
                </div>
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold md:text-2xl"><GetTitle /></h1>
                </div>
                <div className="flex-1 rounded-xl dark:bg-slate-900/50 backdrop-blur-xs border border-slate-700/50 shadow-2xl p-4 md:p-6">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </BreadcrumbsProvider>
  );
};

export default DashboardLayout;