import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSingleTour,
    getTourReviews,
    addReview,
    addReviewReply,
    likeReview,
    getLatestTours,
    incrementReviewView,
    incrementReplyView,
    likeReply
} from "@/http";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Info, Star, Home, ChevronRight, ChevronLeft, MessageSquare, Phone, Heart, Eye, MessageCircleQuestion, AlertCircle, Play, Video, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import RichTextRenderer from '@/components/RichTextRenderer';
import Icon from "@/userDefinedComponents/Icon";
import { toast } from '@/components/ui/use-toast';
import useTokenStore from '@/store/store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FactData, FaqData, GalleryDocument, GalleryItem, Itinerary, Review, Tour, TourData } from "@/Provider/types";
import FrontBooking from '@/userDefinedComponents/User/Booking/FrontBooking';

// Helper function to format price
const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
};

// Calculate total price
const calculateTotalPrice = (tourData: Tour | undefined) => {
    if (!tourData) return 0;
    const basePrice = tourData.price;
    const adultPrice = basePrice * 1;
    const childrenPrice = basePrice * 0 * 0.7; // 30% discount for children
    return adultPrice + childrenPrice;
};

// Helper function to detect video files based on URL extension or path
const isVideo = (url: string): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv'];
    const urlLower = url.toLowerCase();
    const isVideoInPath = urlLower.includes('/video/') || urlLower.includes('/video_upload/');
    const hasVideoExtension = videoExtensions.some(ext => urlLower.endsWith(ext));
    return isVideoInPath || hasVideoExtension;
};

// Helper function to render fact value based on its type
const renderFactValue = (fact: FactData) => {
    if (!fact.value) return '';

    // Handle Plain Text facts (value is a direct string)
    if (fact.field_type === 'Plain Text') {
        if (typeof fact.value === 'string') {
            return fact.value;
        } else if (Array.isArray(fact.value) && fact.value.length > 0) {
            return String(fact.value[0]);
        }
    }

    // Handle Multi Select facts (value is an array of strings)
    if (fact.field_type === 'Multi Select') {
        if (Array.isArray(fact.value)) {
            // If array contains strings, join them
            if (fact.value.every((item: any) => typeof item === 'string')) {
                return (fact.value as string[]).join(', ');
            }
            // If array contains objects with label/value properties
            if (fact.value.length > 0 && typeof fact.value[0] === 'object') {
                return (fact.value as Array<{ label?: string; value?: string }>)
                    .map(item => item.label || item.value || String(item))
                    .join(', ');
            }
        }
    }

    // Handle Single Select facts (value is array with one string)
    if (fact.field_type === 'Single Select') {
        if (Array.isArray(fact.value) && fact.value.length > 0) {
            // If it's a string in an array
            if (typeof fact.value[0] === 'string') {
                return (fact.value as string[])[0];
            }
            // If it's an object with label/value
            if (typeof fact.value[0] === 'object' && fact.value[0] !== null) {
                const item = (fact.value as Array<{ label?: string; value?: string }>)[0];
                return item.label || item.value || String(item);
            }
        }
    }

    // Default fallback - try to convert to string
    if (Array.isArray(fact.value)) {
        return (fact.value as any[]).map(v => String(v)).join(', ');
    }

    return String(fact.value);
};

// Function to render appropriate icon for each fact
const renderFactIcon = (iconName: string | undefined) => {
    if (!iconName) return <Info className="w-5 h-5" />;

    // Use the Icon component to dynamically render the icon
    return <Icon name={iconName} size={20} />;
};

