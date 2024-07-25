import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Icon from './Icon';

const MenuItem = ({ item, navCollapse }: { item: MenuItemType, navCollapse: boolean }) => {
  const location = useLocation(); // Hook to get current location
  const [isOpen, setIsOpen] = useState(localStorage.getItem(`menu-${item.id}`) === 'true');

  useEffect(() => {
    localStorage.setItem(`menu-${item.id}`, isOpen.toString()); // Store isOpen state in localStorage
  }, [isOpen, item.id]);

  const toggleChildren = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link from navigating when the toggle button is clicked
    setIsOpen(!isOpen);
  };

  // Function to determine if NavLink is active
  const isActive = (url: string) => location.pathname === url;



  return (
    <div className={`menu-item`}>

      {
        navCollapse ?

          <TooltipProvider>


            {item.children ? (
              <div
                onClick={toggleChildren}
                className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isOpen ? 'open bg-muted' : ''}`}
              >
                <Tooltip>
                  <TooltipTrigger>

                    {<item.icon />}
                    <span className="menu-title">{!navCollapse ? item.title : ''}</span>
                    {item.children && isOpen ? (
                      <span className="ml-auto">
                        {!navCollapse ? <Icon name="CircleArrowUp" /> : ''}

                      </span>
                    ) : (
                      <span className="ml-auto">
                        {!navCollapse ? <Icon name="CircleArrowDown" /> : ''}

                      </span>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>

              </div>
            ) : (
              <NavLink
                to={item.url || ''}
                className={`flex items-center gap-3 my-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive(item.url || '') ? 'bg-muted' : ''}`}
              >
                <Tooltip>
                  <TooltipTrigger>
                    {<item.icon />}
                    {
                      <span className="menu-title child">{!navCollapse ? item.title : ''}
                      </span>
                    }
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </NavLink>
            )
            }
            {
              item.children && isOpen && (
                <div className={`${navCollapse ? 'menu-children shadow-inherit pl-1 text-xs border-l-2' : 'menu-children shadow-inherit pl-3 text-xs'}`}>
                  {item.children.map((child) => (
                    <MenuItem navCollapse={navCollapse} key={child.id} item={child} />
                  ))}
                </div>
              )
            }

          </TooltipProvider>
          :

          <TooltipProvider>


            {item.children ? (
              <div
                onClick={toggleChildren}
                className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isOpen ? 'open bg-muted' : ''}`}
              >


                {<item.icon />}
                <span className="menu-title">{!navCollapse ? item.title : ''}</span>
                {item.children && isOpen ? (
                  <span className="ml-auto">
                    {!navCollapse ? <Icon name="CircleArrowUp" /> : ''}

                  </span>
                ) : (
                  <span className="ml-auto">
                    {!navCollapse ? <Icon name="CircleArrowDown" /> : ''}

                  </span>
                )}


              </div>
            ) : (
              <NavLink
                to={item.url || ''}
                className={`flex items-center gap-3 my-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive(item.url || '') ? 'bg-muted' : ''}`}
              >

                {<item.icon />}
                {
                  <span className="menu-title child">{!navCollapse ? item.title : ''}
                  </span>
                }
              </NavLink>
            )
            }
            {
              item.children && isOpen && (
                <div className={`${navCollapse ? 'menu-children shadow-inherit pl-1 text-xs border-l-2' : 'menu-children shadow-inherit pl-3 text-xs'}`}>
                  {item.children.map((child) => (
                    <MenuItem navCollapse={navCollapse} key={child.id} item={child} />
                  ))}
                </div>
              )
            }


          </TooltipProvider>
      }



    </div >
  );
};

interface MenuItemType {
  id: string;
  title: string;
  url?: string;
  icon: React.ComponentType;
  children?: MenuItemType[];
}
export default MenuItem;
