import { getTours } from "@/http/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import BreadCrumbTourList from "./BreadCrumbTourList";
import Filter from "./Filter";
import Search from "@/userDefinedComponents/User/Search/Search";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, ChevronDown, Grid, List, SlidersHorizontal } from "lucide-react"
import { useState } from "react";


const FrontTours = () => {


  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours,
  });

  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("featured");

  console.log("data", data)

  return (
    <>





      <div className="banner pattern-2 relative" style={{
        backgroundImage: `url("https://res.cloudinary.com/dmokg80lf/image/upload/v1721751420/tour-covers/s99i5i9r2fwbrjyyfjbm.jpg")`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        zIndex: 0
      }} >
        <div className="showPattern"></div>
        <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }}></div>
        <div className="relative mx-auto max-w-screen-xl px-4 2xl:px-0" style={{ zIndex: 2 }}>
          <BreadCrumbTourList />
        </div>
      </div >


      <div className="w-full bg-background border-b sticky top-[65px] z-[1]">
        <div className="container max-w-7xl px-2 py-3 mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left side - Filters */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    Category
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>All Categories</DropdownMenuItem>
                    <DropdownMenuItem>Electronics</DropdownMenuItem>
                    <DropdownMenuItem>Clothing</DropdownMenuItem>
                    <DropdownMenuItem>Home & Garden</DropdownMenuItem>
                    <DropdownMenuItem>Sports & Outdoors</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    Price Range
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Select Price Range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>All Prices</DropdownMenuItem>
                    <DropdownMenuItem>Under $25</DropdownMenuItem>
                    <DropdownMenuItem>$25 to $50</DropdownMenuItem>
                    <DropdownMenuItem>$50 to $100</DropdownMenuItem>
                    <DropdownMenuItem>$100 to $200</DropdownMenuItem>
                    <DropdownMenuItem>$200 & Above</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort by: {sortOption}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setSortOption("featured")}>Featured</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("newest")}>Newest</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                      <ArrowDownAZ className="w-4 h-4 mr-2" />
                      Name (A to Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                      <ArrowUpAZ className="w-4 h-4 mr-2" />
                      Name (Z to A)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("price-asc")}>Price (Low to High)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("price-desc")}>Price (High to Low)</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - View toggle and Sort */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 rounded-none px-3"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                  <span className="sr-only">List view</span>
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 rounded-none px-3"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
              </div>



              <div className="text-sm text-muted-foreground ml-2 hidden md:block">
                Showing <span className="font-medium">24</span> of <span className="font-medium">256</span> products
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="bg-gray-50 grid gap-4 grid-cols-3 mx-auto max-w-screen-xl py-8 antialiased dark:bg-gray-900 md:py-12">









        <div className="col-span-2 mx-auto max-w-screen-xl px-4 2xl:px-0">
          {/* Search bar */}
          {/* <div className="mb-6">
            <Filter />
          </div> */}

          <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-3">
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error loading tours</p>}
            {data?.data.tours.map((tour) => (
              <div
                key={tour._id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:scale-[1.02]"
              >
                <div className="w-full h-[300px] overflow-hidden rounded-lg">
                  <Link to={`/tours/${tour._id}`} className="block h-full">
                    <img
                      className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                      src={tour.coverImage}
                      alt={tour.title}
                      loading="lazy"
                    />
                  </Link>
                </div>
                <div className="pt-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="me-2 rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                      Up to 35% off
                    </span>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        data-tooltip-target="tooltip-quick-look"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span className="sr-only">Quick look</span>
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                          />
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </button>
                      <div
                        id="tooltip-quick-look"
                        role="tooltip"
                        className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
                        data-popper-placement="top"
                      >
                        Quick look
                        <div className="tooltip-arrow" data-popper-arrow=""></div>
                      </div>

                      <button
                        type="button"
                        data-tooltip-target="tooltip-add-to-favorites"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span className="sr-only">Add to Favorites</span>
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
                          />
                        </svg>
                      </button>
                      <div
                        id="tooltip-add-to-favorites"
                        role="tooltip"
                        className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
                        data-popper-placement="top"
                      >
                        Add to favorites
                        <div className="tooltip-arrow" data-popper-arrow=""></div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/tours/${tour._id}`}
                    className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white"
                  >
                    {tour.title}
                  </Link>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-yellow-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                      </svg>
                      {/* Repeat for additional stars */}
                    </div>

                    <p className="text-sm font-medium text-gray-900 dark:text-white">5.0</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">(455)</p>
                  </div>

                  <ul className="mt-2 flex items-center gap-4">
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5h-5m1 0H6M16 3h-6a1 1 0 0 0-1 1v6"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">English</span>
                    </li>

                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20.6 8.3a4.49 4.49 0 0 0-6.1-6.1A4.49 4.49 0 0 0 8.3 3.4a4.49 4.49 0 0 0-6.1 6.1 4.49 4.49 0 0 0 6.1 6.1A4.49 4.49 0 0 0 14.5 14a4.49 4.49 0 0 0 6.1-6.1Z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        12h 30m
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${tour.price}
                    </span>
                    <Link
                      to={`/tours/${tour._id}`}
                      className="inline-flex items-center rounded-lg border border-primary-600 bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-600"
                    >
                      Book now
                      <svg
                        className="ms-2 -me-1 h-4 w-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 12h14m-7 7l7-7-7-7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>
        <div className="col-span-1 sticky top-4 h-full px-4">
          <div className=" sticky top-[145px]">
            <Search />

          </div>
        </div>

      </section>
    </>

  );
};

export default FrontTours;
