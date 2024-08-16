import { menuItems } from "@/lib/MenuItems";
import MenuItem from "@/userDefinedComponents/MenuItem";
import useTokenStore from "@/store/store";
import { jwtDecode } from "jwt-decode";
import "@/assets/css/dashboard-style.css";


const Navigation = ({ navCollapse, setNavCollapse }: { navCollapse: boolean, setNavCollapse: (value: boolean) => void }) => {
  const { token } = useTokenStore(state => state);
  const user = jwtDecode(token) as { roles?: string };
  const roles = user?.roles || '';
  const filteredMenuItems = filterMenuItems(menuItems.items, roles);
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