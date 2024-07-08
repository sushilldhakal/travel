import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

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
        >
          {< item.icon />}
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
          className={({ isActive }) => {
            return `flex items-center gap-3 my-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive && 'bg-muted'
              }`;
          }}>
          {/* <Icon name={item.icon} /> */}
          {< item.icon />}
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
