import React, { useState } from 'react';
import { CardContent, Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Star, StarHalf, ThumbsUp, Eye, User as UserIcon, MessageCircle, RefreshCcw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import { getTourReviews } from '@/http/reviewApi';
import { Review, ReviewsManagerProps, User } from '@/Provider/types';

const ReviewsManager: React.FC<ReviewsManagerProps> = ({ tourId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Fetch reviews with React Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tourReviews', tourId, currentPage],
    queryFn: () => getTourReviews(tourId),
    enabled: !!tourId,
  });

  // Transform the API response to a consistent reviews format
  const reviews: Review[] = React.useMemo(() => {
    // Define empty fallback array
    const emptyReviews: Review[] = [];

    // If there's an error or no data, return empty array
    if (isError || !data) {
      console.log('No review data available');
      return emptyReviews;
    }


    try {
      // Handle different response structures with safe property access
      if (data && typeof data === 'object') {
        // Common pattern in many API responses
        if (data.data?.reviews && Array.isArray(data.data.reviews)) {
          console.log('Found reviews in data.data.reviews');
          return data.data.reviews.map((review: Review) => ({
            ...review,
            id: review._id,
            tourId: tourId,
            userId: review.user?._id || 'unknown',
            username: review.user?.name || 'Anonymous',
            title: review.title || '',
            images: (review.user && (review.user as User).images) ? (review.user as User).images : [],
          }));
        }



      }
    } catch (err) {
      console.error('Error processing review data:', err);
    }

    // Default fallback
    console.log('Using default fallback for reviews');
    return emptyReviews;
  }, [data, isError, tourId]);

  // Calculate pagination variables
  const currentReviews = reviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));

  console.log("reviews", currentReviews);
  // Handle retry when API fails
  const handleRetry = () => {
    refetch();
  };

  // Function to generate star rating visualization
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-primary text-primary" />);
    }

    if (halfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-primary text-primary" />);
    }

    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  // Show a fallback message when tour is not saved yet
  if (!tourId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Reviews not available</AlertTitle>
        <AlertDescription>
          Please save the tour first to enable reviews.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>

        {/* Overall rating summary could go here */}
      </div>

      {isLoading ? (
        // Show skeletons while loading
        Array(2).fill(0).map((_, i) => (
          <Card key={`skeleton-${i}`} className="mb-4">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : isError ? (
        // Show error state
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading reviews</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Failed to load reviews. Please try again later.</span>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCcw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : currentReviews.length > 0 ? (
        <div className="space-y-4">
          {currentReviews.map((review) => (
            <Card key={review._id} className="p-0 overflow-hidden border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{review.user.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="flex mr-2">{renderStars(review.rating)}</div>
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                    Verified
                  </Badge>
                </div>

                <h4 className="font-medium mb-2">{review.title}</h4>
                <p className="text-muted-foreground mb-4">{review.comment}</p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-muted-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">{review.likes || 0}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="text-sm">{review.views || 0}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{review.replies?.length || 0}</span>
                    </div>
                  </div>

                  {/* Action buttons could go here */}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <Button 
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(index + 1)}
                      className="w-8 h-8"
                    >
                      {index + 1}
                    </Button>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        // Show empty state
        <div className="text-center py-10 border border-dashed rounded-lg bg-muted/40">
          <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
          <p className="text-muted-foreground">Be the first to review this tour!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;