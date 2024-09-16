
const routePaths = {
  webHome: "/",
  dashboard: {
    base: "/dashboard",
    home: "/dashboard/home",
    tours: "/dashboard/tours",
    singleTours: "/dashboard/tours/:tourId",
    addTour: "/dashboard/tours/add_tour",
    editTour: "/dashboard/tours/edit_tour/:tourId",
    users: "/dashboard/users",
    gallery: "/dashboard/gallery",
    addUser: "/dashboard/users/add_user",
    editUser: "/dashboard/users/:userId",
    tourSetting: "/dashboard/tours/tour_setting",
    tourCategory: "/dashboard/tours/tour_category",
    tourFacts: "/dashboard/tours/tour_facts",
    tourFaq: "/dashboard/tours/tour_faq",
    subscribers: "/dashboard/subscribers",
    setting: "/dashboard/setting",
  },
  home: {
    base: "/",
    home: "/",
    tours: "/tours",
    singleTours: "/tours/:tourId",
    about: "/about",
    contact: "/contact",
  },
  auth: {
    base: "/auth",
    login: "/auth/login",
    verify: "/auth/login/verify",
    forgot: "/auth/login/forgot",
    register: "/auth/register",
  },
  error: "*",
};

export default routePaths;