
const routePaths = {
  webHome: "/",
  dashboard: {
    base: "/dashboard",
    home: "/dashboard/home",
    tours: "/dashboard/tours",
    addTour: "/dashboard/tours/add_tour",
    users: "/dashboard/users",
    addUser: "/dashboard/users/add_user",
    tourSetting: "/dashboard/tours/tour_setting",
    tourCategory: "/dashboard/tours/tour_category",
  },
  auth: {
    base: "/auth",
    login: "/auth/login",
    register: "/auth/register",
  },
  error: "*",
};

export default routePaths;