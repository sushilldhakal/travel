import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteComment, editComment, getAllComments } from "@/http/api"
import { Link } from "react-router-dom"
import moment from "moment"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Comment {
    id: string
    user: string
    text: string
    post: string
    createdAt: string
    status: "pending" | "approved" | "rejected"
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
            const user = row.getValue("user");
            return <div className="truncate max-w-[100px]"><Link to={`/dashboard/users/${user?._id}`}>{user?.name}</Link></div>; // Render the user's name
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
                            <Button className="bg-transparent text-primary hover:bg-transparent" onClick={() => handleAcceptComment(comment?._id)}>Accept</Button>
                            <Button className="bg-transparent text-primary hover:bg-transparent" onClick={() => handleDeleteComment(comment?._id)}>Delete</Button>
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
            const post = row.getValue("post");
            return <div className="truncate max-w-[200px]"><Link to={`/dashboard/posts/edit_posts/${post?._id}`} >{post?.title}</Link></div>; // Render the user's name
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

        cell: ({ row }) => <div className="capitalize truncate max-w-[100px]">{row.getValue("approve") === false && "Pending" || "Approved"}</div>,
    },
]

export default function Comments() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const queryClient = useQueryClient();

    const { data: initialCommentData, isLoading, isError } = useQuery({
        queryKey: ['comments'],
        queryFn: getAllComments,
        staleTime: 10000, // in Milliseconds
    });

    const { toast } = useToast();

    console.log("initialCommentData", initialCommentData)

    // Mutation for accepting comments
    const acceptMutation = useMutation({
        mutationFn: ({ data, commentId }: { data: FormData, commentId: string }) => editComment(data, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast({
                title: 'Comment Approved',
                description: 'The comment has been approved.',
                duration: 3000,
            });
        },
    });

    // Mutation for deleting comments
    const deleteMutation = useMutation({
        mutationFn: (commentIds: string) => deleteComment(commentIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast({
                title: 'Comment Deleted',
                description: 'The comment has been deleted.',
                variant: 'success',
                duration: 3000,
            });
        },
    });


    const handleAcceptComment = (_id: string) => {
        const formdata = new FormData();
        formdata.append('approve', "true");
        // Wrap both formdata and _id in an object and pass to mutate
        acceptMutation.mutate({ data: formdata, commentId: _id });
    }

    const handleDeleteComment = (_id: string) => {
        deleteMutation.mutate(_id);
    }

    const table = useReactTable({
        data: initialCommentData?.data.data.comments || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        meta: {
            handleAcceptComment,
            handleDeleteComment,
        },
    })

    const currentPageSize = table.getState().pagination.pageSize.toString();


    const handleBulkAccept = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const selectedIds = selectedRows.map(row => row.original._id)
        console.log(`Accepting comments with ids: ${selectedIds.join(", ")}`)
        // Implement the logic for bulk accept
    }

    const handleBulkDelete = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const selectedIds = selectedRows.map(row => row.original._id)
        deleteMutation.mutate(selectedIds.join(", "));
        // Implement the logic for bulk delete
    }


    if (isLoading) {
        return <div>Loading comments...</div>;
    }

    if (isError) {
        return <div>Error loading comments.</div>;
    }


    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter comments..."
                    value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("text")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Button
                    variant="outline"
                    onClick={handleBulkAccept}
                    className="ml-auto"
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Accept Selected
                </Button>
                <Button
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="ml-2"
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-2">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex items-center gap-2">
                    <Button
                        className="border rounded p-1"
                        variant="outline"
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft />
                    </Button>
                    <Button
                        className="border rounded p-1"
                        variant="outline"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        className="border rounded p-1"
                        variant="outline"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight />
                    </Button>
                    <Button
                        className="border rounded p-1"
                        variant="outline"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight />
                    </Button>
                    <span className="flex items-center gap-1">
                        <div>Page</div>
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount().toLocaleString()}
                        </strong>
                    </span>
                    <span className="flex items-center gap-1">
                        | Go to page:
                        <Input
                            type="number"
                            min="1"
                            max={table.getPageCount()}
                            defaultValue={table.getState().pagination.pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0
                                table.setPageIndex(page)
                            }}
                            className="border p-1 rounded w-16"
                        />
                    </span>
                    <Select
                        value={currentPageSize}
                        onValueChange={value => {
                            // Convert the selected value back to a number
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    Show {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
