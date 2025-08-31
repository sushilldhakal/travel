import { Button } from "@/components/ui/button";
import { searchTours } from "@/http";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import BreadCrumbTourList from "./BreadCrumbTourList";
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, ChevronDown, Grid, List, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

interface Tour {
  _id: string;
  title: string;
  description: string;
  price: number;
  coverImage: string;
  duration: string;
  destination: string;
  category: { label: string; value: string }[];
}

const SearchResults = () => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("featured");
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    category: string | null;
    priceRange: string | null;
  }>({
    category: null,
    priceRange: null,
  });

  // Get search query from URL
  const query = location.search.substring(1);

  // Parse query parameters for display
  const params = new URLSearchParams(query);
  const keyword = params.get("keyword");
  const destination = params.get("destination");
  const types = params.get("types")?.split(",");
  const duration = params.get("duration");
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  // Fetch search results
  const { data, isLoading, isError } = useQuery({
    queryKey: ['searchTours', query],
    queryFn: () => searchTours(query),
    enabled: !!query,
  });

  // Apply filters and sorting
  useEffect(() => {
    if (data?.tours) {
      let results = [...data.tours];

      // Apply category filter
      if (activeFilters.category) {
        results = results.filter(tour =>
          tour.category.some((cat: { value: string }) => cat.value === activeFilters.category)
        );
      }

      // Apply price range filter
      if (activeFilters.priceRange) {
        const [min, max] = activeFilters.priceRange.split('-').map(Number);
        results = results.filter(tour =>
          tour.price >= min && (max ? tour.price <= max : true)
        );
      }

      // Apply sorting
      switch (sortOption) {
        case "newest":
          // Assuming there's a createdAt field, if not, this won't change the order
          results = [...results].sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          break;
        case "name-asc":
          results = [...results].sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name-desc":
          results = [...results].sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "price-asc":
          results = [...results].sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          results = [...results].sort((a, b) => b.price - a.price);
          break;
        // featured is default, no sorting needed
      }

      setFilteredTours(results);
    }
  }, [data, activeFilters, sortOption]);

  // Handle filter changes
  const handleCategoryFilter = (category: string | null) => {
    setActiveFilters(prev => ({ ...prev, category }));
    toast({
      title: category ? `Filtering by ${category}` : "All categories",
      description: "Updating tour results...",
      duration: 2000,
    });
  };

  const handlePriceFilter = (priceRange: string | null) => {
    setActiveFilters(prev => ({ ...prev, priceRange }));
    toast({
      title: priceRange ? `Filtering by price range` : "All prices",
      description: "Updating tour results...",
      duration: 2000,
    });
  };

  // Create a summary of the search parameters
  const searchSummary = () => {
    const parts = [];
    if (keyword) parts.push(`"${keyword}"`);
    if (destination) parts.push(`in ${destination}`);
    if (types?.length) parts.push(`type: ${types.join(', ')}`);
    if (duration) parts.push(`${duration} days`);
    if (minPrice && maxPrice) parts.push(`$${minPrice}-$${maxPrice}`);

    return parts.length ? parts.join(', ') : 'all tours';
  };

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
        <div className="relative mx-auto max-w-(--breakpoint-xl) px-4 2xl:px-0" style={{ zIndex: 2 }}>
          <BreadCrumbTourList />
        </div>
      </div>

      <div className="w-full bg-background border-b sticky top-[65px] z-1">
        <div className="container max-w-8xl px-2 py-3 mx-auto">
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
                    <DropdownMenuItem onClick={() => handleCategoryFilter(null)}>
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryFilter('adventure')}>
                      Adventure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryFilter('cultural')}>
                      Cultural
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryFilter('beach')}>
                      Beach
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryFilter('mountain')}>
                      Mountain
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={() => handlePriceFilter(null)}>
                      All Prices
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriceFilter('0-25')}>
                      Under $25
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriceFilter('25-50')}>
                      $25 to $50
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriceFilter('50-100')}>
                      $50 to $100
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriceFilter('100-200')}>
                      $100 to $200
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriceFilter('200-')}>
                      $200 & Above
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={() => setSortOption("featured")}>
                      Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("newest")}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                      <ArrowDownAZ className="w-4 h-4 mr-2" />
                      Name (A to Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                      <ArrowUpAZ className="w-4 h-4 mr-2" />
                      Name (Z to A)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("price-asc")}>
                      Price (Low to High)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("price-desc")}>
                      Price (High to Low)
                    </DropdownMenuItem>
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
                Showing <span className="font-medium">{filteredTours.length}</span> results
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gray-50 mx-auto max-w-(--breakpoint-xl) py-8 antialiased dark:bg-gray-900 md:py-12">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 2xl:px-0">
          <h1 className="text-2xl font-bold mb-6">
            Search Results for {searchSummary()}
          </h1>

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-red-600">Error loading search results</h2>
              <p className="mt-2 text-gray-600">Please try again or modify your search criteria.</p>
            </div>
          )}

          {!isLoading && !isError && filteredTours.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">No tours found</h2>
              <p className="mt-2 text-gray-600">Try adjusting your search criteria or browse all tours.</p>
              <Button asChild className="mt-4">
                <Link to="/tours">View All Tours</Link>
              </Button>
            </div>
          )}

          {!isLoading && !isError && filteredTours.length > 0 && (
            <div className={`grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredTours.map((tour) => (
                <div
                  key={tour._id}
                  className={`rounded-lg border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] ${viewMode === "grid" ? "p-6 hover:scale-[1.02]" : "p-4 flex flex-row"}`}
                >
                  <div className={`${viewMode === "grid" ? "w-full h-[300px]" : "w-1/3 h-[200px]"} overflow-hidden rounded-lg`}>
                    <Link to={`/tours/${tour._id}`} className="block h-full">
                      <img
                        className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                        src={tour.coverImage}
                        alt={tour.title}
                        loading="lazy"
                      />
                    </Link>
                  </div>
                  <div className={`${viewMode === "grid" ? "pt-6" : "pl-6 flex-1"}`}>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <span className="me-2 rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                        {tour.duration} days
                      </span>

                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
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
                      </div>
                    </div>

                    <Link to={`/tours/${tour._id}`}>
                      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                        {tour.title}
                      </h3>
                    </Link>

                    <p className="mb-4 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {tour.description}
                    </p>

                    <ul className="mt-2 flex items-center gap-4 flex-wrap">
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
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {tour.destination}
                        </span>
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
                          {tour.duration} days
                        </span>
                      </li>
                    </ul>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${tour.price}
                      </span>
                      <Link
                        to={`/tours/${tour._id}`}
                        className="inline-flex items-center rounded-lg border border-primary-600 bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-600"
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
          )}
        </div>
      </section>
    </>
  );
};

export default SearchResults;
