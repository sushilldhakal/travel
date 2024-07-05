
  
  
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
            id: "singletour",
            title: "Tour",
            type: "item",
            icon: "Product",
            url: "/dashboard/tours/:id/singletour",
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
        ],
      }

  
  export default menuItems;