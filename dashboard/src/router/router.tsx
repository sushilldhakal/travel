import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
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
import SellerApplications from '@/pages/Dashboard/Users/SellerApplications';
import Home from '@/pages/FrontEnd/Home/Home';
import TourPage from '@/pages/Dashboard/Tours/TourPage';
import EditTour from '@/pages/Dashboard/Tours/EditTour';
import AddTour from '@/pages/Dashboard/Tours/AddTour';
import TourSetting from '@/pages/Dashboard/Tours/TourSetting';
import TourCategory from '@/pages/Dashboard/Tours/Category/TourCategory';
import TourFacts from '@/pages/Dashboard/Tours/FACTS/Facts';
import TourFaq from '@/pages/Dashboard/Tours/FAQ/Faq';
import ReviewsManagement from '@/pages/Dashboard/Tours/Reviews';
import TourEditorWrapper from '@/pages/Dashboard/Tours/TourEditorWrapper';
import HomePage from '@/pages/Dashboard/HomePage';
import Post from '@/pages/Dashboard/Post/Post';
import EditPost from '@/pages/Dashboard/Post/EditPost';
import AddPost from '@/pages/Dashboard/Post/AddPost';
import Comments from '@/pages/Dashboard/Post/Comments';
import BlogList from '@/pages/FrontEnd/Blog/BlogList';
import SingleBlog from '@/pages/FrontEnd/Blog/SingleBlog';
import Destination from '@/pages/Dashboard/Tours/Destination';
import SellerWizard from '@/pages/FrontEnd/Seller/SellerWizard';
import AllDestinations from '@/pages/FrontEnd/Destinations/AllDestinations';
import SingleDestination from '@/pages/FrontEnd/Destinations/SingleDestination';
import AllCategories from '@/pages/FrontEnd/Categories/AllCategories';
import SingleCategory from '@/pages/FrontEnd/Categories/SingleCategory';
import Bookings from '@/pages/Dashboard/Tours/Bookings';
import BookingList from '@/pages/FrontEnd/Booking/BookingList';
import SingleBooking from '@/pages/FrontEnd/Booking/SingleBooking';
import Cart from '@/pages/FrontEnd/Cart/Cart';
import Checkout from '@/pages/FrontEnd/Checkout/Checkout';
import EnquiryList from '@/pages/FrontEnd/Enquiry/EnquiryList';
import SingleEnquiry from '@/pages/FrontEnd/Enquiry/SingleEnquiry';
import UserProfile from '@/pages/FrontEnd/Profile/UserProfile';

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
      }, {
        path: routePaths.home.blog,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BlogList />
          </Suspense>
        ),
      }, {
        path: routePaths.home.singleBlog,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SingleBlog />
          </Suspense>
        ),
      }, {
        path: routePaths.home.destinations,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AllDestinations />
          </Suspense>
        ),
      }, {
        path: routePaths.home.singleDestination,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SingleDestination />
          </Suspense>
        ),
      }, {
        path: routePaths.home.categories,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AllCategories />
          </Suspense>
        ),
      }, {
        path: routePaths.home.singleCategory,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SingleCategory />
          </Suspense>
        ),
      },

      {
        path: routePaths.home.applySeller,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SellerWizard />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.booking,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BookingList />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.singleBooking,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SingleBooking />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.cart,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Cart />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.checkout,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Checkout />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.enquiry,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <EnquiryList />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.singleEnquiry,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SingleEnquiry />
          </Suspense>
        ),
      },
      {
        path: routePaths.home.singleProfile,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <UserProfile />
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
        index: true,
        element: <Navigate to="/dashboard/home" replace />,
      },
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
                <TourEditorWrapper>
                  <EditTour />
                </TourEditorWrapper>
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.addTour,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourEditorWrapper>
                  <AddTour />
                </TourEditorWrapper>
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.editTour,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TourEditorWrapper>
                  <EditTour />
                </TourEditorWrapper>
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
            path: routePaths.dashboard.tourDestination,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Destination />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.tourBookings,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Bookings />
              </Suspense>
            ),
          },
          {
            path: routePaths.dashboard.tourReviews,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <ReviewsManagement />
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
            path: routePaths.dashboard.sellerApplications,
            element: (
              <AdminRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <SellerApplications />
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

], {
  basename: '/',
});

export { router, routePaths };
