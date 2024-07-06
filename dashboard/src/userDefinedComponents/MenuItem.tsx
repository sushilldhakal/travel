import { CircleArrowDown, CircleArrowUp, PanelBottomOpen, PanelTopOpen } from 'lucide-react';
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const MenuItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChildren = (e) => {
    //e.preventDefault(); // Prevent the link from navigating when the toggle button is clicked
    setIsOpen(!isOpen);
  };

  return (
    <div className={`menu-item${isOpen ? ' bg-muted' : ''}`}>


{item.children ? (
        <div onClick={toggleChildren} 
        className={
          `flex items-center gap-3  cursor-pointer rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isOpen ? 'open bg-muted' : ''}`}
        
          variant="destructive"
          >
          {item.icon && <span className={`menu-icon ${item.icon}`}></span>}
          <span className="menu-title">{item.title}</span>
          {item.children && isOpen ?(
           <CircleArrowUp />
          ) : (
            <CircleArrowDown />

          ) }
        </div>
      ) : (
       
<NavLink
    to={item.url}
    className={({ isActive }) => {
        return `flex items-center gap-3 my-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            isActive && 'bg-muted'
        }`;
    }}>
    {item.title}
</NavLink>
      )}
      {item.children && isOpen && (
        <div className="menu-children shadow-inherit">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
