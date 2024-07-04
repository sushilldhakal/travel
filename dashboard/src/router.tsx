
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/Login";
import HomePage from "./pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage/>,
  },
  {
    path: "/",
    element: <HomePage/>,
  },
]);

export default router;