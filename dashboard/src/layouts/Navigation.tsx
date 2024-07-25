import { menuItems } from "./MenuItems";
import MenuItem from "@/userDefinedComponents/MenuItem";
import "../dashboard-style.css";
import { Button } from "@/components/ui/button";
import { ArrowRightToLine } from "lucide-react";
import useTokenStore from "@/store";
import { jwtDecode } from "jwt-decode";

const Navigation = ({ navCollapse, setNavCollapse }: { navCollapse: boolean, setNavCollapse: (value: boolean) => void }) => {
  const handleNavigate = () => {
    setNavCollapse(!navCollapse);
  };
  const { token } = useTokenStore(state => state);
  const user = jwtDecode(token) as { roles?: string };
  const roles = user?.roles || '';
  const filteredMenuItems = filterMenuItems(menuItems.items, roles);
  return (
    <div className="flex-1">
      <nav className={`${navCollapse ? "grid items-start text-sm font-medium" : "grid items-start px-2 text-sm font-medium lg:px-4"}`}>
        {filteredMenuItems.map((item) => (
          <MenuItem
            //@ts-expect-error
            navCollapse={navCollapse} setNavCollapse={setNavCollapse} key={item.id} item={item} />
        ))}
      </nav>

      {
        navCollapse ? <Button onClick={handleNavigate} variant="outline" size="icon" className="mt-5 ml-4 h-6 w-6">
          <ArrowRightToLine />
        </Button> : ""
      }
    </div>
  )
}

export default Navigation



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
  }).filter(item => item !== null);
};

interface MenuItem {
  id: string;
  children?: MenuItem[];
  [key: string]: any;
}