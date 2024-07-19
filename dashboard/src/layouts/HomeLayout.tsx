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
import Home from '@/pages/Home/Home';
import UserHeader from '@/userDefinedComponents/User/UserHeader';
import UserNav from '@/userDefinedComponents/User/UserNav';
import UserFooter from '@/userDefinedComponents/User/UserFooter';
import "../home-style.css"
const HomeLayout = () => {
    const { token, setToken } = useTokenStore((state) => state);
    const navigate = useNavigate();
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem("token-store");
        navigate('/auth/login');
    };

    // if (!token) {
    //     return <Navigate to="/auth/login" replace />;
    // }



    return (
        <BreadcrumbsProvider>
            <UserHeader />
            <UserNav />
            <Home />
            <UserFooter />
        </BreadcrumbsProvider>

    );
}
export default HomeLayout;