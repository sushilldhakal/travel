import { getTours } from "@/http/tourApi";
import { getAllCategories } from "@/http/categoryApi";
import { getAllDestinations } from "@/http/destinationApi";
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback } from "react";
import { Link } from "react-router-dom";
import RichTextRenderer from "@/components/RichTextRenderer";
import { useMemo, useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import Search from "@/userDefinedComponents/User/Search/Search";
import BreadCrumbTourList from "./BreadCrumbTourList";

interface Category {
    _id: string;
    name: string;
}

interface Destination {
    _id: string;
    name: string;
    country: string;
    region?: string;
    city?: string;
}

interface TourCategory {
    label: string;
    value: string;
    disable: boolean;
}

interface Discount {
    percentage: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    description: string;
    discountCode: string;
    minPurchaseAmount: number;
    maxDiscountAmount: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
}

interface Tour {
    _id: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    coverImage: string;
    category?: string | Category[];
    destination?: string;
    discount?: Discount;
    duration?: string;
    createdAt: string;
    updatedAt: string;
    tourStatus: string;
    dates?: {
        startDate: string;
        endDate: string;
        tripDuration: string;
    };
    reviews?: {
        _id: string;
        rating: number;
        comment: string;
        user: string;
        createdAt: string;
    }[];
    averageRating?: number;
    reviewCount?: number;
}

interface TourResponse {
    // Local server format
    items?: Tour[];
    nextCursor?: number;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalTours: number;
        hasNextPage: boolean;
        hasPrevPage?: boolean;
    };
    currentPage?: number;
    totalPages?: number;
    totalTours?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    
    // Production server format
    success?: boolean;
    data?: {
        tours: Tour[];
    };
    message?: string;
    
    // Direct production format
    tours?: Tour[];
}

