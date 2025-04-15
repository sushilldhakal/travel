import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deletePost, getAllUserPosts } from "@/http";
import { DataTable } from "@/userDefinedComponents/DataTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CirclePlus } from "lucide-react";
import type { Post } from "@/Provider/types"
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import useTokenStore from "@/store/store";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import routePaths from "@/lib/routePath";
const Post = () => {
    const [filterPost, setFilterPost] = useState([]);
    const { toast } = useToast()
    const { token } = useTokenStore(state => state);
    const decodedToken = jwtDecode(token);
    const currentUserRole = decodedToken?.roles || "";
    const currentUserId = decodedToken.sub;
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['posts'],
        queryFn: getAllUserPosts,
        staleTime: 10000, // in Milliseconds
    });

    console.log("data", data)

    // useEffect(() => {
    //     if (data) {
    //         if (currentUserRole === "admin") {
    //             setFilterPost(data.data.posts);
    //         } else {
    //             const userPost = data?.data?.posts?.filter(post => post.author.some(author => author._id === currentUserId));
    //             setFilterPost(userPost);
    //         }
    //     }
    // }, [data, currentUserRole, currentUserId]);

    console.log(data?.data?.posts)

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
                    <span>Image</span>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize image-area">
                    <Link to={`/dashboard/posts/edit_posts/${row.original._id}`}><img className="w-10 h-auto" src={row.getValue("image")} alt={row.getValue("image")} /></Link>
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
                    >
                        Posts
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize"><Link to={`/dashboard/posts/edit_posts/${row.original._id}`}>{row.getValue("title")}</Link></div>
            ),
        },
        {
            header: "Author",
            cell: ({ row }) => {
                return (
                    <div>
                        {Array.isArray(row.original.author) ? (
                            row.original.author.map((autho, i) => (
                                <div className="capitalize" key={i}>{autho.name}</div>
                            ))
                        ) : (
                            <div className="capitalize">{row.original.author.name}</div>
                        )}
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
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("status")}</div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt")
                return createdAt ? moment(createdAt.toString()).format("LL") : ""
            }

        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const post = row.original

                return (
                    <div>
                        <Button className="py-1 px-2 mr-2" variant="outline">
                            <Link to={`/dashboard/posts/edit_posts/${post._id}`} className="py-1 px-2">
                                Edit
                            </Link>
                        </Button>

                        <Button className="py-1 px-2" variant="destructive"
                            onClick={() => handleDeletePost(post._id)}
                        > Delete</Button>
                    </div>
                )
            },
        },
    ]

    let content;

    const createPost = <div className="hidden items-center gap-2 md:ml-auto md:flex">
        <Link to={routePaths.dashboard.addPost} className='top-12 right-5 absolute'>
            <Button>
                <CirclePlus size={20} />
                <span className="ml-2">Add Post</span>
            </Button>
        </Link>
    </div>

    if (isLoading) {
        content = <div>{createPost}<Skeleton /></div>;
    } else if (isError) {
        content = <div>{createPost}Error fetching posts. Please try again later.</div>;
    } else if (data && data?.data.posts.length > 0) {
        content = <div>{createPost}<DataTable data={tableData} columns={columns} place="Filter posts..." colum="title" /></div>;
    } else {
        content = <div>{createPost}"Please add posts to your database";</div>
    }

    return content
}


export default Post