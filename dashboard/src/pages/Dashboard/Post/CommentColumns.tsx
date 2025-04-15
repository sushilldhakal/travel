import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "react-router-dom"
import moment from "moment"

interface User {
    _id: string
    name: string
}

interface Post {
    _id: string
    title: string
}

interface Comment {
    id: string
    user: User
    text: string
    post: Post
    createdAt: string
    status: "pending" | "approved" | "rejected"
    _id: string
    approve: boolean
    created_at: string
}

export const columns: ColumnDef<Comment>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
            const user = row.getValue("user") as User;
            return <div className="truncate max-w-[100px]"><Link to={`/dashboard/users/${user._id}`}>{user.name}</Link></div>;
        },
    },
    {
        accessorKey: "text",
        header: "Comment",
        cell: ({ row, table }) => {
            const comment = row.original
            const { handleAcceptComment, handleDeleteComment } = table.options.meta as {
                handleAcceptComment: (_id: string) => void
                handleDeleteComment: (_id: string) => void
            }
            return (
                <div className="truncate max-w-[500px]">{row.getValue("text")}
                    <br />
                    {row.getValue("approve") === false &&
                        <>
                            <Button className="bg-transparent text-primary hover:bg-transparent" onClick={() => handleAcceptComment(comment._id)}>Accept</Button>
                            <Button className="bg-transparent text-primary hover:bg-transparent" onClick={() => handleDeleteComment(comment._id)}>Delete</Button>
                        </>
                    }
                </div>
            )
        }
    },
    {
        accessorKey: "post",
        header: "Response to",
        cell: ({ row }) => {
            const post = row.getValue("post") as Post;
            return <div className="truncate max-w-[200px]"><Link to={`/dashboard/posts/edit_posts/${post._id}`}>{post.title}</Link></div>;
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const created_at = row.getValue("created_at")
            return created_at ? <div className="capitalize truncate max-w-[150px]">{moment(created_at.toString()).format("LL")}</div> : ""
        }
    },
    {
        accessorKey: "approve",
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
        cell: ({ row }) => <div className="capitalize truncate max-w-[100px]">{row.getValue("approve") === false ? "Pending" : "Approved"}</div>,
    },
]
