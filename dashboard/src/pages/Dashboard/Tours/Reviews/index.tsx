import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  updateReviewStatus,
  addReviewReply,
  getAllReviews
} from '@/http';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import useTokenStore from '@/store/store';
import { Loader2, Star, ThumbsUp, Eye, MessageSquare, RefreshCw, FileText } from 'lucide-react';

// Define types
interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  replies: Reply[];
  tourId: string;
  tourTitle: string;
  likes?: number;
  views?: number;
}

interface Reply {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  comment: string;
  createdAt: string;
}

const ReviewsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Token is used for authentication in the API calls
  const token = useTokenStore(state => state.token);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllReviews();

      if (!response || !response.data) {
        toast({
          title: 'Error',
          description: 'Failed to load reviews. Invalid response format.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Extract reviews from the response data structure
      const allReviews = response.data?.reviews || [];

      if (allReviews.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      let data;
      if (activeTab === 'pending') {
        // For pending tab, show all pending reviews
        data = allReviews.filter((review: Review) => review.status === 'pending') || [];
      } else if (activeTab === 'approved') {
        // For approved tab, show all approved reviews
        data = allReviews.filter((review: Review) => review.status === 'approved') || [];
      } else if (activeTab === 'rejected') {
        // For rejected tab, show all rejected reviews
        data = allReviews.filter((review: Review) => review.status === 'rejected') || [];
      } else {
        // Default case - show all reviews
        data = allReviews;
      }

      setReviews(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStatusUpdate = async (reviewId: string, tourId: string, status: 'approved' | 'rejected') => {
    try {
      await updateReviewStatus(tourId, reviewId, status);

      // Show success message
      toast({
        title: 'Success',
        description: `Review ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });

      // Instead of removing the review, mark it with the new status (optimistic UI update)
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId
            ? { ...review, status }
            : review
        )
      );

      // If we're in the pending tab and want to see the updated review in its new tab
      if (activeTab === 'pending') {
        // Wait a moment before switching tabs to let the user see the success message
        setTimeout(() => {
          // Fetch all reviews again to ensure we have the latest data
          fetchReviews().then(() => {
            // Then switch to the appropriate tab
            setActiveTab(status); // Switch to the appropriate tab (approved or rejected)
          });
        }, 1000);
      } else {
        // Just refresh the current tab after a short delay
        setTimeout(() => {
          fetchReviews();
        }, 500);
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setSubmitting(true);
    try {
      await addReviewReply(selectedReview.tourId, selectedReview._id, replyText);
      toast({
        title: 'Success',
        description: 'Reply added successfully.',
      });
      setReplyDialogOpen(false);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openReplyDialog = (review: Review) => {
    setSelectedReview(review);
    setReplyDialogOpen(true);
  };

  const navigateToTour = (tourId: string) => {
    navigate(`/dashboard/tours/${tourId}`);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating)
              ? 'text-yellow-400 fill-yellow-400'
              : i < rating
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    fetchReviews();
    toast({
      title: 'Refreshed',
      description: 'Review list has been refreshed.',
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reviews Management</h2>
          <p className="text-muted-foreground">
            Manage tour reviews, approve or reject pending reviews, and reply to customer feedback.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reviews </CardTitle>

        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
              <TabsTrigger value="approved">Approved Reviews</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Reviews</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No {activeTab} reviews found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tour</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review._id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Button
                              variant="link"
                              onClick={() => navigateToTour(review.tourId)}
                              className="text-left font-medium"
                            >
                              {review.tourTitle || "Unknown Tour"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={review.user.avatar} />
                              <AvatarFallback>
                                {review.user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.user.name}</p>
                              <p className="text-xs text-muted-foreground">{review.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderStarRating(review.rating)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="truncate">{review.comment}</p>
                            {review.replies && review.replies.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="text-xs">{review.likes || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1 text-gray-500" />
                              <span className="text-xs">{review.views || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1 text-green-500" />
                              <span className="text-xs">{review.replies?.length || 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {review.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                                  onClick={() => handleStatusUpdate(review._id, review.tourId, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                                  onClick={() => handleStatusUpdate(review._id, review.tourId, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReplyDialog(review)}
                            >
                              Reply
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Add your response to the customer's review. This will be visible to all users.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="my-4 p-4 bg-muted rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedReview.user.avatar} />
                  <AvatarFallback>
                    {selectedReview.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{selectedReview.user.name}</p>
                  <div className="flex items-center">
                    {renderStarRating(selectedReview.rating)}
                  </div>
                </div>
              </div>
              <p className="text-sm">{selectedReview.comment}</p>
            </div>
          )}

          <Textarea
            placeholder="Type your reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
          />

          {selectedReview && selectedReview.replies && selectedReview.replies.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Previous Replies</h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {selectedReview.replies.map((reply) => (
                  <div key={reply._id} className="p-3 bg-background rounded-md border">
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reply.user.avatar} />
                        <AvatarFallback>
                          {reply.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium">{reply.user.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs">{reply.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReplySubmit}
              disabled={!replyText.trim() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Reply'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsManagement;