// Helper function to format date
const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not specified';

    try {
        const date = new Date(dateString);

        // Function to add ordinal suffix to day (1st, 2nd, 3rd, etc.)
        const getOrdinalSuffix = (day: number) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        const day = date.getDate();
        const suffix = getOrdinalSuffix(day);

        // Format: "18th Aug 2025"
        return `${day}${suffix} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
};

// Helper function to format time
const formatTime = (dateString: string) => {
    if (!dateString) return 'Time not specified';

    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("Error formatting time:", e);
        return dateString;
    }
};

const FrontSingleTours = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = useTokenStore(state => state.token);

    const { data: tourResponse, isLoading, isError } = useQuery({
        queryKey: ['tour', tourId],
        queryFn: () => getSingleTour(tourId || ''),
        enabled: !!tourId
    });
    const { data: latestTours } = useQuery({
        queryKey: ['latestTours'],
        queryFn: getLatestTours
    });

    // Fetch reviews separately to allow for easier refetching after adding a review
    const { data: reviewsData, refetch: refetchReviews } = useQuery({
        queryKey: ['tourReviews', tourId],
        queryFn: () => getTourReviews(tourId || '', 'approved'),
        enabled: !!tourId
    });

    // Extract the tour data from the nested structure
    const tourData = tourResponse?.data?.tour;

    console.log("tour response", tourData)

    // FAQ state is now handled by Accordion component
    const [currentSlide, setCurrentSlide] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const [activeDay, setActiveDay] = useState<string[]>(["day-0"])
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // For reviews and comments functionality
    const [rating, setRating] = useState<number>(5);
    const [commentText, setCommentText] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // For departure dates pagination and filtering
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [currentDeparturePage, setCurrentDeparturePage] = useState(1);
    const departuresPerPage = 6;

    // FAQ expansion is now handled by Accordion component

    // Handle thumbnail click to navigate to a specific slide
    const handleThumbnailClick = (index: number) => {
        if (api) {
            api.scrollTo(index);
            setCurrentSlide(index);
        }
    };

    // Update current slide when carousel changes
    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrentSlide(api.selectedScrollSnap());
        };

        api.on("select", onSelect);

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    // Check for mobile screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Add review mutation
    const addReviewMutation = useMutation({
        mutationFn: (reviewData: { rating: number; comment: string }) => {
            return addReview(tourId || '', reviewData.rating, reviewData.comment);
        },
        onSuccess: () => {
            toast({
                title: "Review submitted",
                description: "Your review has been submitted and is pending approval.",
            });
            setCommentText("");
            setRating(5);
            // Refetch reviews to update the list
            refetchReviews();
            // Invalidate tour data to update the average rating
            queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit review. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Add reply mutation
    const addReplyMutation = useMutation({
        mutationFn: (data: { reviewId: string; comment: string }) => {
            return addReviewReply(tourId || '', data.reviewId, data.comment);
        },
        onSuccess: () => {
            toast({
                title: "Reply submitted",
                description: "Your reply has been added successfully.",
            });
            setReplyText("");
            setReplyTo(null);
            // Refetch reviews to update the list
            refetchReviews();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit reply. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Like review mutation
    const likeReviewMutation = useMutation({
        mutationFn: (reviewId: string) => {
            return likeReview(tourId || '', reviewId);
        },
        onSuccess: () => {
            // Refetch reviews to update the like count
            refetchReviews();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to like review. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Like reply mutation
    const likeReplyMutation = useMutation({
        mutationFn: (replyId: string) => {
            return likeReply(tourId || '', replyId);
        },
        onSuccess: () => {
            // Refetch reviews to update the like count
            refetchReviews();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to like reply. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Increment review view mutation
    const incrementReviewViewMutation = useMutation({
        mutationFn: (reviewId: string) => {
            return incrementReviewView(tourId || '', reviewId);
        },
        onSuccess: () => {
            // Refetch reviews to update the view count
            refetchReviews();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to increment review view. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Increment reply view mutation
    const incrementReplyViewMutation = useMutation({
        mutationFn: (replyId: string) => {
            return incrementReplyView(tourId || '', replyId);
        },
        onSuccess: () => {
            // Refetch reviews to update the view count
            refetchReviews();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to increment reply view. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Handle review submission
    const handleSubmitReview = () => {
        if (!token) {
            toast({
                title: "Authentication required",
                description: "Please sign in to submit a review.",
                variant: "destructive",
            });
            return;
        }

        if (!commentText.trim()) {
            toast({
                title: "Error",
                description: "Please write a review comment.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        addReviewMutation.mutate({ rating, comment: commentText });
    };

    // Handle reply submission
    const handleSubmitReply = () => {
        if (!token) {
            toast({
                title: "Authentication required",
                description: "Please sign in to reply to reviews.",
                variant: "destructive",
            });
            return;
        }

        if (!replyTo || !replyText.trim()) {
            return;
        }

        setSubmitting(true);
        addReplyMutation.mutate({ reviewId: replyTo, comment: replyText });
    };

    // Handle like review
    const handleLikeReview = (reviewId: string) => {
        if (!token) {
            toast({
                title: "Authentication required",
                description: "Please sign in to like reviews.",
                variant: "destructive",
            });
            return;
        }

        likeReviewMutation.mutate(reviewId);
    };

    // Handle like reply
    const handleLikeReply = (replyId: string) => {
        if (!token) {
            toast({
                title: "Authentication required",
                description: "Please sign in to like replies.",
                variant: "destructive",
            });
            return;
        }

        likeReplyMutation.mutate(replyId);
    };

    // Handle increment review view
    const handleIncrementReviewView = (reviewId: string) => {
        incrementReviewViewMutation.mutate(reviewId);
    };

    // Handle increment reply view
    const handleIncrementReplyView = (replyId: string) => {
        incrementReplyViewMutation.mutate(replyId);
    };

    // Navigate to login page
    const navigateToLogin = () => {
        navigate('/auth/login');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h2 className="text-2xl font-semibold">Loading tour details...</h2>
                </div>
            </div>
        );
    }

    if (isError || !tourData) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20 inline-block">
                    <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Tour</h2>
                    <p className="text-muted-foreground">Unable to load tour details. Please try again later.</p>
                    <Link to="/tours" className="mt-4 inline-block">
                        <Button variant="outline" className="mt-4">
                            Back to Tours
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Full width banner */}
            <div className="w-full pattern-2 h-[300px] relative">
                {/* Base layer: Image */}
                <img
                    src={tourData.coverImage}
                    alt={tourData.title}
                    className="w-full h-full object-cover object-center"
                />

                {/* Middle layer: Pattern overlays */}
                <div className="showPattern absolute inset-0" style={{ pointerEvents: 'none' }}></div>
                <div className="absolute inset-0 bg-black/30" style={{ pointerEvents: 'none' }}></div>

                {/* Top layer: Content with highest z-index */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{tourData.title}</h1>
                        <div className="flex items-center justify-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <span className="text-lg">
                                {typeof tourData.location === 'string'
                                    ? tourData.location
                                    : `${tourData.location?.city || ''}, ${tourData.location?.country || ''}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-muted py-3">
                <div className="container mx-auto px-4">

                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                                    <Home className="w-4 h-4 mr-2" />
                                    Home
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    <Link to="/tours" className="ml-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                                        Tours
                                    </Link>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    <span className="ml-1 text-sm font-medium text-foreground">
                                        {tourData.title}
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tour details - 2/3 width on large screens */}
                    <div className="lg:col-span-2">
                        {/* Tour Title and Code - Title on left, Code on right */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h2 className="text-3xl font-bold">{tourData.title}</h2>
                                <div className="text-right">
                                    <span className="font-semibold">Code: </span>
                                    <span className="text-primary font-mono uppercase">{tourData.code}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tour Facts */}
                        <div className="bg-card border border-border rounded-lg p-6 mb-8">
                            <h2 className="text-2xl font-bold mb-4">Tour Facts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tourData.facts?.map((fact: FactData, index: number) => (
                                    <div key={index} className="flex items-start">
                                        <div className="mr-3 text-primary">
                                            {renderFactIcon(fact.icon)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{fact.title}: <span className="text-sm text-muted-foreground">
                                                {renderFactValue(fact)}
                                            </span></h3>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Gallery Slider */}
                        <div className="mb-8">
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="text-2xl font-bold mb-4">Gallery</h2>

                                {/* Main Carousel */}
                                <div className="mb-4">
                                    <Carousel setApi={setApi} className="w-full">
                                        <CarouselContent>
                                            {/* Cover image as first slide */}
                                            <CarouselItem>
                                                <div className="aspect-video w-full overflow-hidden rounded-md">
                                                    <img
                                                        src={tourData.coverImage}
                                                        alt={tourData.title}
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                            </CarouselItem>

                                            {/* Gallery images and videos */}
                                            {tourData.gallery?.map((item: GalleryItem, index: number) => (
                                                <CarouselItem key={index}>
                                                    <div className="aspect-video w-full overflow-hidden rounded-md">
                                                        {isVideo(item.image) ? (
                                                            <div className="relative w-full h-full">
                                                                <video
                                                                    src={item.image}
                                                                    className="w-full h-full object-cover"
                                                                    controls
                                                                    autoPlay
                                                                    muted
                                                                    playsInline
                                                                />
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={item.image}
                                                                alt={item.alt || `Gallery image ${index + 1}`}
                                                                className="w-full h-full object-cover object-center"
                                                            />
                                                        )}
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                    </Carousel>
                                </div>

                                {/* Thumbnails Carousel */}
                                <div className="mt-4">
                                    <Carousel
                                        opts={{
                                            align: "start",
                                            containScroll: "trimSnaps",
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent className="flex gap-2">
                                            {/* Cover image thumbnail */}
                                            <CarouselItem
                                                className={cn(
                                                    "basis-1/5 cursor-pointer",
                                                    isMobile ? "basis-1/3" : "basis-1/5",
                                                )}
                                                onClick={() => handleThumbnailClick(0)}
                                            >
                                                <div
                                                    className={cn(
                                                        "relative aspect-video w-full overflow-hidden rounded-md border-2",
                                                        currentSlide === 0 ? "border-primary" : "border-transparent",
                                                    )}
                                                >
                                                    <img
                                                        src={tourData.coverImage}
                                                        alt="Cover image"
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                            </CarouselItem>

                                            {/* Gallery thumbnails */}
                                            {tourData.gallery?.map((item: GalleryItem, index: number) => (
                                                <CarouselItem
                                                    key={index}
                                                    className={cn(
                                                        "basis-1/5 cursor-pointer",
                                                        isMobile ? "basis-1/3" : "basis-1/5",
                                                    )}
                                                    onClick={() => handleThumbnailClick(index + 1)}
                                                >
                                                    <div
                                                        className={cn(
                                                            "relative aspect-video w-full overflow-hidden rounded-md border-2",
                                                            currentSlide === index + 1 ? "border-primary" : "border-transparent",
                                                        )}
                                                    >
                                                        {isVideo(item.image) ? (
                                                            <div className="aspect-video w-full relative group">
                                                                <video
                                                                    src={item.image}
                                                                    className="w-full h-full object-cover"
                                                                    muted
                                                                    playsInline
                                                                />
                                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                                                    <Play className="h-8 w-8 text-white opacity-80 group-hover:opacity-100" />
                                                                </div>
                                                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <Video className="h-2 w-2" />
                                                                    <span className="text-[10px]">Video</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={item.image}
                                                                alt={item.alt || `Thumbnail ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                    </Carousel>
                                </div>
                            </div>
                        </div>
                        {/* Tabs */}
                        <div className="mb-8">
                            <Tabs defaultValue="description">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="description">Description</TabsTrigger>
                                    <TabsTrigger value="itinerary">Itinerary and Direction</TabsTrigger>
                                    <TabsTrigger value="priceDates">Price and Dates</TabsTrigger>
                                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
                                </TabsList>
                                <TabsContent value="description" className="mt-4">
                                    <div className="bg-card border border-border rounded-lg p-6">
                                        <h2 className="text-2xl font-bold mb-4">Description</h2>
                                        <RichTextRenderer content={tourData.description || ''} />

                                        {/* What's Included & Excluded Section */}
                                        <div className="mt-8 pt-6 border-t border-border">
                                            <h3 className="text-xl font-semibold mb-6 text-primary">What's Included & Excluded</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* What's Included */}
                                                <div className="bg-primary/5 p-5 rounded-lg border border-primary/10">
                                                    <h3 className="text-xl font-semibold mb-4 flex items-center text-primary">
                                                        <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">✓</span>
                                                        What's Included
                                                    </h3>
                                                    <RichTextRenderer content={tourData.include || 'No inclusion information available.'} />
                                                </div>

                                                {/* What's Excluded */}
                                                <div className="bg-destructive/5 p-5 rounded-lg border border-destructive/10">
                                                    <h3 className="text-xl font-semibold mb-4 flex items-center text-destructive">
                                                        <span className="bg-destructive/10 text-destructive rounded-full w-8 h-8 flex items-center justify-center mr-3">✗</span>
                                                        What's Excluded
                                                    </h3>
                                                    <RichTextRenderer content={tourData.exclude || 'No exclusion information available.'} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="itinerary" className="mt-4">
                                    <div className="bg-card border border-border rounded-lg p-6">
                                        <h2 className="text-2xl font-bold mb-4">{tourData.outline}</h2>
                                        {/* Map display */}
                                        <div className="mb-6 rounded-lg overflow-hidden border border-border">
                                            {tourData.location?.map ? (
                                                <div
                                                    className="w-full h-[500px]"
                                                    dangerouslySetInnerHTML={{ __html: tourData.location.map }}
                                                ></div>
                                            ) : (
                                                <div className="w-full h-[400px] bg-accent/20 flex items-center justify-center text-muted-foreground">
                                                    <MapPin className="w-8 h-8 mr-2" />
                                                    <span>No map available for this tour</span>
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
                                        <div className="space-y-2 relative">
                                            <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-primary z-0" />
                                            <Accordion
                                                type="multiple"
                                                value={activeDay}
                                                onValueChange={setActiveDay}
                                                className="relative space-y-4"
                                            >
                                                {tourData.itinerary?.map((day: Itinerary, index: number) => (
                                                    <AccordionItem
                                                        value={`day-${index}`}
                                                        key={index}
                                                        className="border-0 mb-2"
                                                    >
                                                        <div className="flex items-start gap-4 relative">
                                                            {/* Numbered circle */}
                                                            <div
                                                                className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center z-10 ${activeDay.includes(`day-${index}`)
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-background text-foreground border-2 border-gray-200"
                                                                    }
                `}
                                                            >
                                                                <span className="font-bold">{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <AccordionTrigger
                                                                    className="hover:bg-accent/20 py-3 px-4 rounded-md"
                                                                >
                                                                    <div className="flex items-center gap-2 text-left">
                                                                        <span className="font-medium text-base">{day.title}</span>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent className="pl-0 pt-3 pb-2 w-full">
                                                                    <div className="space-y-4 pl-6 border-l-2 border-dashed border-gray-200 ml-2">
                                                                        <div className="flex items-start gap-4">
                                                                            <Calendar className="h-5 w-5 mt-1 shrink-0 text-primary" />
                                                                            <div>
                                                                                <p className="font-medium text-sm text-foreground">
                                                                                    {day?.date ? formatDate(day.date) : 'Date not specified'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-start gap-4">
                                                                            <Clock className="h-5 w-5 mt-1 shrink-0 text-primary" />
                                                                            <div>
                                                                                <p className="font-medium text-sm text-foreground">
                                                                                    {day?.time ? formatTime(day.time) : (day?.date ? formatTime(day.date) : 'Time not specified')}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-start gap-4">
                                                                            <Info className="h-5 w-5 mt-1 shrink-0 text-primary" />
                                                                            <div className="prose dark:prose-invert max-w-none">
                                                                                <RichTextRenderer content={day.description} className="text-muted-foreground" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </AccordionContent>
                                                            </div>
                                                        </div>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="faqs" className="mt-4">
                                    <div className="bg-card border border-border rounded-lg p-6">
                                        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                                        <div className="space-y-4">
                                            {tourData.faqs?.length ? (
                                                <Accordion type="single" collapsible className="w-full">
                                                    {tourData.faqs.map((faq: FaqData, index: number) => (
                                                        <AccordionItem key={index} value={`faq-${index}`} className="border border-border rounded-lg overflow-hidden mb-3">
                                                            <div className="bg-card">
                                                                <AccordionTrigger className="hover:bg-accent/20 py-3 px-4 rounded-md">
                                                                    <div className="flex items-center gap-3 text-left w-full">
                                                                        <MessageCircleQuestion className="h-5 w-5 shrink-0 text-primary" />
                                                                        <span className="font-medium">{faq.question}</span>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent className="px-4 pt-2 pb-4">
                                                                    <div className="pl-8 text-muted-foreground">
                                                                        {faq.answer}
                                                                    </div>
                                                                </AccordionContent>
                                                            </div>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            ) : (
                                                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                                                    <MessageCircleQuestion className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-muted-foreground">No FAQs available for this tour</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="priceDates" className="mt-4">
                                    <div className="bg-card border border-border rounded-lg p-6">
                                        <h2 className="text-2xl font-bold mb-6">Pricing & Departure Dates</h2>

                                        {/* Base Pricing Section */}
                                        <div className="mb-8">
                                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                                                Base Pricing
                                            </h3>
                                            <div className="bg-muted/50 rounded-lg p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">Standard Price:</span>
                                                        <span className="text-2xl font-bold text-primary">{formatPrice(tourData.price)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">Pricing Type:</span>
                                                        <span className="font-medium">{tourData.pricePerPerson ? 'Per Person' : 'Per Group'}</span>
                                                    </div>
                                                    {!tourData.pricePerPerson && tourData.groupSize && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">Group Size:</span>
                                                            <span className="font-medium">{tourData.groupSize} people</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">Group Size Range:</span>
                                                        <span className="font-medium">{tourData.minSize} - {tourData.maxSize} people</span>
                                                    </div>
                                                </div>

                                                {/* Sale Price */}
                                                {tourData.saleEnabled && tourData.salePrice && (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                            <div>
                                                                <span className="text-sm text-muted-foreground">Sale Price:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-2xl font-bold text-green-600">{formatPrice(tourData.salePrice)}</span>
                                                                    <span className="text-sm line-through text-muted-foreground">{formatPrice(tourData.price)}</span>
                                                                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                                                        Save {Math.round(((tourData.price - tourData.salePrice) / tourData.price) * 100)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Price Lock Date */}
                                                {tourData.priceLockDate && (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>Price locked until {formatDate(tourData.priceLockDate)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Advanced Pricing Options */}
                                        {tourData.pricingOptionsEnabled && tourData.pricingGroups && tourData.pricingGroups.length > 0 && (
                                            <div className="mb-8">
                                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                                                    Pricing Options
                                                </h3>
                                                <div className="space-y-6">
                                                    {tourData.pricingGroups.map((group: any, groupIndex: number) => (
                                                        <div key={groupIndex} className="bg-muted/50 rounded-lg p-6">
                                                            <h4 className="font-semibold text-lg mb-4">{group.label}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {group.options?.map((option: any, optionIndex: number) => (
                                                                    <div key={optionIndex} className="bg-background border border-border rounded-lg p-4">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div>
                                                                                <h5 className="font-medium">{option.name}</h5>
                                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                                    {option.category === 'custom' ? option.customCategory : option.category}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-lg font-bold text-primary">
                                                                                    {formatPrice(option.price)}
                                                                                </div>
                                                                                {option.discountEnabled && option.discount && (
                                                                                    <div className="text-xs text-green-600">
                                                                                        {option.discount.percentageOrPrice
                                                                                            ? `${option.discount.discountPercentage}% off`
                                                                                            : `${formatPrice(option.discount.discountPrice)} off`
                                                                                        }
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {option.minPax} - {option.maxPax} passengers
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Departure Dates Section */}
                                        <div className="mb-8">
                                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                                <Calendar className="h-5 w-5 mr-2 text-primary" />
                                                Departure Dates
                                            </h3>

                                            {/* Tour Duration */}
                                            {tourData.tourDates && (tourData.tourDates.days || tourData.tourDates.nights) && (
                                                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <Clock className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <span className="font-medium">Tour Duration: </span>
                                                            <span className="text-muted-foreground">
                                                                {tourData.tourDates.days && `${tourData.tourDates.days} days`}
                                                                {tourData.tourDates.days && tourData.tourDates.nights && ' / '}
                                                                {tourData.tourDates.nights && `${tourData.tourDates.nights} nights`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Schedule Type Info */}
                                            {tourData.tourDates?.scheduleType && (
                                                <div className="mb-4">
                                                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                                        <Info className="h-4 w-4" />
                                                        <span className="capitalize">{tourData.tourDates.scheduleType} Schedule</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Flexible Schedule */}
                                            {tourData.tourDates?.scheduleType === 'flexible' && tourData.tourDates.defaultDateRange && (
                                                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between gap-4">
                                                        {/* Left side - Date info */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="bg-primary/10 rounded-lg p-3 text-center min-w-[70px]">
                                                                    <Calendar className="h-6 w-6 text-primary mx-auto" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-base mb-1">Flexible Departure</h4>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Choose any date between {formatDate(tourData.tourDates.defaultDateRange.from)} and {formatDate(tourData.tourDates.defaultDateRange.to)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right side - Price and Book button */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <div className="text-sm text-muted-foreground mb-1">From</div>
                                                                <div className="text-2xl font-bold text-primary">
                                                                    {formatPrice(tourData.saleEnabled && tourData.salePrice ? tourData.salePrice : tourData.price)}
                                                                </div>
                                                                {tourData.pricePerPerson && (
                                                                    <div className="text-xs text-muted-foreground">per person</div>
                                                                )}
                                                            </div>
                                                            <Button
                                                                className="whitespace-nowrap"
                                                                onClick={() => {
                                                                    // For flexible dates, set today's date or the start of the range
                                                                    const dateInput = document.getElementById('departureDate') as HTMLInputElement;
                                                                    if (dateInput && tourData.tourDates.defaultDateRange) {
                                                                        const today = new Date();
                                                                        const rangeStart = new Date(tourData.tourDates.defaultDateRange.from);
                                                                        const dateToSet = today >= rangeStart ? today : rangeStart;
                                                                        const formattedDate = dateToSet.toISOString().split('T')[0];
                                                                        dateInput.value = formattedDate;
                                                                        // Trigger change event
                                                                        const event = new Event('input', { bubbles: true });
                                                                        dateInput.dispatchEvent(event);
                                                                    }

                                                                    // Scroll to booking form
                                                                    const bookingForm = document.querySelector('.lg\\:col-span-1');
                                                                    if (bookingForm) {
                                                                        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                    }
                                                                }}
                                                            >
                                                                Book Now
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fixed/Multiple Departures - List Format */}
                                            {(tourData.tourDates?.scheduleType === 'fixed' || tourData.tourDates?.scheduleType === 'multiple' || tourData.tourDates?.scheduleType === 'recurring') &&
                                                tourData.tourDates.departures && tourData.tourDates.departures.length > 0 && (() => {
                                                    // Filter out past departures and generate recurring dates
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);

                                                    // Generate all departure instances (including recurring)
                                                    const allDepartureInstances: any[] = [];

                                                    tourData.tourDates.departures.forEach((departure: any) => {
                                                        if (departure.isRecurring && departure.recurrenceEndDate) {
                                                            // Generate recurring instances
                                                            const startDate = new Date(departure.dateRange.from);
                                                            const endDate = new Date(departure.dateRange.to);
                                                            const recurrenceEnd = new Date(departure.recurrenceEndDate);
                                                            const duration = endDate.getTime() - startDate.getTime();

                                                            let currentStart = new Date(startDate);
                                                            let instanceCount = 0;
                                                            const maxInstances = 52; // Show max 52 instances (1 year for weekly)

                                                            while (currentStart <= recurrenceEnd && instanceCount < maxInstances) {
                                                                if (currentStart >= today) {
                                                                    const currentEnd = new Date(currentStart.getTime() + duration);
                                                                    allDepartureInstances.push({
                                                                        ...departure,
                                                                        dateRange: {
                                                                            from: new Date(currentStart),
                                                                            to: currentEnd
                                                                        },
                                                                        label: `${departure.label} - ${currentStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                                    });
                                                                }

                                                                // Calculate next occurrence based on pattern
                                                                switch (departure.recurrencePattern) {
                                                                    case 'daily':
                                                                        currentStart.setDate(currentStart.getDate() + 1);
                                                                        break;
                                                                    case 'weekly':
                                                                        currentStart.setDate(currentStart.getDate() + 7);
                                                                        break;
                                                                    case 'biweekly':
                                                                        currentStart.setDate(currentStart.getDate() + 14);
                                                                        break;
                                                                    case 'monthly':
                                                                        currentStart.setMonth(currentStart.getMonth() + 1);
                                                                        break;
                                                                    case 'quarterly':
                                                                        currentStart.setMonth(currentStart.getMonth() + 3);
                                                                        break;
                                                                    case 'yearly':
                                                                        currentStart.setFullYear(currentStart.getFullYear() + 1);
                                                                        break;
                                                                    default:
                                                                        currentStart.setDate(currentStart.getDate() + 7); // Default to weekly
                                                                }
                                                                instanceCount++;
                                                            }
                                                        } else {
                                                            // Non-recurring departure
                                                            const departureDate = new Date(departure.dateRange.from);
                                                            if (departureDate >= today) {
                                                                allDepartureInstances.push(departure);
                                                            }
                                                        }
                                                    });

                                                    // Sort by date
                                                    allDepartureInstances.sort((a, b) =>
                                                        new Date(a.dateRange.from).getTime() - new Date(b.dateRange.from).getTime()
                                                    );

                                                    if (allDepartureInstances.length === 0) {
                                                        return (
                                                            <div className="text-center py-8 bg-muted/50 rounded-lg">
                                                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                                <p className="text-muted-foreground">No upcoming departure dates available. Please contact us for future schedules.</p>
                                                            </div>
                                                        );
                                                    }

                                                    // Filter by selected month
                                                    const filteredDepartures = allDepartureInstances.filter((departure: any) => {
                                                        const depDate = new Date(departure.dateRange.from);
                                                        return depDate.getMonth() === selectedMonth.getMonth() &&
                                                            depDate.getFullYear() === selectedMonth.getFullYear();
                                                    });

                                                    // Pagination
                                                    const totalPages = Math.ceil(filteredDepartures.length / departuresPerPage);
                                                    const startIndex = (currentDeparturePage - 1) * departuresPerPage;
                                                    const paginatedDepartures = filteredDepartures.slice(startIndex, startIndex + departuresPerPage);

                                                    // Get available months for the selector
                                                    const availableMonths = Array.from(new Set(
                                                        allDepartureInstances.map((d: any) => {
                                                            const date = new Date(d.dateRange.from);
                                                            return `${date.getFullYear()}-${date.getMonth()}`;
                                                        })
                                                    )).map(key => {
                                                        const [year, month] = key.split('-').map(Number);
                                                        return new Date(year, month, 1);
                                                    }).sort((a, b) => a.getTime() - b.getTime());

                                                    return (
                                                        <div className="space-y-4">
                                                            {/* Month/Year Filter */}
                                                            <div className="bg-muted/50 rounded-lg p-4">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-5 w-5 text-primary" />
                                                                        <span className="font-medium">Select Month:</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const currentIndex = availableMonths.findIndex(
                                                                                    m => m.getMonth() === selectedMonth.getMonth() &&
                                                                                        m.getFullYear() === selectedMonth.getFullYear()
                                                                                );
                                                                                if (currentIndex > 0) {
                                                                                    setSelectedMonth(availableMonths[currentIndex - 1]);
                                                                                    setCurrentDeparturePage(1);
                                                                                }
                                                                            }}
                                                                            disabled={availableMonths.findIndex(
                                                                                m => m.getMonth() === selectedMonth.getMonth() &&
                                                                                    m.getFullYear() === selectedMonth.getFullYear()
                                                                            ) === 0}
                                                                        >
                                                                            <ChevronLeft className="h-4 w-4" />
                                                                        </Button>
                                                                        <span className="min-w-[150px] text-center font-semibold">
                                                                            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                                        </span>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const currentIndex = availableMonths.findIndex(
                                                                                    m => m.getMonth() === selectedMonth.getMonth() &&
                                                                                        m.getFullYear() === selectedMonth.getFullYear()
                                                                                );
                                                                                if (currentIndex < availableMonths.length - 1) {
                                                                                    setSelectedMonth(availableMonths[currentIndex + 1]);
                                                                                    setCurrentDeparturePage(1);
                                                                                }
                                                                            }}
                                                                            disabled={availableMonths.findIndex(
                                                                                m => m.getMonth() === selectedMonth.getMonth() &&
                                                                                    m.getFullYear() === selectedMonth.getFullYear()
                                                                            ) === availableMonths.length - 1}
                                                                        >
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 text-sm text-muted-foreground text-center">
                                                                    {filteredDepartures.length} departure{filteredDepartures.length !== 1 ? 's' : ''} available in this month
                                                                </div>
                                                            </div>

                                                            {/* Departure List */}
                                                            {paginatedDepartures.length === 0 ? (
                                                                <div className="text-center py-8 bg-muted/50 rounded-lg">
                                                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                                    <p className="text-muted-foreground">No departures available for this month.</p>
                                                                    <p className="text-sm text-muted-foreground mt-2">Try selecting a different month.</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {paginatedDepartures.map((departure: any, index: number) => {
                                                                        // Calculate the price to display
                                                                        let displayPrice = tourData.price;
                                                                        let originalPrice = tourData.price;
                                                                        let hasDiscount = false;
                                                                        let discountPercentage = 0;

                                                                        // If there are selected pricing options, show the first one's price
                                                                        if (departure.selectedPricingOptions && departure.selectedPricingOptions.length > 0) {
                                                                            const firstOptionId = departure.selectedPricingOptions[0];

                                                                            // Check in pricingGroups first
                                                                            let foundOption = null;
                                                                            tourData.pricingGroups?.forEach((group: any) => {
                                                                                const found = group.options?.find((opt: any) => opt.id === firstOptionId);
                                                                                if (found) foundOption = found;
                                                                            });

                                                                            // If not found in pricingGroups, check pricingOptions array directly
                                                                            if (!foundOption && tourData.pricingOptions) {
                                                                                foundOption = tourData.pricingOptions.find((opt: any) => opt.id === firstOptionId);
                                                                            }

                                                                            if (foundOption) {
                                                                                originalPrice = foundOption.price;
                                                                                displayPrice = foundOption.price;

                                                                                // Check for discount - handle both nested and flat structure
                                                                                const discountData = foundOption.discount || {};
                                                                                const isDiscountEnabled = discountData.discountEnabled || foundOption.discountEnabled;

                                                                                if (isDiscountEnabled && discountData.discountDateRange) {
                                                                                    const now = new Date();
                                                                                    const discountStart = new Date(discountData.discountDateRange.from);
                                                                                    const discountEnd = new Date(discountData.discountDateRange.to);

                                                                                    if (now >= discountStart && now <= discountEnd) {
                                                                                        hasDiscount = true;
                                                                                        if (discountData.percentageOrPrice) {
                                                                                            // Percentage-based discount
                                                                                            discountPercentage = discountData.discountPercentage || 0;
                                                                                            const discountAmount = (foundOption.price * discountPercentage) / 100;
                                                                                            displayPrice = foundOption.price - discountAmount;
                                                                                        } else {
                                                                                            // Fixed price discount - discountPrice IS the final price
                                                                                            displayPrice = discountData.discountPrice || foundOption.price;
                                                                                            discountPercentage = Math.round(((foundOption.price - displayPrice) / foundOption.price) * 100);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }

                                                                        // Check if sale price is enabled (overrides pricing option discounts)
                                                                        if (tourData.saleEnabled && tourData.salePrice) {
                                                                            hasDiscount = true;
                                                                            originalPrice = tourData.price;
                                                                            displayPrice = tourData.salePrice;
                                                                            discountPercentage = Math.round(((tourData.price - tourData.salePrice) / tourData.price) * 100);
                                                                        }

                                                                        return (
                                                                            <div key={index} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                                                <div className="flex items-center justify-between gap-4">
                                                                                    {/* Left side - Date info */}
                                                                                    <div className="flex-1">
                                                                                        <div className="flex items-center gap-3 mb-2">
                                                                                            <div className="bg-primary/10 rounded-lg p-3 text-center min-w-[70px]">
                                                                                                <div className="text-2xl font-bold text-primary">
                                                                                                    {new Date(departure.dateRange.from).getDate()}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground uppercase">
                                                                                                    {new Date(departure.dateRange.from).toLocaleString('default', { month: 'short' })}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <h4 className="font-semibold text-base mb-1">{departure.label}</h4>
                                                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                                                    <Calendar className="h-4 w-4" />
                                                                                                    <span>{formatDate(departure.dateRange.from)} - {formatDate(departure.dateRange.to)}</span>
                                                                                                </div>
                                                                                                {departure.isRecurring && (
                                                                                                    <div className="flex items-center gap-1 mt-1">
                                                                                                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                                                                                            <Clock className="h-3 w-3" />
                                                                                                            Recurring {departure.recurrencePattern}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Pricing options tags */}
                                                                                        {departure.selectedPricingOptions && departure.selectedPricingOptions.length > 0 && (
                                                                                            <div className="flex flex-wrap gap-1 mt-2 ml-[94px]">
                                                                                                {departure.selectedPricingOptions.slice(0, 3).map((optionId: string, idx: number) => {
                                                                                                    let optionDetails = null;

                                                                                                    // Check in pricingGroups first
                                                                                                    tourData.pricingGroups?.forEach((group: any) => {
                                                                                                        const found = group.options?.find((opt: any) => opt.id === optionId);
                                                                                                        if (found) optionDetails = found;
                                                                                                    });

                                                                                                    // If not found, check pricingOptions array
                                                                                                    if (!optionDetails && tourData.pricingOptions) {
                                                                                                        optionDetails = tourData.pricingOptions.find((opt: any) => opt.id === optionId);
                                                                                                    }

                                                                                                    return optionDetails ? (
                                                                                                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                                                                                            {optionDetails.name} - {formatPrice(optionDetails.price)}
                                                                                                        </span>
                                                                                                    ) : null;
                                                                                                })}
                                                                                                {departure.selectedPricingOptions.length > 3 && (
                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        +{departure.selectedPricingOptions.length - 3} more
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Right side - Price and Book button */}
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="text-right">
                                                                                            <div className="text-sm text-muted-foreground mb-1">From</div>
                                                                                            {hasDiscount ? (
                                                                                                <div>
                                                                                                    <div className="flex items-center gap-2 justify-end">
                                                                                                        <span className="text-lg line-through text-muted-foreground">
                                                                                                            {formatPrice(originalPrice)}
                                                                                                        </span>
                                                                                                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                                                                                            -{discountPercentage}%
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-2xl font-bold text-green-600">
                                                                                                        {formatPrice(displayPrice)}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="text-2xl font-bold text-primary">
                                                                                                    {formatPrice(displayPrice)}
                                                                                                </div>
                                                                                            )}
                                                                                            {tourData.pricePerPerson && (
                                                                                                <div className="text-xs text-muted-foreground">per person</div>
                                                                                            )}
                                                                                        </div>
                                                                                        <Button
                                                                                            className="whitespace-nowrap"
                                                                                            onClick={() => {
                                                                                                // Set the departure date in the booking form
                                                                                                const dateInput = document.getElementById('departureDate') as HTMLInputElement;
                                                                                                if (dateInput) {
                                                                                                    const formattedDate = new Date(departure.dateRange.from).toISOString().split('T')[0];
                                                                                                    dateInput.value = formattedDate;
                                                                                                    // Trigger change event
                                                                                                    const event = new Event('input', { bubbles: true });
                                                                                                    dateInput.dispatchEvent(event);
                                                                                                }

                                                                                                // Scroll to booking form
                                                                                                const bookingForm = document.querySelector('.lg\\:col-span-1');
                                                                                                if (bookingForm) {
                                                                                                    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            Book Now
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Pagination Controls */}
                                                            {totalPages > 1 && paginatedDepartures.length > 0 && (
                                                                <div className="flex items-center justify-center gap-2 pt-4">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setCurrentDeparturePage(prev => Math.max(1, prev - 1))}
                                                                        disabled={currentDeparturePage === 1}
                                                                    >
                                                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                                                        Previous
                                                                    </Button>
                                                                    <div className="flex items-center gap-1">
                                                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                            let pageNum;
                                                                            if (totalPages <= 5) {
                                                                                pageNum = i + 1;
                                                                            } else if (currentDeparturePage <= 3) {
                                                                                pageNum = i + 1;
                                                                            } else if (currentDeparturePage >= totalPages - 2) {
                                                                                pageNum = totalPages - 4 + i;
                                                                            } else {
                                                                                pageNum = currentDeparturePage - 2 + i;
                                                                            }

                                                                            return (
                                                                                <Button
                                                                                    key={i}
                                                                                    variant={pageNum === currentDeparturePage ? "default" : "outline"}
                                                                                    size="sm"
                                                                                    onClick={() => setCurrentDeparturePage(pageNum)}
                                                                                    className="w-9 h-9 p-0"
                                                                                >
                                                                                    {pageNum}
                                                                                </Button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setCurrentDeparturePage(prev => Math.min(totalPages, prev + 1))}
                                                                        disabled={currentDeparturePage === totalPages}
                                                                    >
                                                                        Next
                                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                            {/* No Departures Available */}
                                            {(!tourData.tourDates?.departures || tourData.tourDates.departures.length === 0) &&
                                                tourData.tourDates?.scheduleType !== 'flexible' && (
                                                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                                                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                        <p className="text-muted-foreground">No departure dates scheduled yet. Please contact us for availability.</p>
                                                    </div>
                                                )}
                                        </div>

                                        {/* Additional Information */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <div className="flex items-start gap-2">
                                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                                    <p className="font-medium mb-1">Booking Information</p>
                                                    <p>Prices are subject to availability and may vary based on season and group size. For the most accurate pricing and to check availability for your preferred dates, please use the booking form or contact us directly.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="bg-card border border-border rounded-lg p-6 mt-4">
                                <h2 className="text-2xl font-bold mb-4">Reviews</h2>

                                {/* Add a review form - only for signed-in users */}
                                <div className="mb-6 border-b border-border pb-6">
                                    <h3 className="text-lg font-medium mb-4">Write a Review</h3>

                                    {!token ? (
                                        <Alert className="mb-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Authentication Required</AlertTitle>
                                            <AlertDescription>
                                                Please sign in to submit a review.
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto font-medium text-primary ml-2"
                                                    onClick={navigateToLogin}
                                                >
                                                    Sign in now
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="reviewRating" className="block text-sm font-medium mb-1">Rating</label>
                                                <div className="flex items-center space-x-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            className="text-muted-foreground hover:text-yellow-400 focus:outline-hidden"
                                                            onClick={() => setRating(star)}
                                                        >
                                                            <Star
                                                                className={`h-6 w-6 ${star <= rating
                                                                    ? "text-yellow-400 fill-yellow-400"
                                                                    : ""
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                    <span className="ml-2 text-sm text-muted-foreground">
                                                        {rating} out of 5 stars
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="reviewComment" className="block text-sm font-medium mb-1">Your Review</label>
                                                <Textarea
                                                    id="reviewComment"
                                                    placeholder="Share your experience with this tour..."
                                                    className="min-h-[100px]"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                className="w-full sm:w-auto"
                                                onClick={handleSubmitReview}
                                                disabled={!commentText.trim() || submitting || addReviewMutation.isPending}
                                            >
                                                {addReviewMutation.isPending ? (
                                                    <>
                                                        <span className="animate-spin mr-2">⏳</span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    "Submit Review"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Reviews list */}
                                <div className="space-y-6">
                                    {reviewsData?.data?.reviews?.length ? (
                                        reviewsData.data.reviews.map((review: Review) => (
                                            <div
                                                key={review._id}
                                                className="border-b border-border pb-6 last:border-0"
                                                data-review-id={review._id}
                                            >
                                                {/* Review header with user info */}
                                                <div className="flex items-start">
                                                    <Avatar className="h-10 w-10 mr-3">
                                                        <AvatarImage src={review.user?.avatar} />
                                                        <AvatarFallback>{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium">{review.user?.name || review.name || "Anonymous"}</h4>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Review status badge for pending reviews */}
                                                        {review.status === 'pending' && (
                                                            <div className="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                                Pending Approval
                                                            </div>
                                                        )}

                                                        {/* Review content */}
                                                        <p className="mt-2 text-foreground">{review.comment}</p>

                                                        {/* Review actions */}
                                                        <div className="flex items-center mt-3 space-x-4 text-sm">
                                                            <button
                                                                className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                                                onClick={() => handleLikeReview(review._id)}
                                                            >
                                                                <Heart className="h-4 w-4 mr-1" />
                                                                <span>{review.likes || 0} Likes</span>
                                                            </button>
                                                            <button
                                                                className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                                                onClick={() => {
                                                                    if (!token) {
                                                                        toast({
                                                                            title: "Authentication required",
                                                                            description: "Please sign in to reply to reviews.",
                                                                            variant: "destructive",
                                                                        });
                                                                        return;
                                                                    }
                                                                    setReplyTo(review._id === replyTo ? null : review._id);
                                                                }}
                                                            >
                                                                <MessageSquare className="h-4 w-4 mr-1" />
                                                                <span>Reply</span>
                                                            </button>
                                                            <div className="flex items-center text-muted-foreground">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                <span>{review.views || 0} Views</span>
                                                            </div>
                                                            <button
                                                                className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                                                onClick={() => handleIncrementReviewView(review._id)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                <span>Increment View</span>
                                                            </button>
                                                        </div>

                                                        {/* Nested replies */}
                                                        {review.replies && review.replies.length > 0 && (
                                                            <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                                                                {review.replies.map((reply) => (
                                                                    <div key={reply._id} className="pt-4">
                                                                        <div className="flex items-start">
                                                                            <Avatar className="h-8 w-8 mr-2">
                                                                                <AvatarImage src={reply.user?.avatar} />
                                                                                <AvatarFallback>{reply.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <div className="flex items-center">
                                                                                    <h5 className="font-medium text-sm">{reply.user?.name || reply.name || "Anonymous"}</h5>
                                                                                    <span className="text-xs text-muted-foreground ml-2">
                                                                                        {new Date(reply.createdAt).toLocaleDateString()}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-sm mt-1">{reply.comment}</p>

                                                                                {/* Reply actions */}
                                                                                <div className="flex items-center mt-2 space-x-4 text-xs">
                                                                                    <button className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                                                                                        <Heart className="h-3 w-3 mr-1" />
                                                                                        <span>{reply.likes || 0}</span>
                                                                                    </button>
                                                                                    <div className="flex items-center text-muted-foreground">
                                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                                        <span>{reply.views || 0}</span>
                                                                                    </div>
                                                                                    <button
                                                                                        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                                                                        onClick={() => handleLikeReply(reply._id)}
                                                                                    >
                                                                                        <Heart className="h-3 w-3 mr-1" />
                                                                                        <span>Like Reply</span>
                                                                                    </button>
                                                                                    <button
                                                                                        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                                                                        onClick={() => handleIncrementReplyView(reply._id)}
                                                                                    >
                                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                                        <span>Increment View</span>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Reply form - shown when reply button is clicked */}
                                                        {replyTo === review._id && token && (
                                                            <div className="mt-3 pl-4">
                                                                <div className="flex items-start">
                                                                    <Avatar className="h-8 w-8 mr-2 mt-1">
                                                                        <AvatarFallback>U</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1">
                                                                        <Textarea
                                                                            placeholder="Write a reply..."
                                                                            className="min-h-[80px] text-sm"
                                                                            value={replyText}
                                                                            onChange={(e) => setReplyText(e.target.value)}
                                                                        />
                                                                        <div className="flex justify-end mt-2 space-x-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setReplyTo(null);
                                                                                    setReplyText("");
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={handleSubmitReply}
                                                                                disabled={!replyText.trim() || addReplyMutation.isPending}
                                                                            >
                                                                                {addReplyMutation.isPending ? (
                                                                                    <>
                                                                                        <span className="animate-spin mr-2">⏳</span>
                                                                                        Submitting...
                                                                                    </>
                                                                                ) : (
                                                                                    "Reply"
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6">
                                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                            <h3 className="text-lg font-medium">No Reviews Yet</h3>
                                            <p className="text-muted-foreground">Be the first to review this tour!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking form - 1/3 width on large screens */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 z-20">
                            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg relative" style={{ marginTop: '-134px', zIndex: 20 }}>
                                <div className="bg-primary text-primary-foreground p-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Phone className="h-5 w-5" />
                                        <span className="font-bold">Call Center: +1-888-22-6446</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <FrontBooking tourData={tourData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Tours Section */}
            <section className="container mx-auto px-4 mt-16 py-8 border-t border-border">
                <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestTours?.data?.tours?.slice(0, 3).map((relatedTour: Tour) => (
                        <Link key={relatedTour._id} to={`/tours/${relatedTour._id}`} className="group">
                            <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={relatedTour.coverImage}
                                        alt={relatedTour.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{relatedTour.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-primary font-bold">{formatPrice(relatedTour.price)}</span>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {relatedTour.duration} days
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section >
        </div >
    );
};

export default FrontSingleTours;