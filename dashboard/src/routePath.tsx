
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
    addUser: "/dashboard/users/add_user",
    tourSetting: "/dashboard/tours/tour_setting",
    tourCategory: "/dashboard/tours/tour_category",
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
    register: "/auth/register",
  },
  error: "*",
};

export default routePaths;