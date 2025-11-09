import routePaths from "./routePath";
// Import icons from react-icons collections for better visual recognition
import {
  FaHome, FaUsers, FaUserPlus, FaRegListAlt,
  FaClipboardList, FaMapMarkerAlt, FaLightbulb,
  FaCheck
} from "react-icons/fa";

import {
  MdDashboard, MdTour, MdSettings, MdContactMail,
  MdComment, MdRateReview, MdPostAdd, MdOutlineSubscriptions
} from "react-icons/md";

import { BiSolidCategory } from "react-icons/bi";
import { IoInformationCircle } from "react-icons/io5";
import { BsFilePost, BsFileEarmarkPlus, BsQuestionCircle } from "react-icons/bs";
import { RiGalleryFill } from "react-icons/ri";


export const UserMenuItems = {
  items: [
    {
      id: "home",
      title: "Home",
      type: "item",
      icon: FaHome,
      url: routePaths.home.base,
    },
    {
      id: "tours",
      title: "Tours",
      type: "item",
      icon: MdTour,
      url: routePaths.home.tours,
    },
    {
      id: "about",
      title: "About Us",
      type: "item",
      icon: IoInformationCircle,
      url: routePaths.home.about,
    },
    {
      id: "contact",
      title: "Contact Us",
      type: "item",
      icon: MdContactMail,
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
      icon: MdDashboard,
      url: routePaths.dashboard.home,
    },
    {

      id: "posts",
      title: "Posts",
      type: "item",
      icon: BsFilePost,
      url: routePaths.dashboard.post,
      children: [
        {
          id: "postList",
          title: "All Post",
          type: "item",
          icon: FaRegListAlt,
          url: routePaths.dashboard.post, // Using the same routePath for tours list
        },
        {
          id: "createPost",
          title: "Add post",
          type: "item",
          icon: BsFileEarmarkPlus,
          url: routePaths.dashboard.addPost,
        },


      ]
    },
    {
      id: "comments",
      title: "Comments",
      type: "item",
      icon: MdComment,
      url: routePaths.dashboard.comment,
    },
    {
      id: "tours",
      title: "Tours",
      type: "item",
      icon: MdTour,
      url: routePaths.dashboard.tours,
      children: [
        {
          id: "tourlist",
          title: "All Tour",
          type: "item",
          icon: FaClipboardList,
          url: routePaths.dashboard.tours, // Using the same routePath for tours list
        },
        {
          id: "createtour",
          title: "Add Tour",
          type: "item",
          icon: MdPostAdd,
          url: routePaths.dashboard.addTour,
        },
        {
          id: "destination",
          title: "Destination",
          type: "item",
          icon: FaMapMarkerAlt,
          url: routePaths.dashboard.tourDestination, // This routePath should be added to routePaths if exists
        },
        {
          id: "category",
          title: "Category",
          type: "item",
          icon: BiSolidCategory,
          url: routePaths.dashboard.tourCategory, // This routePath should be added to routePaths if exists
        },
        {
          id: "fact",
          title: "Facts",
          type: "item",
          icon: FaLightbulb,
          url: routePaths.dashboard.tourFacts, // This routePath should be added to routePaths if exists
        },
        {
          id: "faq",
          title: "Faq",
          type: "item",
          icon: BsQuestionCircle,
          url: routePaths.dashboard.tourFaq, // This routePath should be added to routePaths if exists
        },
        {
          id: "bookings",
          title: "Bookings",
          type: "item",
          icon: FaCheck,
          url: routePaths.dashboard.tourBookings, // This routePath should be added to routePaths if exists
        },
        {
          id: "reviews",
          title: "Reviews",
          type: "item",
          icon: MdRateReview,
          url: routePaths.dashboard.tourReviews, // This routePath should be added to routePaths if exists
        },
        {
          id: "tripsetting",
          title: "Setting",
          type: "item",
          icon: MdSettings,
          url: routePaths.dashboard.tourSetting, // This routePath should be added to routePaths if exists
        },
      ],
    },
    {
      id: "gallery",
      title: "Gallery",
      type: "item",
      icon: RiGalleryFill,
      url: routePaths.dashboard.gallery,
    },
    {
      id: "user",
      title: "Users",
      type: "item",
      icon: FaUsers,
      url: routePaths.dashboard.users,
      children: [
        {
          id: "userlist",
          title: "All User",
          type: "item",
          icon: FaUsers,
          url: routePaths.dashboard.users, // Using the same routePath for users list
        },
        {
          id: "createuser",
          title: "Add User",
          type: "item",
          icon: FaUserPlus,
          url: routePaths.dashboard.addUser,
        },
        {
          id: "seller",
          title: "Seller Applications",
          type: "item",
          icon: MdOutlineSubscriptions,
          url: routePaths.dashboard.sellerApplications,
        },
      ],
    },
    {
      id: "subscribers",
      title: "Subscribers",
      type: "item",
      icon: MdOutlineSubscriptions,
      url: routePaths.dashboard.subscribers,
    },
    {
      id: "setting",
      title: "Setting",
      type: "item",
      icon: MdSettings,
      url: routePaths.dashboard.setting,
    },
  ],
}





