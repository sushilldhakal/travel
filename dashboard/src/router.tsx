import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import './index.css';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomeLayout from './layouts/HomeLayout';
import routePaths from './routePath';
import PrivateRoutes from './util/PrivateRoutes';

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const HomePage = lazy(() => import('./pages/Dashboard/HomePage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const UserPage = lazy(() => import('./pages/Users/UserPage'));
const TourPage = lazy(() => import('./pages/Tours/TourPage'));
const AddTour = lazy(() => import('./pages/Tours/AddTour'));
const AddUser = lazy(() => import('./pages/Users/AddUser'));
const ErrorPage = lazy(() => import('./pages/Error/ErrorPage'));
const TourSetting = lazy(() => import('./pages/Tours/TourSetting'));
const TourCategory = lazy(() => import('./pages/Tours/TourCategory'));
const Home = lazy(() => import('./pages/Home/Home'));

const router = createBrowserRouter([
  {
    path: routePaths.home.base,
    element: <HomeLayout />,
    children: [
      {
        path: routePaths.home.base,
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: routePaths.auth.base,
    element: <AuthLayout />,
    children: [
      {
        path: routePaths.auth.login,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: routePaths.auth.register,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: routePaths.error,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: routePaths.dashboard.base,
    element: <PrivateRoutes />,
    children: [
      {
        path: routePaths.dashboard.base,
        element: <DashboardLayout />,
        children: [
          {
            path: routePaths.dashboard.tours,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourPage />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.singleTours,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AddTour />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.addTour,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AddTour />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.tourSetting,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourSetting />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.tourCategory,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourCategory />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.home,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <HomePage />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.users,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <UserPage />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.addUser,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AddUser />
              </Suspense>
            ),
          },
        ],
      },
    ]
  },

]);

export { router, routePaths };
