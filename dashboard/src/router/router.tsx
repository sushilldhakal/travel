import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout, { AdminRoute } from '@/util/AuthLayout';
import routePaths from '@/lib/routePath';
import PrivateRoutes from '@/util/PrivateRoutes';

const Setting = lazy(() => import('@/pages/Setting/Setting'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const HomeLayout = lazy(() => import('@/layouts/HomeLayout'));
const FrontTours = lazy(() => import('@/pages/FrontEnd/Tours/FrontTours'));
const FrontSingleTours = lazy(() => import('@/pages/FrontEnd/SingleTours/FrontSingleTours'));
const GalleryPage = lazy(() => import('@/pages/Gallery/GalleryPage'));
const EditUser = lazy(() => import('@/pages/Users/EditUser'));
const EditTour = lazy(() => import('@/pages/Tours/EditTour'));
const Subscriber = lazy(() => import('@/pages/Subscriber/Subscriber'));
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const HomePage = lazy(() => import('@/pages/Dashboard/HomePage'));
const RegisterPage = lazy(() => import('@/pages/Auth/RegisterPage'));
const UserPage = lazy(() => import('@/pages/Users/UserPage'));
const TourPage = lazy(() => import('@/pages/Tours/TourPage'));
const AddTour = lazy(() => import('@/pages/Tours/AddTour'));
const AddUser = lazy(() => import('@/pages/Users/AddUser'));
const ErrorPage = lazy(() => import('@/pages/Error/ErrorPage'));
const TourSetting = lazy(() => import('@/pages/Tours/TourSetting'));
const TourCategory = lazy(() => import('@/pages/Tours/Category/TourCategory'));
const Home = lazy(() => import('@/pages/Home/Home'));

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
      }, {
        path: routePaths.home.tours,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FrontTours />
          </Suspense>
        ),
      }, {
        path: routePaths.home.singleTours,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FrontSingleTours />
          </Suspense>
        ),
      }
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
        path: routePaths.auth.verify,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: routePaths.auth.forgot,
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
                <EditTour />
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
            path: routePaths.dashboard.editTour,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <EditTour />
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
            path: routePaths.dashboard.setting,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Setting />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.gallery,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <GalleryPage onImageSelect={() => { }} isGalleryPage={true} />
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
              <AdminRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <AddUser />
                </Suspense>
              </AdminRoute>
            ),
          },
          {
            path: routePaths.dashboard.subscribers,
            element: (
              <AdminRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <Subscriber />
                </Suspense>
              </AdminRoute>
            ),
          }, {
            path: routePaths.dashboard.editUser,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <EditUser />
              </Suspense>
            ),
          },
        ],
      },

    ]
  },

]);

export { router, routePaths };
