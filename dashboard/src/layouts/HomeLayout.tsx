import { BreadcrumbsProvider } from '@/Provider/BreadcrumbsProvider';
import Home from '@/pages/Home/Home';
import UserHeader from '@/userDefinedComponents/User/UserHeader';
import UserNav from '@/userDefinedComponents/User/UserNav';
import UserFooter from '@/userDefinedComponents/User/UserFooter';
import "@/assets/css/home-style.css"
const HomeLayout = () => {

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