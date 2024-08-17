import { BreadcrumbsProvider } from '@/Provider/BreadcrumbsProvider';
import UserHeader from '@/userDefinedComponents/User/UserHeader';
import UserNav from '@/userDefinedComponents/User/UserNav';
import UserFooter from '@/userDefinedComponents/User/UserFooter';
import "@/assets/css/home-style.css"
import { Outlet } from 'react-router-dom';
const HomeLayout = () => {

    return (
        <BreadcrumbsProvider>
            <UserHeader />
            <UserNav />
            <Outlet />
            <UserFooter />
        </BreadcrumbsProvider>
    );
}
export default HomeLayout;