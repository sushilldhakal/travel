import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import './MenuBarSearch.css';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryData, Tour, TourData } from "@/Provider/types";
import { getCategories, getLatestTours, searchTours } from "@/http/api"; // Adjust API function
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { debounce } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const MenuBarSearch = ({ handleSearch, headerSearch }: { handleSearch: () => void, headerSearch: boolean }) => {

    const searchRef = useRef<HTMLDivElement | null>(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const selectRef = useRef<HTMLDivElement | null>(null);
    const [title, setTitle] = useState(''); // State for input title
    const [selectedCategory, setSelectedCategory] = useState(''); // State for selected category
    const [sortedTours, setSortedTours] = useState<Tour[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false); // State to manage view

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const { data: latestTours } = useQuery({
        queryKey: ['tours'],
        queryFn: getLatestTours,
    });
    console.log("latestTours", latestTours)
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeSearch = (e: MouseEvent) => {
        e.preventDefault();
        clearSearch();
        handleSearch();
    };

    // Handle form submit

    const searchMutation = useMutation({
        mutationFn: (query: string) => searchTours(query),
        retry: 3, // Number of retry attempts
        retryDelay: 5000, // Delay between retry
        onSuccess: (data) => {
            // Invalidate and refetch
            setSortedTours(data);
            setShowSearchResults(true);
            console.log("data", data);
        },
        onError: (error) => {
            console.error("Error getting tour:", error.message);
            toast({
                title: "Search Error",
                description: `An error occurred: ${error.message}`,
            });
        }
    });

    // Debounce the search function
    const handleSearchDebounced = useRef(debounce((query: string) => {
        searchMutation.mutate(query);
    }, 1000)).current;

    // Handle input changes directly
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        const query = buildQuery(newTitle, selectedCategory);
        handleSearchDebounced(query);
    };

    // Handle category selection
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        const query = buildQuery(title, category);
        searchMutation.mutate(query);
    };

    // Build query string
    const buildQuery = (title: string, category: string) => {
        const query = new URLSearchParams();
        if (title) query.append('name', title);
        if (category) query.append('category', category);
        return query.toString();
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = buildQuery(title, selectedCategory);
        try {
            await searchMutation.mutateAsync(query);
        } catch (error) {
            toast({
                title: "Failed to search tour",
                description: `An error occurred while searching for the tour. Please try again later.${error}`,
            });
        }
    };

    const clearSearch = () => {
        setTitle('');
        setSelectedCategory('');
        setShowSearchResults(false);
    };
    const sortedToursByDate = showSearchResults
        ? sortedTours?.data.tours?.sort((a: { updatedAt: string }, b: { updatedAt: string }) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3)
        : latestTours?.data.tours?.sort((a: { updatedAt: string }, b: { updatedAt: string }) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);
    console.log("sortedTours", sortedTours)
    return (
        <>
            <div ref={searchRef} id="search" className={`cd-main-search fixed h-[76px] left-0 right-0 w-full bg-secondary transition-all duration-500 ease-in-out ${headerSearch ? 'visibilty-visible opacity-100 z-10 top-0' : 'visibilty-hidden opacity-0 h-0 z-0 top-[-400px]'} `}>
                <form onSubmit={handleSubmit} className="bg-dark h-full mx-auto max-w-7xl relative">
                    <Input
                        className="pr-60 text-primary h-full text-xl bg-transparent leading-10 focus-visible:ring--offset-0 focus-visible:ring-0 focus-visible:outline-none box-shadow-none"
                        type="search"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Search tours by name"
                    />
                    <div ref={selectRef} className="cd-select flex absolute right-10 top-[50%] bottom-auto translate-y-[-50%]">
                        <span className="mt-2 mr-3">in</span>
                        <Select onValueChange={(value) => handleCategorySelect(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value={null}>
                                        Select all Category
                                    </SelectItem>
                                    {categories?.data.categories && categories?.data.categories.map((category: CategoryData) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <button
                            type="submit" // Change to submit
                            className="cd-search-trigger cd-text-replace ml-3 bg-primary text-secondary h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <Search />
                        </button>
                        <button
                            type="button" // Button to close
                            className="cd-search-trigger cd-text-replace ml-3"
                            onClick={(e) => {
                                closeSearch(e);
                            }}
                        >
                            <X />
                        </button>
                    </div>
                </form>

                <div className={`cd-search-suggestions grid grid-flow-col transition-all duration-500 ease-in-out grid-cols-12 px-5 py-2 relative mx-auto max-w-7xl bg-secondary`}>
                    <div className={`news col-span-10 `}>
                        <h3 className="mb-5 letter-spacing">Tours</h3>
                        {
                            searchMutation.isPending &&
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        }
                        <ul>
                            {sortedToursByDate && sortedToursByDate.length === 0 && <p>No tours found</p>}

                            {sortedToursByDate && sortedToursByDate.map((tour: Tour) => (
                                <li className="flex relative flex-col pl-[100px] mb-5 items-start" key={tour._id}>
                                    <Link className="image-wrapper pr-5 absolute left-0 top-0" to={`/tours/${tour._id}`}>
                                        <img className="w-20 h-15" src={tour.coverImage} alt="News image" />
                                    </Link>
                                    <h4>
                                        <Link className="cd-nowrap" to={`/tours/${tour._id}`}>
                                            {tour.title}
                                        </Link>
                                    </h4>
                                    <time dateTime={tour.updatedAt} className="text-xs mt-1">{formatDate(tour.updatedAt)}</time>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="quick-links col-span-2 col-end-13 text-right">
                        <h3 className="mb-3">Quick Links</h3>
                        <ul>
                            <li className="mb-2"><Link to={'#'}>Find a Destination</Link></li>
                            <li className="mb-2"><Link to={'#'}>FAQ's</Link></li>
                            <li className="mb-2"><Link to={'#'}>Support</Link></li>
                            <li className="mb-2"><Link to={'#'}>Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MenuBarSearch;
