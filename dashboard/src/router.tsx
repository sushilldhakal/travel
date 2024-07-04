
import {
  createBrowserRouter
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import TourPage from "./pages/TourPage";


const router = createBrowserRouter([
  {
    path: "dashboard",
    element: <DashboardLayout/>,
    children: [
      {
        path: "home",
        element: <HomePage/>,
      },
      {
        path: "tour",
        element: <TourPage/>,
      },
    ]
  },
  {
    path: "/login",
    element: <LoginPage/>,
  },
  {
    path: "/register",
    element: <RegisterPage/>,
  },
]);

export default router;