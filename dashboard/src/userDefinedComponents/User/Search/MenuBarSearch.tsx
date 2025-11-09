import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import './MenuBarSearch.css';
import { useMutation, useQuery } from "@tanstack/react-query";
import { CategoryData, Tour } from "@/Provider/types";
import { getAllCategories, getLatestTours, searchTours } from "@/http"; // Adjust API function
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { debounce } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const MenuBarSearch = ({ handleSearch, headerSearch }: { handleSearch: () => void, headerSearch: boolean }) => {

    const searchRef = useRef<HTMLDivElement | null>(null);
    const selectRef = useRef<HTMLDivElement | null>(null);
    const [title, setTitle] = useState(''); // State for input title
    const [selectedCategory, setSelectedCategory] = useState(''); // State for selected category
    const [sortedTours, setSortedTours] = useState<Record<string, unknown> | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false); // State to manage view
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);

    const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
        queryKey: ['global-categories-approved'],
        queryFn: getAllCategories,
    });

    // Debug logging for categories
    useEffect(() => {
        if (categories) {
            console.log('🔍 MenuBarSearch - Categories data:', categories);
            console.log('🔍 MenuBarSearch - Categories structure:', {
                hasData: !!categories?.data,
                dataType: typeof categories?.data,
                isArray: Array.isArray(categories?.data),
                length: categories?.data?.length
            });
        }
        if (categoriesError) {
            console.error('❌ MenuBarSearch - Categories error:', categoriesError);
        }
    }, [categories, categoriesError]);

    const { data: latestTours } = useQuery({
        queryKey: ['tours'],
        queryFn: getLatestTours,
    });

    useEffect(() => {
        const handleResize = () => {
            // Window resize logic if needed in the future
        };

        const checkHeaderFixed = () => {
            const header = document.getElementById('main-header');
            if (header) {
                setIsHeaderFixed(header.classList.contains('fixed'));
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', checkHeaderFixed);

        // Initial check
        checkHeaderFixed();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', checkHeaderFixed);
        };
    }, []);

    // Handle form submit
    const searchMutation = useMutation({
        mutationFn: (query: string) => searchTours(query),
        retry: 3, // Number of retry attempts
        retryDelay: 5000, // Delay between retry
        onSuccess: (data) => {


            // Check if any tours match the selected category
            if (selectedCategory && data?.data?.tours) {
                const matchingTours = data.data.tours.filter((tour: Record<string, unknown>) => {
                    return tour.category && Array.isArray(tour.category) &&
                        tour.category.some((cat: Record<string, unknown>) => cat.value === selectedCategory);
                });
                console.log(`Category matches: ${matchingTours.length}/${data.data.tours.length} for ID: ${selectedCategory}`);
                console.log('First tour categories:', data.data.tours[0]?.category);
            }

            setSortedTours(data);
            setShowSearchResults(true);
        },
        onError: (error: Error | unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error getting tour:", errorMessage);
            toast({
                title: "Search Error",
                description: `An error occurred: ${errorMessage}`,
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
        const selectedCat = category === 'all' ? '' : category;
        setSelectedCategory(selectedCat);
        const query = buildQuery(title, selectedCat);
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
        } catch (error: unknown) {
            toast({
                title: "Failed to search tour",
                description: `An error occurred while searching for the tour. Please try again later.${error.message}`,
            });
        }
    };

    const clearSearch = () => {
        setTitle('');
        setSelectedCategory('');
        setShowSearchResults(false);
    };

    // Properly handle search results vs latest tours
    const sortedToursByDate = showSearchResults && sortedTours?.data?.tours
        ? sortedTours.data.tours
            .sort((a: { updatedAt: string }, b: { updatedAt: string }) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3)
        : latestTours?.data?.tours
            ?.sort((a: { updatedAt: string }, b: { updatedAt: string }) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3);

    return (
        <>
            <div ref={searchRef} id="search" className={`cd-main-search fixed ${isHeaderFixed ? 'h-[66px]' : 'h-[106px]'} left-0 right-0 w-full bg-secondary shadow-md transition-all duration-500 ease-in-out ${headerSearch ? 'visibilty-visible opacity-100 z-50 top-0' : 'visibilty-hidden opacity-0 h-0 z-0 top-[-400px]'}`}>
                <form onSubmit={handleSubmit} className="bg-secondary h-full mx-auto max-w-8xl relative">
                    <Input
                        className="pr-60 text-primary h-full w-full text-xl bg-transparent leading-10 focus-visible:ring--offset-0 focus-visible:ring-0 focus-visible:outline-hidden box-shadow-none border-0 text-white placeholder:text-gray-400"
                        type="search"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Search tours by name"
                    />
                    <div className="md:hidden cd-select 
                    flex z-10
                    absolute 
                    md:max-md:flex
                    max-md:right-3 
                    max-md:top-[50%] 
                    max-md:bottom-auto 
                    max-md:translate-y-[-50%] ">
                        <button
                            type="submit"
                            className="cd-search-trigger cd-text-replace ml-3 bg-primary text-secondary h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <Search />
                        </button>
                        <button
                            type="button"
                            className="cd-search-trigger cd-text-replace ml-3"
                            onClick={() => {
                                clearSearch();
                                handleSearch();
                            }}
                        >
                            <X />
                        </button>
                    </div>
                    <div ref={selectRef} className="
                    cd-select 
                    flex z-10
                    absolute 
                    md:right-3 
                    md:top-[50%] 
                    md:bottom-auto 
                    md:translate-y-[-50%] 
                   max-md:pl-[70px]"
                    >
                        <span className="mt-2 mr-3">in</span>
                        <Select onValueChange={(value) => handleCategorySelect(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Select all Category
                                    </SelectItem>
                                    {categoriesLoading ? (
                                        <SelectItem value="loading" disabled>
                                            Loading categories...
                                        </SelectItem>
                                    ) : categories?.data && Array.isArray(categories.data) ? (
                                        categories.data.map((category: CategoryData) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="error" disabled>
                                            No categories available
                                        </SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <button
                            type="submit"
                            className="cd-search-trigger hidden md:flex cd-text-replace ml-3 bg-primary text-secondary h-10 w-10 rounded-full flex items-center justify-center"
                        >
                            <Search />
                        </button>
                        <button
                            type="button"
                            className="cd-search-trigger hidden md:flex justify-center items-center cd-text-replace ml-3"
                            onClick={() => {
                                clearSearch();
                                handleSearch();
                            }}
                        >
                            <X />
                        </button>
                    </div>
                </form>

                {headerSearch && (
                    <div className="cd-search-suggestions grid grid-flow-col transition-all duration-500 ease-in-out grid-cols-12 px-5 py-2 relative mx-auto max-w-8xl bg-secondary">
                        <div className="news col-span-9">
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

                        <div className="quick-links col-span-3 col-end-13 text-right hidden md:flex flex-row flex-col">
                            <ul>
                                <li><h3 className="mb-3">Quick Links</h3></li>
                                <li className="mb-2"><Link to={'#'}>Find a Destination</Link></li>
                                <li className="mb-2"><Link to={'#'}>FAQ's</Link></li>
                                <li className="mb-2"><Link to={'#'}>Support</Link></li>
                                <li className="mb-2"><Link to={'#'}>Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MenuBarSearch;
