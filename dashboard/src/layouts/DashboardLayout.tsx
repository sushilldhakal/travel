import { Link, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Package2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Breadcrumbs from '@/userDefinedComponents/Breadcrumb';
import useTokenStore from '@/store/store';
import Navigation from '@/userDefinedComponents/Navigation';
import DashboardHeader from '@/userDefinedComponents/DashboardHeader';
import GetTitle from '@/userDefinedComponents/GetTitle';
import routePaths from '@/lib/routePath';
import { BreadcrumbsProvider } from '@/Provider/BreadcrumbsProvider';
import { startTransition, useEffect, useState, useCallback } from 'react';

const DashboardLayout = () => {
  const { token, setToken } = useTokenStore((state) => state);
  const [navCollapse, setNavCollapse] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize setNavCollapse to maintain referential equality
  const memoizedSetNavCollapse = useCallback((value: boolean) => {
    setNavCollapse(value);
  }, []);

  const handleNavigate = useCallback(() => {
    memoizedSetNavCollapse(!navCollapse);
  }, [navCollapse, memoizedSetNavCollapse]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        memoizedSetNavCollapse(true);
      } else {
        memoizedSetNavCollapse(false);
      }
    };

    // Set the initial state based on the current window width
    handleResize();

    // Add event listener to handle window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [memoizedSetNavCollapse]);

  const handleLogout = () => {
    startTransition(() => {
      setToken('');
      localStorage.removeItem("token-store");
      navigate('/');
    });
  };

  if (!token) {
    return <Navigate to="/" state={{ path: location.pathname }} />;
  }

  return (
    <BreadcrumbsProvider>
      <div className={`${navCollapse ? 'flex min-h-screen w-full flex-col bg-muted/40' : 'grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr]'}  `}>
        <div className={`${navCollapse ? 'fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex' : 'hidden border-r bg-muted/40 md:block'}`}>
          <div className="flex flex-col h-full gap-2">
            <div className="flex h-14 items-center border-b px-2 lg:h-[60px] lg:px-3 relative">
              <Link to={routePaths.dashboard.home} className="flex items-center gap-2 font-semibold">
                <Package2 className="h-6 w-6" />
                {
                  !navCollapse ? <span>eTravel</span> : ''
                }

              </Link>
              <Button onClick={handleNavigate} variant="outline" size="icon" className="ml-auto h-8 w-8 absolute top-3 right-[-15px]">
                {

                  !navCollapse ? <ChevronLeft /> : <ChevronRight />}
              </Button>


            </div>
            <Navigation
              navCollapse={navCollapse}
              setNavCollapse={memoizedSetNavCollapse} />
          </div>
        </div>
        <div className={`${navCollapse ? 'flex flex-col sm:gap-4 sm:py-4 sm:pl-14' : 'flex flex-col'}`}>
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