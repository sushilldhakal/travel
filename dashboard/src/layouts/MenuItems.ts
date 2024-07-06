
  
  
  const menuItems = {
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        type: "item",
        icon: "Home",
        url: "/dashboard/home",
      },
  
      {
        id: "tours",
        title: "Tours",
        type: "item",
        url: "/dashboard/tours",
        children: [
            {
                id: "tourlist",
                title: "All Tour",
                type: "item",
                icon: "Product",
                url: "/dashboard/tours",
              },
          
          {
            id: "createtour",
            title: "Add Tour",
            type: "item",
            icon: "Product",
            url: "/dashboard/tours/add_tour",
          },
          {
            id: "category",
            title: "Category",
            type: "item",
            icon: "Product",
            url: "/dashboard/tours/category",
          },
          //category will have a multiple area to create pricing Category,Trip Types category, Destination Category, Activities Category, Keyword Category
          {
            id: "tripsetting",
            title: "Setting",
            type: "item",
            icon: "Product",
            url: "/dashboard/tours/setting",
          },
          //Setting will have a multiple area to create Bookings, coupons, view enquires, view reports, Currency setting, 
          // add Map Api, create global facts area, create global FAQs area, enable expired trip, disable rating, email template, 
            ],
          },
          {
            id: "user",
            title: "Users",
            type: "item",
            url: "/dashboard/users",
            children: [
                {
                    id: "userlist",
                    title: "All User",
                    type: "item",
                    icon: "Product",
                    url: "/dashboard/users",
                  },
              
              {
                id: "createuser",
                title: "Add User",
                type: "item",
                icon: "Product",
                url: "/dashboard/users/add_user",
              },
    
                ],
              },
        ],
      }

  
  export default menuItems;