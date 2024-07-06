
import {
  createBrowserRouter
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/Auth/LoginPage";
import HomePage from "./pages/Dashboard/HomePage";
import RegisterPage from "./pages/Auth/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import UserPage from "./pages/Users/UserPage";
import TourPage from "./pages/Tours/TourPage";
import AuthLayout from "./layouts/AuthLayout";
import AddTour from "./pages/Tours/AddTour";
import AddUser from "./pages/Users/AddUser";


const router = createBrowserRouter([
  {
    path: "dashboard",
    element: <DashboardLayout/>,
    children: [
      {
        path: "tours",
        element: <TourPage/>,
      },
      {
        path: "tours/addtour",
        element: <AddTour/>,
      },
      
      {
        path: "home",
        element: <HomePage/>,
      },
     
     
      {
        path: "users",
        element: <UserPage/>,
      },
      {
        path: "users/adduser",
        element: <AddUser/>,
      },
    ]
  },
  {
    path: "dashboard",
    element: <HomePage/>,
  },
  {
    path: "/",
    element:<LoginPage/>,
  },
  {
    path: "login",
    element:<LoginPage/>,
  },
  {
    path: 'auth',
    element: <AuthLayout/>,
    children: [
      {
        path: "login",
        element: <LoginPage/>,
      },
      {
        path: "register",
        element: <RegisterPage/>,
      },
    ]

  },
 
]);

export default router;