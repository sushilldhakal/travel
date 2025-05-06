import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/http";
import { format } from "date-fns";
import { Heart, Eye, MessageSquare } from 'lucide-react';
import useTokenStore from '@/store/store';
import { toast } from '@/components/ui/use-toast';
import { getUserId } from '@/util/authUtils';
import { Post, PostResponse } from '@/Provider/types';



const RecentBlog: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useTokenStore();
    const userId = getUserId();

    const { data: response, isLoading, error, refetch } = useQuery<{ data: PostResponse }>({
        queryKey: ['posts'],
        queryFn: getPost,
        select: (response) => response
    });

    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (response?.data?.posts) {
            console.log('API Response Posts:', response.data.posts);

            // Check if posts have liked status
            const updatedPosts = response.data.posts.map(post => {
                // Ensure all required properties have default values
                return {
                    ...post,
                    liked: false, // Default value
                    likes: post.likes || 0,
                    views: post.views || 0,
                    comments: Array.isArray(post.comments) ? post.comments : []
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
        }
    }, [response, userId, token]);

    const handleLike = async (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        e.stopPropagation();

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

            // Refetch posts to ensure data consistency
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

    const navigateToBlog = (postId: string) => {
        handleView(postId);
        navigate(`/blog/${postId}`);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <Card key={index} className="overflow-hidden animate-pulse">
                            <div className="h-48 bg-muted"></div>
                            <CardHeader>
                                <div className="h-6 w-3/4 bg-muted rounded"></div>
                                <div className="h-4 w-full bg-muted rounded mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="h-6 w-16 bg-muted rounded"></div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center text-red-500">
                    Error loading posts. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Recent Blogs</h2>
                <Link to="/blog">
                    <Button variant="outline">View All Blogs</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.filter(post => post.status === 'Published').slice(0, 4).map((post) => {
                    // Safely extract content text with error handling
                    let contentText = '';
                    try {
                        const parsedContent = JSON.parse(post.content);
                        contentText = parsedContent?.content?.[0]?.content?.[0]?.text || 'No content available';
                    } catch (e) {
                        contentText = 'Content unavailable';
                    }

                    return (
                        <Card
                            key={post._id}
                            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigateToBlog(post._id)}
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">
                                            By {post.author?.name || 'Unknown Author'}
                                        </span>
                                    </p>
                                    <span>•</span>
                                    <p>{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
                                </div>
                                <h3 className="text-2xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                    {contentText}
                                </p>

                                <div className="mt-auto">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.tags.slice(0, 3).map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/blog?tag=${tag}`);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <Badge variant="outline">+{post.tags.length - 3}</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <Link
                                            to={`/blog/${post._id}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(post._id);
                                            }}
                                            className="text-primary hover:underline"
                                        >
                                            Read more
                                        </Link>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <button
                                                onClick={(e) => handleLike(e, post._id)}
                                                className={`flex items-center gap-1 hover:text-primary transition-colors ${post.liked ? 'text-red-500' : ''}`}
                                                disabled={!userId}
                                            >
                                                <Heart className={`h-4 w-4 ${post.liked ? 'fill-red-500' : ''}`} />
                                                <span>{post.likes || 0}</span>
                                            </button>

                                            <span className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                <span>{post.views || 0}</span>
                                            </span>

                                            <Link
                                                to={`/blog/${post._id}#comments`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleView(post._id);
                                                }}
                                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentBlog;
