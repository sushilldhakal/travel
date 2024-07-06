
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
import ErrorPage from "./pages/Error/ErrorPage";


const routePaths = {
  home: "/",
  login: "/login",
  dashboard: {
    base: "/dashboard",
    home: "/dashboard/home",
    tours: "/dashboard/tours",
    addTour: "/dashboard/tours/add_tour",
    users: "/dashboard/users",
    addUser: "/dashboard/users/add_user",
  },
  auth: {
    base: "/auth",
    login: "/auth/login",
    register: "/auth/register",
  },
  error: "*",
};

const router = createBrowserRouter([
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
  {
    path: routePaths.home,
    element: <HomePage />,
  },
  {
    path: routePaths.login,
    element: <LoginPage />,
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