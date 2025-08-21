import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePost, getAllUserPosts } from "@/http";
import { DataTable } from "@/userDefinedComponents/DataTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
    ArrowUpDown,
    CirclePlus,
    FileText,
    User,
    Calendar,
    Edit3,
    Trash2,
    Eye,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreHorizontal
} from "lucide-react";
import type { Post } from "@/Provider/types"
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";
import { Link } from "react-router-dom";
import routePaths from "@/lib/routePath";
const Post = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['posts'],
        queryFn: getAllUserPosts,
        staleTime: 10000, // in Milliseconds
    });

    // Helper function to get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'published':
                return 'default';
            case 'draft':
                return 'secondary';
            case 'pending':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'published':
                return <CheckCircle2 className="h-3 w-3" />;
            case 'draft':
                return <Clock className="h-3 w-3" />;
            case 'pending':
                return <AlertCircle className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    const mutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast({
                title: "Post deleted successfully",
                description: "The post has been deleted successfully.",
            });
        },
        onError: (error: unknown) => {
            console.error("Error deleting post:", error);
        }
    });

    const handleDeletePost = async (postId: string) => {
        try {
            await mutation.mutateAsync(postId);
        } catch (error) {
            toast({
                title: "Failed to delete tour",
                description: `An error occurred while deleting the tour. Please try again later.${error}`,
            });
        }
    };

    const tableData = data?.data?.posts;
    const columns: ColumnDef<Post>[] = [
        {
            accessorKey: "image",
            header: () => {
                return (
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>Preview</span>
                    </div>
                )
            },
            cell: ({ row }) => (
                <div className="image-area">
                    <Link to={`/dashboard/posts/edit_posts/${row.original._id}`} className="block">
                        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                            <img
                                className="w-full h-16 object-cover transition-transform hover:scale-105"
                                src={row.getValue("image")}
                                alt={row.getValue("title") || "Post image"}
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-image.jpg';
                                }}
                            />
                        </div>
                    </Link>
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Posts
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <Link
                        to={`/dashboard/posts/edit_posts/${row.original._id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                        {row.getValue("title")}
                    </Link>
                </div>
            ),
        },
        {
            header: "Author",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                            {Array.isArray(row.original.author) ? (
                                row.original.author.map((author, i) => (
                                    <div className="text-sm font-medium" key={i}>
                                        {author.name}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm font-medium">
                                    {row.original.author.name}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge
                        variant={getStatusBadgeVariant(status)}
                        className="flex items-center gap-1 w-fit"
                    >
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt")
                return (
                    <div className="text-sm text-muted-foreground">
                        {createdAt ? moment(createdAt.toString()).format("MMM DD, YYYY") : "--"}
                    </div>
                )
            }
        },
        {
            id: "actions",
            enableHiding: true,
            header: () => (
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Actions</span>
                </div>
            ),
            cell: ({ row }) => {
                const post = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                                Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    to={`/dashboard/posts/edit_posts/${post._id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Edit3 className="h-3 w-3" />
                                    Edit Post
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDeletePost(post._id)}
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3 w-3" />
                                Delete Post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-16 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-3 w-[100px]" />
                                </div>
                                <Skeleton className="h-6 w-[80px]" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-[60px]" />
                                    <Skeleton className="h-8 w-[70px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Error state component
    const ErrorState = () => (
        <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Posts</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                    We encountered an error while fetching your posts. Please try again later.
                </p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2"
                >
                    <CirclePlus className="h-4 w-4" />
                    Retry
                </Button>
            </CardContent>
        </Card>
    );

    // Empty state component
    const EmptyState = () => (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Posts Yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                    Get started by creating your first post. Share your thoughts, stories, and experiences with your audience.
                </p>
                <Button asChild className="flex items-center gap-2">
                    <Link to={routePaths.dashboard.addPost}>
                        <CirclePlus className="h-4 w-4" />
                        Create Your First Post
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );

    // Header component
    const PostsHeader = () => (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 dark:bg-transparent light:bg-transparent">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Posts Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage and organize all your blog posts
                </p>
            </div>
            <Button asChild className="flex items-center gap-2">
                <Link to={routePaths.dashboard.addPost}>
                    <CirclePlus className="h-4 w-4" />
                    Add New Post
                </Link>
            </Button>
        </div>
    );

    // Main content
    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton />;
        }

        if (isError) {
            return (
                <>
                    <PostsHeader />
                    <ErrorState />
                </>
            );
        }

        if (data && data?.data.posts.length > 0) {
            return (
                <>
                    <PostsHeader />
                    <Card className="dark:bg-transparent light:bg-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                All Posts ({data.data.posts.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="dark:bg-transparent light:bg-transparent">
                            <DataTable
                                data={tableData}
                                columns={columns}
                                place="Filter posts..."
                                colum="title"
                            />
                        </CardContent>
                    </Card>
                </>
            );
        }

        return (
            <>
                <PostsHeader />
                <EmptyState />
            </>
        );
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {renderContent()}
        </div>
    );
}


export default Post