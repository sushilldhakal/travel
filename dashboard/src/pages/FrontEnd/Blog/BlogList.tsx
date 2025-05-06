import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPost } from '@/http';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, Eye, MessageSquare, Filter, Search, ChevronDown } from 'lucide-react';
import useTokenStore from '@/store/store';
import { toast } from '@/components/ui/use-toast';
import { getUserId } from '@/util/authUtils';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  tags: string[];
  image: string;
  status: 'Published' | 'Draft';
  likes: number;
  comments: string[];
  enableComments: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
}

interface PostResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  posts: Post[];
}

const BlogList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'mostCommented'>('latest');
  const { token } = useTokenStore();
  const userId = getUserId();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const { data: response, isLoading, error, refetch } = useQuery<{ data: PostResponse }>({
    queryKey: ['posts'],
    queryFn: getPost,
    select: (response) => response
  });

  const [posts, setPosts] = useState<Post[]>([]);

  // Initialize search parameters from URL
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }

    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }

    const sortParam = searchParams.get('sort') as 'latest' | 'popular' | 'mostCommented';
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (response?.data?.posts) {
      // Check if posts have liked status
      const updatedPosts = response.data.posts.map(post => {
        return {
          ...post,
          liked: false // Default value
        };
      });

      // If user is logged in, fetch their liked status
      if (userId && token) {
        // Fetch user's liked posts
        const checkLikedPosts = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/users/${userId}/liked-posts`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              const likedPostIds = data.likedPosts || [];

              // Update posts with liked status
              setPosts(updatedPosts.map(post => ({
                ...post,
                liked: likedPostIds.includes(post._id)
              })));
            } else {
              setPosts(updatedPosts);
            }
          } catch (error) {
            console.error('Error fetching liked posts:', error);
            setPosts(updatedPosts);
          }
        };

        checkLikedPosts();
      } else {
        setPosts(updatedPosts);
      }

      // Check if there are more posts to load
      if (response.data.totalPages <= page) {
        setHasMore(false);
      }
    }
  }, [response, userId, token, page]);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => post.status === 'Published')
    .filter(post => {
      if (searchTerm) {
        return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return true;
    })
    .filter(post => {
      if (selectedTag) {
        return post.tags.includes(selectedTag);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'mostCommented':
          return b.comments.length - a.comments.length;
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(
      posts
        .filter(post => post.status === 'Published')
        .flatMap(post => post.tags)
    )
  );

  const handleLike = async (postId: string) => {
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
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/posts/like/${postId}`, {
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
      setPosts(currentPosts =>
        currentPosts.map(post => {
          if (post._id === postId) {
            const wasLiked = post.liked;
            return {
              ...post,
              likes: wasLiked ? post.likes - 1 : post.likes + 1,
              liked: !wasLiked
            };
          }
          return post;
        })
      );

      // Refetch to ensure data consistency
      refetch();
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

  const handleView = async (postId: string) => {
    try {
      // Direct API call
      await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/posts/view/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      // Update local state to reflect the view
      setPosts(currentPosts =>
        currentPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              views: post.views + 1
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedTag) {
      params.set('tag', selectedTag);
    }

    if (searchTerm) {
      params.set('search', searchTerm);
    }

    if (sortBy !== 'latest') {
      params.set('sort', sortBy);
    }

    setSearchParams(params);
  }, [selectedTag, searchTerm, sortBy, setSearchParams]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset to first page when search changes
    setPage(1);
    setPosts([]);
  };

  // Handle tag selection
  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    // Reset to first page when tag changes
    setPage(1);
    setPosts([]);
  };

  // Handle sort selection
  const handleSortSelect = (sort: 'latest' | 'popular' | 'mostCommented') => {
    setSortBy(sort);
  };

  // Infinite scroll implementation
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg p-6">
              <div className="h-48 bg-muted rounded-md mb-4"></div>
              <div className="h-8 bg-muted rounded-md w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-5/6 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-muted rounded-md w-16"></div>
                <div className="h-6 bg-muted rounded-md w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-5 bg-muted rounded-md w-24"></div>
                <div className="flex gap-4">
                  <div className="h-5 bg-muted rounded-md w-16"></div>
                  <div className="h-5 bg-muted rounded-md w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center text-red-500">
          Error loading posts. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Travel Blog</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore travel stories, tips, and adventures from our community of travelers around the world.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title or tag..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {selectedTag ? `Tag: ${selectedTag}` : 'All Tags'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleTagSelect(null)}>
                All Tags
              </DropdownMenuItem>
              {allTags.map((tag) => (
                <DropdownMenuItem key={tag} onClick={() => handleTagSelect(tag)}>
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sort By
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortSelect('latest')}>
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortSelect('popular')}>
                Most Viewed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortSelect('mostCommented')}>
                Most Commented
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredPosts.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No posts found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post, index) => {
            // Safely extract content text with error handling
            let contentText = '';
            try {
              const parsedContent = JSON.parse(post.content);
              contentText = parsedContent?.content?.[0]?.content?.[0]?.text || 'No content available';
            } catch (e) {
              contentText = 'Content unavailable';
            }

            // Add ref to last element for infinite scrolling
            const isLastElement = index === filteredPosts.length - 1;

            return (
              <Card
                key={post._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                ref={isLastElement ? lastPostElementRef : undefined}
              >
                <div className="relative">
                  <Link
                    to={`/blog/${post._id}`}
                    onClick={() => handleView(post._id)}
                    className="block h-48 overflow-hidden"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <p className="font-medium text-foreground">
                      By {post.author?.name || 'Unknown Author'}
                    </p>
                    <span>•</span>
                    <p>{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
                  </div>

                  <Link
                    to={`/blog/${post._id}`}
                    onClick={() => handleView(post._id)}
                    className="block"
                  >
                    <h3 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {contentText}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      to={`/blog/${post._id}`}
                      onClick={() => handleView(post._id)}
                      className="text-primary hover:underline"
                    >
                      Read more
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 hover:text-primary transition-colors ${post.liked ? 'text-red-500' : ''}`}
                        disabled={!userId}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? 'fill-red-500' : ''}`} />
                        {post.likes}
                      </button>

                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </span>

                      <Link
                        to={`/blog/${post._id}#comments`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {post.comments.length}
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isLoading && page > 1 && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default BlogList;
