import React, { useState } from 'react';
import { CardContent, Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Star, StarHalf, ThumbsUp, Eye, Calendar, User, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { getTourReviews } from '@/http/reviewApi';
import { Review, ReviewsManagerProps } from '@/Provider/types';



const ReviewsManager: React.FC<ReviewsManagerProps> = ({ tourId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Use Tanstack Query to fetch reviews with the existing reviewApi
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['tourReviews', tourId, currentPage],
    queryFn: () => getTourReviews(tourId),
    enabled: !!tourId,
    refetchOnWindowFocus: false,
  });

  // Process the response based on the structure
  const reviews: Review[] = React.useMemo(() => {
    if (!data) return [];

    console.log('Reviews data from API:', data);

    // Handle different response structures
    if (data.data?.reviews) {
      return data.data.reviews;
    } else if (data.reviews) {
      return data.reviews;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.tour?.reviews) {
      return data.tour.reviews;
    } else if (data.data?.tour?.reviews) {
      return data.data.tour.reviews;
    }

    return [];
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    console.error('Error fetching reviews:', error);
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/10">
        <div className="text-center text-destructive">
          <p>Failed to load reviews. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/80"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed border-border bg-secondary/50">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground mb-4">
          This tour doesn't have any reviews yet. Check back later!
        </p>
      </Card>
    );
  }

  // Get the current page of reviews
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <Card key={review._id} className="p-6 hover:shadow-sm transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user?.name || 'User'}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">{review.user?.name || 'Anonymous User'}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">{renderStars(review.rating)}</div>
              </div>

              <p className="mb-4 text-foreground">
                {review.comment || 'No comment provided.'}
              </p>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {review.likes} likes
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {review.views} views
                </div>
                <Badge variant="outline" className="ml-auto">
                  Verified
                </Badge>
              </div>

              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 pl-6 border-l-2 border-muted">
                  <h5 className="text-sm font-medium mb-2">Replies:</h5>
                  {review.replies.map((reply) => (
                    <div key={reply._id} className="mb-3 pl-2">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">{reply.user?.name || 'Staff'}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                isActive={currentPage === 1}
              />
            </PaginationItem>
            <PaginationItem className="mx-2">
              Page {currentPage} of {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                isActive={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ReviewsManager;
