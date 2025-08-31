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

interface BlockContent {
  type: string;
  text: string;
}

interface Block {
  type: string;
  content: BlockContent[];
}

interface ParsedContent {
  content: Block[];
}

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
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/posts/${id}?t=${timestamp}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        // Transform the data if needed
        return {
          ...responseData,
          comments: Array.isArray(responseData.comments) ? responseData.comments : [],
          tags: Array.isArray(responseData.tags) ? responseData.tags : [],
          likes: typeof responseData.likes === 'number' ? responseData.likes : 0,
          views: typeof responseData.views === 'number' ? responseData.views : 0
        };
      } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    staleTime: 30000 // 30 seconds
  });

  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (data) {
      setPost(data);
    }
  }, [data]);

  // Check if user has liked the post
  const checkLikedStatus = useCallback(async () => {
    if (!post || !userId || !token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/users/${userId}/liked-posts`, {
        headers: {
          Authorization: `Bearer ${token}`
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
        if (post.comments && post.comments.length > 0) {
          const likedCommentsResponse = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/users/${userId}/liked-comments`, {
            headers: {
              Authorization: `Bearer ${token}`
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
    } catch (error) {
      console.error('Error checking liked status:', error);
    }
  }, [post, userId, token]);

  useEffect(() => {
    if (post) {
      checkLikedStatus();
    }
  }, [post, checkLikedStatus]);

  const handleView = useCallback(async () => {
    if (!id) return;

    try {
      // Direct API call
      await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/posts/view/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      // Update local state to reflect the view
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          views: prevPost.views + 1
        };
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [id, token]);

  useEffect(() => {
    if (post?._id) {
      handleView();
    }
  }, [post?._id, handleView]);

  // Wrap handleCommentView in useCallback
  const handleCommentView = useCallback(async (commentId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/comments/view/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

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
  }, [token]);

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      // Use JSON instead of FormData
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      return response.json();
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
      // Direct API call
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/posts/like/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

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
      // Direct API call
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/comments/like/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

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

    // Direct API call with JSON body instead of FormData
    await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/comments/${commentId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content, userId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add reply');
        }
        return response.json();
      })
      .then(() => {
        // Refetch post data to get updated comments
        queryClient.invalidateQueries({ queryKey: ['post', id] });
        toast({
          title: 'Reply added',
          description: 'Your reply has been added successfully.',
          duration: 3000,
        });
      })
      .catch(error => {
        console.error('Error adding reply:', error);
        toast({
          title: 'Error',
          description: 'Failed to add reply. Please try again.',
          variant: 'destructive',
          duration: 3000,
        });
      });
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

  // Parse JSON content
  let parsedContent: ParsedContent;
  try {
    // Check if post.content is defined and not empty
    if (post?.content) {
      parsedContent = JSON.parse(post.content);
    } else {
      // Default content for undefined or empty content
      parsedContent = {
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: 'No content available' }]
        }]
      };
    }
  } catch (e) {
    console.error('Error parsing content:', e);
    parsedContent = {
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Content unavailable' }]
      }]
    };
  }

  // Extract text content for display
  const contentBlocks = parsedContent?.content || [];

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
            {contentBlocks.map((block, blockIndex) => {
              if (block.type === 'paragraph') {
                return (
                  <div key={blockIndex} className="mb-4">
                    {block.content.map((item, itemIndex) => {
                      if (item.type === 'text') {
                        return <p key={itemIndex}>{item.text}</p>;
                      }
                      return null;
                    })}
                  </div>
                );
              }
              return null;
            })}
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
