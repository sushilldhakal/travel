import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getPost, getUserById } from "@/http/api";
import { format } from "date-fns";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    author: string;
    tags: string[];
    image: string;
    status: 'Published' | 'Draft';
    likes: number;
    comments: string[];
    enableComments: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
}

interface PostResponse {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    posts: Post[];
}

const RecentBlog: React.FC = () => {
    const { data: response, isLoading: postsLoading, error: postsError } = useQuery<{ data: PostResponse }>({
        queryKey: ['posts'],
        queryFn: getPost,
        select: (response) => response.data
    });

    // Fetch authors for all posts
    const authorQueries = useQueries({
        queries: (response?.posts ?? []).map(post => ({
            queryKey: ['user', post.author],
            queryFn: () => getUserById(post.author),
            select: (response: { data: User }) => response.data
        }))
    });

    const isLoading = postsLoading || authorQueries.some(query => query.isLoading);
    const error = postsError || authorQueries.some(query => query.error);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, index) => (
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
            <h2 className="text-3xl font-bold mb-8">Recent Blogs</h2>
            <div className="space-y-6">
                {response?.posts?.map((post, index) => {
                    const authorData = authorQueries[index]?.data;
                    return (
                        <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                <div className="relative w-full md:w-1/3 h-64 md:h-auto">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col h-full">
                                        <div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                <p className="flex items-center gap-2">
                                                    <span className="font-medium text-foreground">By {authorData?.name || 'Unknown Author'}</span>
                                                </p>
                                                <span>•</span>
                                                <p>{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                                            <p className="text-muted-foreground mb-4 line-clamp-2">
                                                {JSON.parse(post.content).content[0].content[0].text}
                                            </p>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {post.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <span>💬</span>
                                                    {post.comments.length} Comments
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span>👁️</span>
                                                    {post.views} Views
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span>❤️</span>
                                                    {post.likes} Likes
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentBlog;