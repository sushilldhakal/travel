
import {
  createBrowserRouter
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import UserPage from "./pages/UserPage";
import TourPage from "./pages/TourPage";
import AuthLayout from "./layouts/AuthLayout";


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
        path: "home",
        element: <HomePage/>,
      },
     
      {
        path: "users",
        element: <UserPage/>,
      },
    ]
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