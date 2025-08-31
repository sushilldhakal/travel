import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/userDefinedComponents/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
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
import { Loader2, Star, RefreshCw } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all reviews using useQuery
  const {
    data: allReviewsData,
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: async () => {
      const response = await getAllReviews();
      if (!response || !response.data) {
        throw new Error('Failed to load reviews. Invalid response format.');
      }
      return response.data.reviews || [];
    },
  });


  // Memoized filtered reviews based on activeTab
  const reviews = useMemo(() => {
    if (!allReviewsData || !Array.isArray(allReviewsData)) return [];
    if (activeTab === 'pending') {
      return allReviewsData.filter((review: Review) => review.status === 'pending');
    } else if (activeTab === 'approved') {
      return allReviewsData.filter((review: Review) => review.status === 'approved');
    } else if (activeTab === 'rejected') {
      return allReviewsData.filter((review: Review) => review.status === 'rejected');
    } else {
      return allReviewsData;
    }
  }, [allReviewsData, activeTab]);

  // --- DataTable columns definition (matching TourPage style) ---
  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: 'tourTitle',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Tour<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => (
        <Button variant="link" className="text-left font-medium px-0" onClick={() => navigateToTour(row.original.tourId)}>
          {row.getValue('tourTitle') || 'Unknown Tour'}
        </Button>
      ),
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={row.original.user.avatar} />
            <AvatarFallback>{row.original.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.user.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Rating<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => renderStarRating(row.original.rating),
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div>
            <p className="truncate">
              {`${row.original.comment.split(' ').slice(0, 5).join(' ')}${row.original.comment.split(' ').length > 5 ? '...' : ''}`}
            </p>

          </div>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Date<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true }),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Status<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'engagement',
      header: 'Engagement',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="text-xs">👍 {row.original.likes || 0}</span>
          <span className="text-xs">👁️ {row.original.views || 0}</span>
          <span className="text-xs">💬 {row.original.replies?.length || 0}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {row.original.status === 'pending' && (
            <>
              <Button size="sm" variant="outline" className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300" onClick={() => handleStatusUpdate(row.original._id, row.original.tourId, 'approved')}>Approve</Button>
              <Button size="sm" variant="outline" className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300" onClick={() => handleStatusUpdate(row.original._id, row.original.tourId, 'rejected')}>Reject</Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => openReplyDialog(row.original)}>Reply</Button>
        </div>
      ),
    },
  ];

  const handleStatusUpdate = async (reviewId: string, tourId: string, status: 'approved' | 'rejected') => {
    try {
      await updateReviewStatus(tourId, reviewId, status);
      toast({
        title: 'Success',
        description: `Review ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });
      // Refetch reviews after status update
      if (activeTab === 'pending') {
        setTimeout(() => {
          refetch();
          setActiveTab(status); // Switch to the appropriate tab (approved or rejected)
        }, 1000);
      } else {
        setTimeout(() => {
          refetch();
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
      refetch();
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
    refetch();
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
          <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "approved" | "rejected")}>
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
                <DataTable
                  data={reviews}
                  columns={columns}
                  place="Search reviews..."
                  colum="tourTitle"
                />
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
