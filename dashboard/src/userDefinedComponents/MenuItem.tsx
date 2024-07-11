import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

const MenuItem = ({ item }) => {
  const location = useLocation(); // Hook to get current location
  const [isOpen, setIsOpen] = useState(localStorage.getItem(`menu-${item.id}`) === 'true');


  useEffect(() => {
    localStorage.setItem(`menu-${item.id}`, isOpen.toString()); // Store isOpen state in localStorage
  }, [isOpen, item.id]);
  const toggleChildren = (e) => {
    e.preventDefault(); // Prevent the link from navigating when the toggle button is clicked
    setIsOpen(!isOpen);
  };

  // Function to determine if NavLink is active
  const isActive = (url) => location.pathname === url;

  return (
    <div className={`menu-item`}>
      {item.children ? (
        <div
          onClick={toggleChildren}
          className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isOpen ? 'open bg-muted' : ''}`}
        >
          {<item.icon />}
          <span className="menu-title">{item.title}</span>
          {item.children && isOpen ? (
            <span className="ml-auto">
              <Icon name="CircleArrowUp" />
            </span>
          ) : (
            <span className="ml-auto">
              <Icon name="CircleArrowDown" />
            </span>
          )}
        </div>
      ) : (
        <NavLink
          to={item.url}
          className={`flex items-center gap-3 my-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive(item.url) ? 'bg-muted' : ''}`}
        >
          {<item.icon />}
          {item.title}
        </NavLink>
      )}
      {item.children && isOpen && (
        <div className="menu-children shadow-inherit pl-3 text-xs">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
