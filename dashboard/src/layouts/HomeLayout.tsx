import { BreadcrumbsProvider } from '@/Provider/BreadcrumbsProvider';
import UserFooter from '@/userDefinedComponents/User/UserFooter';
import "@/assets/css/home-style.css"
import { Outlet } from 'react-router-dom';
import Header from '@/userDefinedComponents/User/Header/Header';
const HomeLayout = () => {
    return (
        <BreadcrumbsProvider>
            <Header />
            <Outlet />
            <UserFooter />
        </BreadcrumbsProvider>
    );
}
export default HomeLayout;