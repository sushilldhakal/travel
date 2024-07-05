import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const MenuItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChildren = (e) => {
    e.preventDefault(); // Prevent the link from navigating when the toggle button is clicked
    setIsOpen(!isOpen);
  };

  return (
    <div className="menu-item">

<NavLink
    to={item.url}
    className={({ isActive }) => {
        return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            isActive && 'bg-muted'
        }`;
    }}>
    {item.title}
</NavLink>
      
      {item.children && (
        <button onClick={toggleChildren} className="toggle-button">
          {isOpen ? '▲' : '▼'}
        </button>
      )}
      {item.children && isOpen && (
        <div className="menu-children">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