const FrontTours = () => {

    const { data: toursData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isToursLoading, error: isToursError } = useInfiniteQuery<TourResponse, Error>({
        queryKey: ['tour'],
        queryFn: ({ pageParam = 0 }) => {
            return getTours({ pageParam: pageParam as number });
        },
        getNextPageParam: (lastPage) => {
            // Check for both structures: pagination object or direct properties
            const hasMorePages = lastPage.pagination?.hasNextPage || lastPage.hasNextPage;
            const items = lastPage.items || [];

            if (hasMorePages && items.length > 0) {
                return lastPage.nextCursor !== undefined ? Number(lastPage.nextCursor) : undefined;
            }
            return undefined;
        },
        initialPageParam: 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2 // Retry failed requests twice
    });


    const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['global-categories-approved'],
        queryFn: getAllCategories,
    });

    const { data: destinationsData, isLoading: isDestinationsLoading } = useQuery({
        queryKey: ['global-destinations-approved'],
        queryFn: getAllDestinations,
    });

    // Debug logging for global data
    useEffect(() => {
        if (categoriesData) {
            console.log('🔍 FrontTours - Categories data:', categoriesData);
            console.log('🔍 FrontTours - Categories structure:', {
                hasData: !!categoriesData?.data,
                dataType: typeof categoriesData?.data,
                isArray: Array.isArray(categoriesData?.data),
                length: categoriesData?.data?.length
            });
        }
        if (destinationsData) {
            console.log('🔍 FrontTours - Destinations data:', destinationsData);
            console.log('🔍 FrontTours - Destinations structure:', {
                hasData: !!destinationsData?.data,
                dataType: typeof destinationsData?.data,
                isArray: Array.isArray(destinationsData?.data),
                length: destinationsData?.data?.length
            });
        }
    }, [categoriesData, destinationsData]);

    // State for filtering and sorting
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortOption, setSortOption] = useState<string>("featured");
    const [selectedDestination, setSelectedDestination] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Reference for infinite scroll
    const observerRef = useRef(null);

    // Load more tours when scrolling to the bottom
    const handleObserver = useCallback((entries: Array<IntersectionObserverEntry>) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });

        const currentObserverRef = observerRef.current;
        if (currentObserverRef) {
            observer.observe(currentObserverRef);
        }

        return () => {
            if (currentObserverRef) {
                observer.unobserve(currentObserverRef);
            }
        };
    }, [handleObserver]);

    // Flatten the pages data for filtering
    // Helper function to calculate discount pricing for a tour
    const getTourPricing = (tour: Tour) => {
        let originalPrice = tour.price || 0;
        let displayPrice = originalPrice;
        let hasDiscount = false;
        let discountPercentage = 0;

        // Check sale price first (highest priority)
        const tourAny = tour as any;
        if (tourAny.saleEnabled && tourAny.salePrice) {
            hasDiscount = true;
            displayPrice = tourAny.salePrice;
            discountPercentage = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
        }
        // Check pricing options with discount
        else if (tourAny.pricingOptions && tourAny.pricingOptions.length > 0) {
            const firstOption = tourAny.pricingOptions[0];
            if (firstOption.price) {
                originalPrice = firstOption.price;
                displayPrice = firstOption.price;

                // Check if discount is enabled
                const discountData = firstOption.discount;
                if (discountData?.discountEnabled && discountData.discountDateRange) {
                    const now = new Date();
                    const discountStart = new Date(discountData.discountDateRange.from);
                    const discountEnd = new Date(discountData.discountDateRange.to);

                    // Check if discount is currently valid
                    if (now >= discountStart && now <= discountEnd) {
                        hasDiscount = true;
                        if (discountData.percentageOrPrice) {
                            // Percentage discount
                            discountPercentage = discountData.discountPercentage || 0;
                            displayPrice = originalPrice - (originalPrice * discountPercentage / 100);
                        } else {
                            // Fixed price discount
                            displayPrice = discountData.discountPrice || originalPrice;
                            discountPercentage = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
                        }
                    }
                }
            }
        }

        return { originalPrice, displayPrice, hasDiscount, discountPercentage };
    };

    const tours = useMemo(() => {
        if (!toursData?.pages) {
            return [];
        }

        // Flatten the pages and extract tours from different response formats
        const flattenedTours = toursData.pages.flatMap((page) => {
            if (!page || typeof page !== 'object') {
                return [];
            }

            const typedPage = page as unknown as TourResponse;
            
            // Handle different response formats
            if (typedPage.success && typedPage.data?.tours) {
                // Local server format: { success: true, data: { tours: [...] } }
                return typedPage.data.tours;
            } else if (typedPage.tours) {
                // Production server format: { tours: [...] }
                return typedPage.tours;
            } else if (Array.isArray(typedPage.items)) {
                // Paginated format: { items: [...] }
                return typedPage.items;
            }
            
            return [];
        });

        return flattenedTours;
    }, [toursData]);

    // Generate dynamic price ranges based on actual tour prices
    const dynamicPriceRanges = useMemo(() => {
        if (!tours.length) return [];
        
        const prices = tours.map(tour => tour.price).filter(price => price > 0);
        if (prices.length === 0) return [];
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice;
        const step = Math.ceil(range / 5); // Create 5 price ranges
        
        const ranges = [];
        for (let i = 0; i < 5; i++) {
            const min = minPrice + (i * step);
            const max = i === 4 ? maxPrice : minPrice + ((i + 1) * step) - 1;
            ranges.push({
                value: `${min}-${max}`,
                label: `$${min} - $${max}`,
                min,
                max: i === 4 ? Infinity : max
            });
        }
        
        return ranges;
    }, [tours]);

    const getPriceRangeValues = useCallback((range: string) => {
        if (range === "all") return { min: 0, max: Infinity };
        
        const dynamicRange = dynamicPriceRanges.find(r => r.value === range);
        if (dynamicRange) {
            return { min: dynamicRange.min, max: dynamicRange.max };
        }
        
        // Fallback to static ranges if dynamic ones aren't available
        switch (range) {
            case "under-25":
                return { min: 0, max: 25 };
            case "25-50":
                return { min: 25, max: 50 };
            case "50-100":
                return { min: 50, max: 100 };
            case "100-200":
                return { min: 100, max: 200 };
            case "200-plus":
                return { min: 200, max: Infinity };
            default:
                return { min: 0, max: Infinity };
        }
    }, [dynamicPriceRanges]);


    const filteredTours = useMemo(() => {
        let filtered = [...tours] as Tour[];

        if (selectedCategory !== "all") {
            filtered = filtered.filter(tour => {
                if (Array.isArray(tour.category)) {
                    return tour.category.some(cat => cat._id === selectedCategory || cat.id === selectedCategory);
                }
                return tour.category === selectedCategory;
            });
        }

        if (selectedDestination !== "all") {
            filtered = filtered.filter(tour => tour.destination === selectedDestination);
        }

        if (priceRange !== "all") {
            const { min, max } = getPriceRangeValues(priceRange);
            filtered = filtered.filter(tour => tour.price >= min && tour.price <= max);
        }

        filtered.sort((a, b) => {
            switch (sortOption) {
                case "name-asc":
                    return a.title.localeCompare(b.title);
                case "name-desc":
                    return b.title.localeCompare(a.title);
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [tours, selectedCategory, selectedDestination, priceRange, sortOption, getPriceRangeValues]);

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Page header with title */}
            <div className="banner pattern-2 relative h-[200px] flex flex-wrap w-full" style={{
                backgroundImage: `url("https://res.cloudinary.com/dmokg80lf/image/upload/v1721751420/tour-covers/s99i5i9r2fwbrjyyfjbm.jpg")`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                zIndex: 0
            }} >
                <div className="container relative mx-auto text-center flex justify-center items-center" style={{ zIndex: 2 }}>
                    <h1 className="text-3xl font-bold text-center">Tour Listing</h1>
                </div>
                <div className="showPattern"></div>
                <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }}></div>

            </div >
            {/* Breadcrumb */}
            <div className="border-b border-border">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center text-sm">
                        <BreadCrumbTourList />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main content */}
                    <div className="lg:w-3/4">
                        {/* Filter section */}
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-md border border-border">
                            <div className="font-medium text-card-foreground">Filter By</div>

                            <div className="flex-1 flex flex-wrap gap-2">
                                <div className="relative min-w-[120px]">
                                    <Select
                                        value={priceRange}
                                        onValueChange={(value) => setPriceRange(value)}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground h-10">
                                            <SelectValue placeholder="Price" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover text-popover-foreground border-border">
                                            <SelectItem value="all">All Prices</SelectItem>
                                            {dynamicPriceRanges.map((range) => (
                                                <SelectItem key={range.value} value={range.value}>
                                                    {range.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="relative min-w-[120px]">
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={(value) => setSelectedCategory(value)}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground h-10">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover text-popover-foreground border-border">
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {!isCategoriesLoading && categoriesData?.data && Array.isArray(categoriesData.data) && categoriesData.data.map((category: Category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="relative min-w-[120px]">
                                    <Select
                                        value={selectedDestination}
                                        onValueChange={(value) => setSelectedDestination(value)}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground h-10">
                                            <SelectValue placeholder="Destination" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover text-popover-foreground border-border">
                                            <SelectItem value="all">All Destinations</SelectItem>
                                            {!isDestinationsLoading && destinationsData?.data && Array.isArray(destinationsData.data) && destinationsData.data.map((destination: Destination) => (
                                                <SelectItem key={destination._id} value={destination._id}>
                                                    {destination.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="outline"
                                    className="border-border bg-muted text-foreground h-10"
                                    onClick={() => {
                                        setSelectedCategory("all");
                                        setPriceRange("all");
                                        setSelectedDestination("all");
                                        setSortOption("featured");
                                    }}
                                >
                                    Show
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === "list" ? "primary" : "outline-solid"}
                                    size="icon"
                                    className={viewMode === "list" ? "" : "text-foreground border-border"}
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "grid" ? "primary" : "outline-solid"}
                                    size="icon"
                                    className={viewMode === "grid" ? "" : "text-foreground border-border"}
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Tour listings */}
                        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                            {isToursLoading && <p className="col-span-full text-center py-8 text-muted-foreground">Loading tours...</p>}
                            {isToursError && <p className="col-span-full text-center py-8 text-primary">Error loading tours</p>}

                            {filteredTours.length === 0 && !isToursLoading && (
                                <p className="col-span-full text-center py-8 text-muted-foreground">No tours found matching your filters. Try adjusting your criteria.</p>
                            )}

                            {filteredTours.map((tour) => (
                                <div
                                    key={tour._id}
                                    className={`bg-card border border-border overflow-hidden ${viewMode === "grid" ? "rounded-md" : "flex"}`}
                                >
                                    {viewMode === "grid" ? (
                                        <>
                                            {/* Grid view layout */}
                                            <div className="relative">
                                                <Link to={`/tours/${tour._id}`}>
                                                    <img
                                                        className="w-full h-[200px] object-cover"
                                                        src={tour.coverImage}
                                                        alt={tour.title}
                                                        loading="lazy"
                                                    />
                                                </Link>

                                                {/* Offer label - only show for tours with active discounts */}
                                                {tour.discount && tour.discount.isActive ? (
                                                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 font-bold text-sm">
                                                        {tour.discount.percentage}% OFF
                                                    </div>
                                                ) : (
                                                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 font-bold text-sm">
                                                        OFFER
                                                    </div>
                                                )}

                                                {/* Duration label */}
                                                {tour.duration && (
                                                    <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-3 py-1 font-medium text-sm">
                                                        {tour.duration.toLowerCase().includes('day') ? tour.duration : `${tour.duration} Days ${Math.floor(Math.random() * 4) + 7} Nights`}
                                                    </div>
                                                )}

                                                {!tour.duration && tour.dates?.tripDuration && (
                                                    <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-3 py-1 font-medium text-sm">
                                                        {tour.dates.tripDuration.toLowerCase().includes('day') ? tour.dates.tripDuration : `${tour.dates.tripDuration} Days ${Math.floor(Math.random() * 4) + 7} Nights`}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tour details - Grid view */}
                                            <div className="p-4">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-2 text-card-foreground">
                                                        <Link to={`/tours/${tour._id}`} className="hover:text-primary">
                                                            {tour.title}
                                                        </Link>
                                                    </h3>

                                                    {/* Availability */}
                                                    {tour.dates && (
                                                        <div className="flex items-center gap-1 text-sm mb-2">
                                                            <span className="text-muted-foreground">Availability:</span>
                                                            <span className="text-foreground">
                                                                Jan 18' - Dec 16'
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Description */}
                                                    <div className="text-muted-foreground text-sm mb-4">
                                                        {tour.description && (
                                                            <RichTextRenderer
                                                                content={tour.description}
                                                                className="line-clamp-2"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm mb-4">
                                                        {Array.isArray(tour.category) && tour.category.length > 0 && tour.category.map((category: TourCategory) => (
                                                            <span key={category.value} className="line-clamp-2 mr-2 inline-block bg-secondary px-2 py-0.5 rounded-sm">{category.label}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price and action */}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= (tour.averageRating || 0) ? 'text-yellow-400' : 'text-muted'} fill-current`}
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                                </svg>
                                                            ))}
                                                            <span className="ml-1 text-xs text-muted-foreground">({tour.reviewCount || 0})</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {(() => {
                                                                const { originalPrice, displayPrice, hasDiscount, discountPercentage } = getTourPricing(tour);
                                                                return hasDiscount ? (
                                                                    <>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm line-through text-muted-foreground">
                                                                                ${originalPrice.toFixed(0)}
                                                                            </span>
                                                                            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                                                                -{discountPercentage}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="font-bold text-xl text-green-600 ml-2">${displayPrice.toFixed(0)}</div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="text-muted-foreground text-sm mr-2">
                                                                            From
                                                                        </div>
                                                                        <div className="font-bold text-xl text-primary">${displayPrice.toFixed(0)}</div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/tours/${tour._id}`}
                                                        className="bg-primary text-primary-foreground px-4 py-2 font-bold hover:bg-primary/90"
                                                    >
                                                        MORE INFO
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* List view layout - Left column with image */}
                                            <div className="relative w-1/3">
                                                <Link to={`/tours/${tour._id}`}>
                                                    <img
                                                        className="w-full h-[200px] object-cover"
                                                        src={tour.coverImage}
                                                        alt={tour.title}
                                                        loading="lazy"
                                                    />
                                                </Link>

                                                {/* Offer label - only show for tours with active discounts */}
                                                {tour.discount && tour.discount.isActive ? (
                                                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 font-bold text-sm">
                                                        {tour.discount.percentage}% OFF
                                                    </div>
                                                ) : (
                                                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 font-bold text-sm">
                                                        OFFER
                                                    </div>
                                                )}


                                            </div>

                                            {/* Middle column with tour details */}
                                            <div className="p-4 flex-1">
                                                <h3 className="font-bold text-lg mb-1 text-card-foreground">
                                                    <Link to={`/tours/${tour._id}`} className="hover:text-primary">
                                                        {tour.title}
                                                    </Link>
                                                </h3>

                                                {/* Duration label */}
                                                {tour.duration && (
                                                    <div className="">
                                                        {tour.duration.toLowerCase().includes('day') ? tour.duration : `${tour.duration} Days ${Math.floor(Math.random() * 4) + 7} Nights`}
                                                    </div>
                                                )}

                                                {!tour.duration && tour.dates?.tripDuration && (
                                                    <div className="">
                                                        {tour.dates.tripDuration.toLowerCase().includes('day') ? tour.dates.tripDuration : `${tour.dates.tripDuration} Days ${Math.floor(Math.random() * 4) + 7} Nights`}
                                                    </div>
                                                )}

                                                {/* Availability */}
                                                <div className="flex items-center gap-1 text-sm mb-2">
                                                    <span className="text-muted-foreground flex items-center">
                                                        <svg className="w-4 h-4 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm14-7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
                                                        </svg>
                                                        Availability:
                                                    </span>
                                                    <span className="text-foreground">Jan 18' - Dec 16'</span>
                                                </div>

                                                {/* Description */}
                                                <div className="text-muted-foreground text-sm">
                                                    {tour.description && (
                                                        <RichTextRenderer
                                                            content={tour.description}
                                                            className="line-clamp-3"
                                                        />
                                                    )}
                                                </div>

                                                <div className="text-muted-foreground text-sm mb-4">
                                                    {Array.isArray(tour.category) && tour.category.length > 0 && tour.category.map((category: TourCategory) => (
                                                        <span key={category.value} className="line-clamp-2 mr-2 inline-block bg-secondary px-2 py-0.5 rounded-sm">{category.label}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right column with ratings, price and button */}
                                            <div className="p-4 text-center border-l border-border flex flex-col justify-between items-center w-1/4">
                                                <div className="w-full text-center">
                                                    {/* Price display */}
                                                    {(() => {
                                                        const { originalPrice, displayPrice, hasDiscount, discountPercentage } = getTourPricing(tour);
                                                        return hasDiscount ? (
                                                            <>
                                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                                    <span className="text-sm line-through text-muted-foreground">
                                                                        ${originalPrice.toFixed(0)}
                                                                    </span>
                                                                    <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                                                                        -{discountPercentage}%
                                                                    </span>
                                                                </div>
                                                                <div className="text-muted-foreground text-sm mb-1 text-center">From</div>
                                                                <div className="font-bold text-xl text-green-600 mb-3 text-center">${displayPrice.toFixed(0)}</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-muted-foreground text-sm mb-1 text-center">From</div>
                                                                <div className="font-bold text-xl text-primary mb-3 text-center">${displayPrice.toFixed(0)}</div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Star ratings */}
                                                <div className="flex items-center justify-center mb-3">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= (tour.averageRating || 0) ? 'text-yellow-400' : 'text-muted'} fill-current`}
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                        </svg>
                                                    ))}
                                                    <span className="ml-1 text-xs text-muted-foreground">({tour.reviewCount || 0})</span>
                                                </div>

                                                <Link
                                                    to={`/tours/${tour._id}`}
                                                    className="bg-primary text-primary-foreground px-4 py-2 font-bold hover:bg-primary/90 text-center w-full"
                                                >
                                                    MORE INFO
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {/* Infinite scroll loading indicator */}
                            <div
                                ref={observerRef}
                                className="col-span-full flex justify-center py-8"
                            >
                                {isFetchingNextPage && (
                                    <div className="flex items-center justify-center">
                                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                        <span className="ml-2 text-muted-foreground">Loading more tours...</span>
                                    </div>
                                )}
                                {!hasNextPage && filteredTours.length > 0 && (
                                    <div className="text-muted-foreground">No more tours to load</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar with search */}
                    <div className="lg:w-1/4">
                        <div className="bg-card sticky top-20 p-6 rounded border border-border">
                            <Search />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontTours;