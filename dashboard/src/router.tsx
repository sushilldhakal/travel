
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
import { AuthLayout } from "./layouts/AuthLayout";
import AddTour from "./pages/Tours/AddTour";
import AddUser from "./pages/Users/AddUser";
import ErrorPage from "./pages/Error/ErrorPage";
import routePaths from "./routePath";
import TourSetting from "./pages/Tours/TourSetting";
import TourCategory from "./pages/Tours/TourCategory";
import PrivateRoutes from "./util/PrivateRoutes";
import PublicRoutes from "./util/PublicRoutes";

const router = createBrowserRouter([


  {
    element: <PrivateRoutes />,
    children: [
      {
        path: routePaths.dashboard.base,
        element: <DashboardLayout />,
        children: [
          {
            path: routePaths.dashboard.tours,
            element: <TourPage />,
          },
          {
            path: routePaths.dashboard.addTour,
            element: <AddTour />,
          },
          {
            path: routePaths.dashboard.tourSetting,
            element: <TourSetting />,
          },
          {
            path: routePaths.dashboard.tourCategory,
            element: <TourCategory />,
          },

          {
            path: routePaths.dashboard.home,
            element: <HomePage />,
          },


          {
            path: routePaths.dashboard.users,
            element: <UserPage />,
          },
          {
            path: routePaths.dashboard.addUser,
            element: <AddUser />,
          },
          {
            path: routePaths.error,
            element: <ErrorPage />,
          },
        ]
      },
    ]
  },
  {
    path: routePaths.auth.base,
    element: <AuthLayout />,
    children: [
      {
        path: routePaths.auth.login,
        element: <LoginPage />,
      },
      {
        path: routePaths.auth.register,
        element: <RegisterPage />,
      },
    ]

  },

  {
    path: routePaths.error,
    element: <ErrorPage />,
  },

]);

export { router, routePaths };