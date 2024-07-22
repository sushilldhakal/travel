import routePaths from "../routePath";
import { FilePlus, Footprints, Layers3, LayoutDashboard, ListCollapse, Settings, Users } from "lucide-react";
  

export const UserMenuItems = {
  items:[
    {
      id: "home",
      title: "Home",
      type: "item",
      icon: LayoutDashboard,
      url: routePaths.home.base,
    },
    {
      id: "tours",
      title: "Tours",
      type: "item",
      icon: LayoutDashboard,
      url: routePaths.home.tours,
    },
    {
      id: "about",
      title: "About Us",
      type: "item",
      icon: LayoutDashboard,
      url: routePaths.home.about,
    },
    {
      id: "contact",
      title: "Contact Us",
      type: "item",
      icon: LayoutDashboard,
      url: routePaths.home.contact,
    }

  ]
}

  
 export const menuItems = {
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        type: "item",
        icon: LayoutDashboard,
        url: routePaths.dashboard.home,
      },
      {
        id: "tours",
        title: "Tours",
        type: "item",
        icon: Footprints,
        url: routePaths.dashboard.tours,
        children: [
          {
            id: "tourlist",
            title: "All Tour",
            type: "item",
            icon: ListCollapse,
            url: routePaths.dashboard.tours, // Using the same routePath for tours list
          },
          {
            id: "createtour",
            title: "Add Tour",
            type: "item",
            icon: FilePlus,
            url: routePaths.dashboard.addTour,
          },
          {
            id: "category",
            title: "Category",
            type: "item",
            icon: Layers3,
            url:routePaths.dashboard.tourCategory, // This routePath should be added to routePaths if exists
          },
          {
            id: "tripsetting",
            title: "Setting",
            type: "item",
            icon: Settings,
            url: routePaths.dashboard.tourSetting, // This routePath should be added to routePaths if exists
          },
        ],
      },
      {
        id: "user",
        title: "Users",
        type: "item",
        icon: Users,
        url: routePaths.dashboard.users,
        children: [
          {
            id: "userlist",
            title: "All User",
            type: "item",
            icon: ListCollapse,
            url: routePaths.dashboard.users, // Using the same routePath for users list
          },
          {
            id: "createuser",
            title: "Add User",
            type: "item",
            icon: FilePlus,
            url: routePaths.dashboard.addUser,
          },
        ],
      },
    ],
      }






  