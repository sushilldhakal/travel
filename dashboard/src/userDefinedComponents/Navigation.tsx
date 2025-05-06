import { memo, useMemo } from 'react';
import { menuItems } from "@/lib/MenuItems";
import MenuItem from "@/userDefinedComponents/MenuItem";
import useTokenStore from "@/store/store";
import { jwtDecode } from "jwt-decode";
import { LucideIcon } from 'lucide-react';
import { SVGProps } from 'react';
import "@/assets/css/dashboard-style.css";

interface NavigationProps {
  navCollapse: boolean;
  setNavCollapse: (value: boolean) => void;
}

// Define more specific icon component props
type IconComponentProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
};

interface MenuItem {
  id: string;
  title: string;
  href?: string;
  children?: MenuItem[];
  // Use more specific types for icon property
  icon?: React.ComponentType<IconComponentProps> | LucideIcon;
  url?: string;
  type?: string;
}

const Navigation = memo(({ navCollapse, setNavCollapse }: NavigationProps) => {
  console.log("Navigation rendering");
  const { token } = useTokenStore(state => state);
  
  // Use useMemo to prevent re-decoding the token on every render
  const userRoles = useMemo(() => {
    if (!token) return '';
    try {
      const user = jwtDecode(token) as { roles?: string };
      return user?.roles || '';
    } catch (error) {
      console.error("Error decoding token:", error);
      return '';
    }
  }, [token]);
  
  // Memoize the filtered menu items to prevent unnecessary recalculations
  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(menuItems.items, userRoles);
  }, [userRoles]);
  
  return (
    <div className="flex-1">
      <nav className={`${navCollapse ? "grid items-start text-sm font-medium" : "grid sticky top-3 items-start px-2 text-sm font-medium lg:px-4"}`}>
        {filteredMenuItems.map((item) => (
          <MenuItem
            //@ts-expect-error
            navCollapse={navCollapse} setNavCollapse={setNavCollapse} key={item.id} item={item} />
        ))}
      </nav>
    </div>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;

// Move this outside the component to prevent recreation on each render
const filterMenuItems = (items: MenuItem[], roles: string) => {
  return items.map(item => {
    if (item.children) {
      item.children = filterMenuItems(item.children, roles);
    }
    if (roles !== "admin" && item.id === "createuser") {
      return null;
    }

    if (roles !== "admin" && item.id === "subscribers") {
      return null;
    }

    if (roles !== "admin" && item.id === "userlist") {
      return { ...item, title: "User Details" };
    }

    return item;
  }).filter(item => item !== null) as MenuItem[];
};