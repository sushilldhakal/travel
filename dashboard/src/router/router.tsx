import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout, { AdminRoute } from '@/util/AuthLayout';
import routePaths from '@/lib/routePath';
import PrivateRoutes from '@/util/PrivateRoutes';
import HomeLayout from '@/layouts/HomeLayout';
import FrontTours from '@/pages/FrontEnd/Tours/FrontTours';
import FrontSingleTours from '@/pages/FrontEnd/SingleTours/FrontSingleTours';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import ErrorPage from '@/pages/Error/ErrorPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import Setting from '@/pages/Dashboard/Setting/Setting';
import GalleryPage from '@/pages/Dashboard/Gallery/GalleryPage';
import UserPage from '@/pages/Dashboard/Users/UserPage';
import AddUser from '@/pages/Dashboard/Users/AddUser';
import Subscriber from '@/pages/Dashboard/Subscriber/Subscriber';
import EditUser from '@/pages/Dashboard/Users/EditUser';
import Home from '@/pages/FrontEnd/Home/Home';
import TourPage from '@/pages/Dashboard/Tours/TourPage';
import EditTour from '@/pages/Dashboard/Tours/EditTour';
import AddTour from '@/pages/Dashboard/Tours/AddTour';
import TourSetting from '@/pages/Dashboard/Tours/TourSetting';
import TourCategory from '@/pages/Dashboard/Tours/Category/TourCategory';
import TourFacts from '@/pages/Dashboard/Tours/FACTS/Facts';
import TourFaq from '@/pages/Dashboard/Tours/FAQ/Faq';
import HomePage from '@/pages/Dashboard/HomePage';
import Post from '@/pages/Dashboard/Post/Post';
import EditPost from '@/pages/Dashboard/Post/EditPost';
import AddPost from '@/pages/Dashboard/Post/Addpost';
import Comments from '@/pages/Dashboard/Post/Comments';

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
            path: routePaths.dashboard.post,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Post />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.addPost,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AddPost />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.editPost,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <EditPost />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.comment,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Comments />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.singleComment,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Comments />
              </Suspense>
            ),
          },
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
            path: routePaths.dashboard.tourFacts,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourFacts />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.tourFaq,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourFaq />
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
