
  
  
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
            url: "/dashboard/tours/addtour",
          },

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
                url: "/dashboard/users/adduser",
              },
    
                ],
              },
        ],
      }

  
  export default menuItems;