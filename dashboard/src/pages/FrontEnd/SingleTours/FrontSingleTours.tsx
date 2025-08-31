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
import { Calendar, Clock, MapPin, Info, Star, Home, ChevronRight, MessageSquare, Phone, Heart, Eye, MessageCircleQuestion, AlertCircle, Play, Video } from 'lucide-react';
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

    // FAQ expansion is now handled by Accordion component

    // Handle booking submission
    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send this data to your backend API
        alert('Booking submitted successfully!');
    };

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
                                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
                                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                                <TabsContent value="reviews" className="mt-4">
                                    <div className="bg-card border border-border rounded-lg p-6">
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
                                </TabsContent>
                            </Tabs>
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
                                <div className="bg-muted p-4 text-center border-b border-border">
                                    <h3 className="text-xl font-bold">
                                        Total: {formatPrice(calculateTotalPrice(tourData))}
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <Tabs defaultValue="booking">
                                        <TabsList className={`grid w-full ${tourData?.enquiry ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            <TabsTrigger value="booking">Booking Form</TabsTrigger>
                                            {tourData?.enquiry && (
                                                <TabsTrigger value="enquiry">Enquiry Form</TabsTrigger>
                                            )}
                                        </TabsList>
                                        <TabsContent value="booking" className="mt-4 space-y-4">
                                            <div>
                                                <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    className="w-full p-2 border border-border rounded-md bg-background"
                                                    placeholder="Your full name"
                                                    value={""}
                                                    onChange={() => { }}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="w-full p-2 border border-border rounded-md bg-background"
                                                    placeholder="email@example.com"
                                                    value={""}
                                                    onChange={() => { }}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium mb-1">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    className="w-full p-2 border border-border rounded-md bg-background"
                                                    placeholder="Your phone number"
                                                    value={""}
                                                    onChange={() => { }}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="departureDate" className="block text-sm font-medium mb-1">Departure Date</label>
                                                <input
                                                    type="date"
                                                    id="departureDate"
                                                    className="w-full p-2 border border-border rounded-md bg-background"
                                                    value={""}
                                                    onChange={() => { }}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="adults" className="block text-sm font-medium mb-1">Adults</label>
                                                    <div className="flex">
                                                        <select
                                                            className="w-full p-2 border border-border rounded-md bg-background"
                                                            value={1}
                                                            onChange={() => { }}
                                                        >
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="children" className="block text-sm font-medium mb-1">Children</label>
                                                    <div className="flex">
                                                        <select
                                                            className="w-full p-2 border border-border rounded-md bg-background"
                                                            value={0}
                                                            onChange={() => { }}
                                                        >
                                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border">
                                                <div className="flex justify-between mb-2">
                                                    <span>Price per person:</span>
                                                    <span className="font-semibold">{formatPrice(tourData.price || 0)}</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span>Adults (1):</span>
                                                    <span>{formatPrice((tourData.price || 0) * 1)}</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span>Children (0):</span>
                                                    <span>{formatPrice((tourData.price || 0) * 0 * 0.7)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                                                    <span>Total:</span>
                                                    <span className="text-primary">{formatPrice(calculateTotalPrice(tourData))}</span>
                                                </div>
                                            </div>

                                            <Button className="w-full" size="lg" onClick={handleBookingSubmit}>
                                                Book Now
                                            </Button>
                                        </TabsContent>
                                        {tourData?.enquiry && (
                                            <TabsContent value="enquiry" className="mt-4 space-y-4">
                                                <div>
                                                    <label htmlFor="enquiryName" className="block text-sm font-medium mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="enquiryName"
                                                        id="enquiryName"
                                                        className="w-full p-2 border border-border rounded-md bg-background"
                                                        placeholder="Your full name"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="enquiryEmail" className="block text-sm font-medium mb-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="enquiryEmail"
                                                        id="enquiryEmail"
                                                        className="w-full p-2 border border-border rounded-md bg-background"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="enquiryMessage" className="block text-sm font-medium mb-1">Message</label>
                                                    <textarea
                                                        name="enquiryMessage"
                                                        id="enquiryMessage"
                                                        className="w-full p-2 border border-border rounded-md bg-background"
                                                        placeholder="I'm interested in this tour and would like more information..."
                                                    />
                                                </div>

                                                <Button className="w-full" size="lg">
                                                    Send Enquiry
                                                </Button>
                                            </TabsContent>
                                        )}
                                    </Tabs>
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
            </section>
        </div>
    );
};

export default FrontSingleTours;