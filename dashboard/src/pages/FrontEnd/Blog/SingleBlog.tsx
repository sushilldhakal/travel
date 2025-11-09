import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Heart, Eye, MessageSquare, Share2, ArrowLeft } from 'lucide-react';
import useTokenStore from '@/store/store';
import { toast } from '@/components/ui/use-toast';
import { getUserId } from '@/util/authUtils';
import { getSinglePost, likePost, viewPost } from '@/http/postApi';
import { viewComment, addComment, addReply, likeComment } from '@/http/commentApi';
import RichTextRenderer from '@/components/RichTextRenderer';

interface Author {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  author: Author;
  post: string;
  likes: number;
  views: number;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  image: string;
  status: 'Published' | 'Draft';
  likes: number;
  comments: Comment[];
  enableComments: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
}

// Removed unused interfaces - content parsing is handled by RichTextRenderer

const SingleBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useTokenStore();
  const userId = getUserId();
  const commentsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");

      try {
        console.log('🔍 Fetching single post with ID:', id);
        const responseData = await getSinglePost(id);
        console.log('✅ Post data received:', responseData);

        // Extract post data from the response (API returns {post: {...}, breadcrumbs: [...]})
        const postData = responseData.post || responseData;
        
        // Transform comment structure to match component expectations
        const transformedComments = Array.isArray(postData.comments) 
          ? postData.comments.map((comment: any) => ({
              _id: comment._id,
              content: comment.text || comment.content || '',
              author: {
                _id: comment.user?._id || comment.author?._id || '',
                name: comment.user?.name || comment.author?.name || 'Unknown',
                email: comment.user?.email || comment.author?.email || '',
                avatar: comment.user?.avatar || comment.author?.avatar || ''
              },
              post: comment.post || postData._id,
              likes: typeof comment.likes === 'number' ? comment.likes : 0,
              views: typeof comment.views === 'number' ? comment.views : 0,
              replies: Array.isArray(comment.replies) ? comment.replies : [],
              createdAt: comment.created_at || comment.createdAt || new Date().toISOString(),
              updatedAt: comment.updated_at || comment.updatedAt || new Date().toISOString(),
              liked: !!comment.liked
            }))
          : [];

        // Transform the post data to match component expectations
        return {
          _id: postData._id,
          title: postData.title || 'Untitled Post',
          content: postData.content || '',
          author: {
            _id: postData.author?._id || '',
            name: postData.author?.name || 'Unknown Author',
            email: postData.author?.email || '',
            avatar: postData.author?.avatar || ''
          },
          tags: Array.isArray(postData.tags) ? postData.tags : [],
          image: postData.image || '',
          status: postData.status || 'Published',
          likes: typeof postData.likes === 'number' ? postData.likes : 0,
          comments: transformedComments,
          enableComments: postData.enableComments !== false,
          views: typeof postData.views === 'number' ? postData.views : 0,
          createdAt: postData.createdAt || new Date().toISOString(),
          updatedAt: postData.updatedAt || new Date().toISOString(),
          liked: !!postData.liked
        };
      } catch (error) {
        console.error('❌ Error fetching post:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 2,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data (renamed from cacheTime)
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const [post, setPost] = useState<Post | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasCheckedLikedStatus, setHasCheckedLikedStatus] = useState(false);
  const [viewedComments, setViewedComments] = useState<Set<string>>(new Set());

  // Reset tracking states when post ID changes
  useEffect(() => {
    setHasTrackedView(false);
    setHasCheckedLikedStatus(false);
    setViewedComments(new Set()); // Clear viewed comments for new post
  }, [id]);

  useEffect(() => {
    if (data) {
      setPost(data);
      
      // Track post view only once when data is first loaded
      if (id && !hasTrackedView) {
        console.log('📊 Tracking view for post:', id);
        viewPost(id)
          .then(() => {
            console.log('✅ View tracked successfully');
            setHasTrackedView(true);
          })
          .catch(error => {
            console.error('❌ Error tracking post view:', error);
          });
      }
    }
  }, [data, id, hasTrackedView]);

  // Check if user has liked the post - REMOVED CALLBACK TO PREVENT INFINITE LOOPS
  const checkLikedStatus = async (postId: string, userIdParam: string, tokenParam: string) => {
    console.log('🔍 Checking liked status for post:', postId);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/users/${userIdParam}/liked-posts`, {
        headers: {
          Authorization: `Bearer ${tokenParam}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const likedPostIds = data.likedPosts || [];
        setPost(prevPost => {
          if (!prevPost) return null;
          return {
            ...prevPost,
            liked: likedPostIds.includes(prevPost._id)
          };
        });

        // Also check for liked comments
        if (post && post.comments && post.comments.length > 0) {
          const likedCommentsResponse = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/users/${userIdParam}/liked-comments`, {
            headers: {
              Authorization: `Bearer ${tokenParam}`
            }
          });

          if (likedCommentsResponse.ok) {
            const commentsData = await likedCommentsResponse.json();
            const likedCommentIds = commentsData.likedComments || [];

            // Update comments with liked status
            setPost(prevPost => {
              if (!prevPost) return null;
              return {
                ...prevPost,
                comments: prevPost.comments.map(comment => ({
                  ...comment,
                  liked: likedCommentIds.includes(comment._id),
                  replies: comment.replies.map(reply => ({
                    ...reply,
                    liked: likedCommentIds.includes(reply._id)
                  }))
                }))
              };
            });
          }
        }
      }
      
      console.log('✅ Liked status checked successfully');
      setHasCheckedLikedStatus(true);
    } catch (error) {
      console.error('❌ Error checking liked status:', error);
    }
  };

  // Single effect to check liked status - ONLY PRIMITIVE DEPENDENCIES
  useEffect(() => {
    const postId = post?._id;
    console.log('🔄 Liked status effect triggered:', {
      postId,
      userId: !!userId,
      token: !!token,
      hasCheckedLikedStatus,
      shouldCheck: !!(postId && userId && token && !hasCheckedLikedStatus)
    });
    
    if (postId && userId && token && !hasCheckedLikedStatus) {
      checkLikedStatus(postId, userId, token);
    }
  }, [post?._id, userId, token, hasCheckedLikedStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // REMOVED DUPLICATE VIEW TRACKING - Already handled in the main useEffect with viewPost()

  // Wrap handleCommentView in useCallback
  const handleCommentView = useCallback(async (commentId: string) => {
    // Check if this comment has already been viewed
    if (viewedComments.has(commentId)) {
      console.log('⏭️ Comment already viewed, skipping:', commentId);
      return;
    }

    try {
      console.log('📊 Tracking comment view:', commentId);
      await viewComment(commentId);
      console.log('✅ Comment view tracked successfully');
      
      // Mark this comment as viewed
      setViewedComments(prev => new Set([...prev, commentId]));

      // Update local state
      setPost(prevPost => {
        if (!prevPost) return null;

        const updateComments = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                views: comment.views + 1
              };
            }

            // Check in replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateComments(comment.replies)
              };
            }

            return comment;
          });
        };

        return {
          ...prevPost,
          comments: updateComments(prevPost.comments)
        };
      });
    } catch (error) {
      console.error('Error tracking comment view:', error);
    }
  }, [viewedComments, setViewedComments]); // Remove token dependency, add viewedComments

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      console.log('🔍 Adding comment to post:', postId);
      
      // Create FormData as expected by the API
      const formData = new FormData();
      formData.append('text', content);
      if (userId) {
        formData.append('user', userId);
      }
      
      const response = await addComment(formData, postId);
      console.log('✅ Comment added successfully');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setCommentContent('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully.',
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  });

  const handleLike = async () => {
    if (!userId || !token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like posts.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      console.log('🔍 Liking post with ID:', id, 'User ID:', userId);
      await likePost(id!, userId!);

      // Optimistic update
      setPost(prevPost => {
        if (!prevPost) return null;
        const wasLiked = prevPost.liked;
        return {
          ...prevPost,
          likes: wasLiked ? prevPost.likes - 1 : prevPost.likes + 1,
          liked: !wasLiked
        };
      });

      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!userId || !token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like comments.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      console.log('🔍 Liking comment:', commentId, 'User:', userId);
      await likeComment(commentId, userId!);

      // Optimistic update
      setPost(prevPost => {
        if (!prevPost) return null;

        const updateComments = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              const wasLiked = comment.liked;
              return {
                ...comment,
                likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
                liked: !wasLiked
              };
            }

            // Check in replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateComments(comment.replies)
              };
            }

            return comment;
          });
        };

        return {
          ...prevPost,
          comments: updateComments(prevPost.comments)
        };
      });

      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to like comment. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      toast({
        title: 'Error',
        description: 'Comment content cannot be empty',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (!userId || !token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add a comment',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (!post) {
      toast({
        title: 'Error',
        description: 'Post not found',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    // Use the mutation instead of direct fetch
    addCommentMutation.mutate({
      postId: post._id,
      content: commentContent
    });
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: 'Empty reply',
        description: 'Please enter a reply.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (!userId || !token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to reply to a comment.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      console.log('🔍 Adding reply to comment:', commentId);
      
      const replyData = {
        text: content,
        user: userId!,
        post: post!._id
      };
      
      await addReply(replyData, commentId);
      console.log('✅ Reply added successfully');
      
      // Refetch post data to get updated comments
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast({
        title: 'Reply added',
        description: 'Your reply has been added successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Error adding reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reply. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'Blog Post',
          text: 'Check out this blog post!',
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: 'Link copied',
          description: 'Post link copied to clipboard.',
          duration: 3000,
        });
      })
      .catch(error => {
        console.error('Error copying to clipboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy link. Please try again.',
          variant: 'destructive',
          duration: 3000,
        });
      });
  };

  useEffect(() => {
    // View comments when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const commentId = entry.target.getAttribute('data-comment-id');
          if (commentId) {
            handleCommentView(commentId);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    // Only observe if there are comments
    const commentElements = document.querySelectorAll('[data-comment-id]');
    if (commentElements.length > 0) {
      commentElements.forEach((element) => {
        observer.observe(element);
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [post?.comments, handleCommentView]);

  useEffect(() => {
    if (post && commentsRef.current) {
      // Scroll to comments if hash is #comments
      if (window.location.hash === '#comments') {
        commentsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [post]);

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="h-12 w-3/4 bg-gray-200 rounded mb-6"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-6 w-full bg-gray-200 rounded"></div>
            <div className="h-6 w-full bg-gray-200 rounded"></div>
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post && !isLoading) {
    console.error('No post data available', fetchError);
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading post</h2>
          <p className="text-muted-foreground mb-6">
            {fetchError ? `Error: ${fetchError.message}` : "The post you're looking for could not be found or there was an error loading it."}
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Ensure post has required properties with defaults
  const safePost = post ? {
    ...post,
    title: post.title || 'Untitled Post',
    content: post.content || '',
    author: post.author || { _id: '', name: 'Unknown Author', email: '', avatar: '' },
    tags: Array.isArray(post.tags) ? post.tags : [],
    image: post.image || '',
    status: post.status || 'Published',
    likes: typeof post.likes === 'number' ? post.likes : 0,
    comments: Array.isArray(post.comments) ? post.comments : [],
    enableComments: post.enableComments !== false,
    views: typeof post.views === 'number' ? post.views : 0,
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || new Date().toISOString(),
    liked: !!post.liked
  } : null;

  // Content parsing is now handled by RichTextRenderer

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          <Card className="p-8 text-center">
            <CardContent>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Post</h1>
              <p className="text-muted-foreground mb-4">
                {fetchError instanceof Error ? fetchError.message : 'Failed to load the blog post. Please try again later.'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No post found
  if (!post) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          <Card className="p-8 text-center">
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/blog">
                <Button>
                  Back to Blog
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Additional safety check
  if (!safePost) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          <Card className="p-8 text-center">
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">Post Not Available</h1>
              <p className="text-muted-foreground mb-4">
                The blog post data is not available.
              </p>
              <Link to="/blog">
                <Button>
                  Back to Blog
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">{safePost.title}</h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={safePost.author?.avatar || ''} alt={safePost.author?.name || 'User'} />
                <AvatarFallback>{safePost.author?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{safePost.author?.name || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground">
                  {safeFormatDate(safePost.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 hover:text-primary transition-colors ${safePost.liked ? 'text-red-500' : ''}`}
                disabled={!userId}
              >
                <Heart className={`h-5 w-5 ${safePost.liked ? 'fill-red-500' : ''}`} />
                <span>{safePost.likes}</span>
              </button>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-5 w-5" />
                <span>{safePost.views}</span>
              </div>

              <a
                href="#comments"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{(safePost.comments.length || 0)}</span>
              </a>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <img
              src={safePost.image}
              alt={safePost.title}
              className="w-full h-auto rounded-lg object-cover max-h-[500px]"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {safePost.tags.map((tag, index) => (
              <Link to={`/blog?tag=${tag}`} key={index}>
                <Badge variant="secondary" className="cursor-pointer">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <RichTextRenderer 
              content={safePost.content} 
              className="text-base leading-relaxed"
            />
          </div>
        </div>

        <Separator className="my-8" />

        <div id="comments" ref={commentsRef} className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Comments ({safePost.comments.length})</h2>

          {safePost.enableComments && (
            <div className="mb-8">
              <Textarea
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="mb-4 min-h-[100px]"
              />
              <Button onClick={handleAddComment} disabled={addCommentMutation.isPending || isSubmitting}>
                {addCommentMutation.isPending || isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          )}

          {safePost.comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {safePost.comments.map((comment) => (
                <CommentComponent
                  key={comment._id}
                  comment={comment}
                  onLike={handleCommentLike}
                  onReply={handleReply}
                  isLoggedIn={!!userId}
                  safeFormatDate={safeFormatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentComponentProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  isReply?: boolean;
  isLoggedIn: boolean;
  safeFormatDate: (dateString: string | undefined) => string;
}

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  onLike,
  onReply,
  isReply = false,
  isLoggedIn,
  safeFormatDate
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(comment._id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <Card
      className={`${isReply ? 'ml-12 mt-4' : ''}`}
      data-comment-id={comment._id}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={comment.author?.avatar || ''} alt={comment.author?.name || 'User'} />
            <AvatarFallback>{comment.author?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{comment.author?.name || 'Unknown User'}</p>
            <p className="text-sm text-muted-foreground">
              {safeFormatDate(comment.createdAt)}
            </p>
          </div>
        </div>

        <p className="mb-4">{comment.content}</p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => onLike(comment._id)}
            className={`flex items-center gap-1 text-sm hover:text-primary transition-colors ${comment.liked ? 'text-red-500' : ''}`}
            disabled={!isLoggedIn}
          >
            <Heart className={`h-4 w-4 ${comment.liked ? 'fill-red-500' : ''}`} />
            <span>{comment.likes}</span>
          </button>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{comment.views}</span>
          </div>

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-sm text-primary hover:underline"
          >
            Reply
          </button>
        </div>

        {showReplyInput && (
          <div className="mt-4">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2 min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReply}>
                Post Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentComponent
                key={reply._id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                isReply={true}
                isLoggedIn={isLoggedIn}
                safeFormatDate={safeFormatDate}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SingleBlog;
