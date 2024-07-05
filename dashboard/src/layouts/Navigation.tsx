import menuItems from "./MenuItems";
import MenuItem from "@/userDefinedComponents/MenuItem";

const Navigation = () => {
  return (
     <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">

          {menuItems.items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}

      
           
          </nav>
        </div>
  )
}

export default Navigation