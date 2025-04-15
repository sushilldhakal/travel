import routePaths from "./routePath";
import { FilePlus, Footprints, Images,MapPinned, Layers3,StickyNote,MessagesSquare, LayoutDashboard, Lightbulb, ListCollapse, MailCheck, MessageCircleMore, Settings, Users } from "lucide-react";
  

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
        
        id: "posts",
        title: "Posts",
        type: "item",
        icon: StickyNote,
        url: routePaths.dashboard.post,
        children: [
          {
            id: "postList",
            title: "All Post",
            type: "item",
            icon: ListCollapse,
            url: routePaths.dashboard.post, // Using the same routePath for tours list
          },
          {
            id: "createPost",
            title: "Add post",
            type: "item",
            icon: FilePlus,
            url: routePaths.dashboard.addPost,
          },
         
     
        ]
      },
      {
        id: "comments",
        title: "Comments",
        type: "item",
        icon: MessagesSquare,
        url: routePaths.dashboard.comment,
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
            id: "destination",
            title: "Destination",
            type: "item",
            icon: MapPinned,
            url:routePaths.dashboard.tourDestination, // This routePath should be added to routePaths if exists
          },
          {
            id: "category",
            title: "Category",
            type: "item",
            icon: Layers3,
            url:routePaths.dashboard.tourCategory, // This routePath should be added to routePaths if exists
          },
          {
            id: "fact",
            title: "Facts",
            type: "item",
            icon: Lightbulb,
            url:routePaths.dashboard.tourFacts, // This routePath should be added to routePaths if exists
          },
          {
            id: "faq",
            title: "Faq",
            type: "item",
            icon: MessageCircleMore,
            url:routePaths.dashboard.tourFaq, // This routePath should be added to routePaths if exists
          },
          {
            id: "reviews",
            title: "Reviews",
            type: "item",
            icon: MessageCircleMore,
            url:routePaths.dashboard.tourReviews, // This routePath should be added to routePaths if exists
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
        id: "gallery",
        title: "Gallery",
        type: "item",
        icon: Images,
        url: routePaths.dashboard.gallery,
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
      {
        id: "subscribers",
        title: "Subscribers",
        type: "item",
        icon: MailCheck,
        url: routePaths.dashboard.subscribers,
      },
      {
        id: "setting",
        title: "Setting",
        type: "item",
        icon: Settings,
        url: routePaths.dashboard.setting,
      },
    ],
      }





  