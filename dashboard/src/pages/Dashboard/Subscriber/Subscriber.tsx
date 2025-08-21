import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getAllSubscribers, subscribe, unsubscribe } from "@/http";
import { DataTable } from "@/userDefinedComponents/DataTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowUpDown,
    Mail,
    Users,
    Calendar,
    Trash2,
    MoreHorizontal,
    AlertCircle,
    RefreshCw,
    UserPlus
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import moment from 'moment';
import { ColumnDef } from "@tanstack/react-table";


const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const Subscriber = () => {
    const [emailInput, setEmailInput] = useState<string>('');
    const { data, isLoading, isError } = useQuery({
        queryKey: ['subscribers'],
        queryFn: getAllSubscribers,
        staleTime: 10000, // in Milliseconds
    });
    const queryClient = useQueryClient();
    const subscribeMutation = useMutation({
        mutationFn: (data: { email: string[] }) => subscribe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscribers'] });
            toast({
                title: 'Subscriber added successfully',
                description: 'The subscriber has been added successfully.',
            });
        },
        onError: (error: any) => {
            const { response } = error;
            if (response && response.data) {
                const { error: errorMessage, existingEmails } = response.data;
                toast({
                    title: 'Failed to add subscriber as a test',
                    description: existingEmails ? `The following emails are already subscribed: ${existingEmails.join(', ')}. ${errorMessage}` : errorMessage,
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Failed to add subscriber',
                    description: `An unexpected error occurred: ${error.message}. Please try again later.`,
                    variant: 'destructive'
                });
            }
        }
    });
    const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission
        const emailArray = emailInput.split(/[,;]\s*/).map(email => email.trim()).filter(email => email !== '');
        if (emailArray.length === 0) {
            toast({
                title: 'Failed to add subscriber',
                description: `An error occurred while adding the subscriber: ${error.message}. Please try with valid email.`,
                variant: 'destructive'
            });
            return;
        }
        const validEmails = emailArray.filter(isValidEmail);
        const invalidEmails = emailArray.filter(email => !isValidEmail(email));
        if (invalidEmails.length > 0) {
            toast({
                title: 'Invalid email addresses',
                description: `The following email addresses are invalid: ${invalidEmails.join(', ')}. Please correct them.`,
                variant: 'destructive'
            });
            return;
        }
        try {
            await subscribeMutation.mutateAsync({ email: validEmails });
            toast({
                title: 'Subscriber added successfully',
                description: `The subscriber has been added successfully.`,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'An unexpected error occurred. Please try again later.';
            toast({
                title: 'Failed to add subscriber',
                description: errorMessage,
                variant: 'destructive'
            });
        }
    };

    const deleteMutation = useMutation({
        mutationFn: unsubscribe,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['subscribers'] });
            toast({
                title: "Subscriber removed successfully",
                description: "The Subscriber has been removed successfully.",
            });
        },
        onError: (error) => {
            console.error("Error removing Subscriber:", error);
        }
    });
    const handleDeleteSubscribers = async (email: string) => {
        try {
            await deleteMutation.mutateAsync({ email });
        } catch (error) {
            toast({
                title: "Failed to remove subscriber",
                description: `An unexpected error occurred. Please try again later.${error}`,
                variant: "destructive",
            })
        }
    };
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="flex items-center gap-2"
                    >
                        <Mail className="h-4 w-4" />
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-medium text-sm">{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "roles",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="flex items-center gap-2"
                    >
                        <Users className="h-4 w-4" />
                        Role
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: () => (
                <div className="text-sm text-muted-foreground">Subscriber</div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="flex items-center gap-2"
                    >
                        <Calendar className="h-4 w-4" />
                        Joined Date
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
            },
        },
        {
            id: "actions",
            header: () => (
                <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Actions</span>
                </div>
            ),
            enableHiding: true,
            cell: ({ row }) => {
                const subscriber = row.original

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
                            <DropdownMenuItem
                                onClick={() => handleDeleteSubscribers(subscriber.email)}
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3 w-3" />
                                Unsubscribe
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
    // Render the page content
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12" />
                        ))}
                    </div>
                </div>
            )
        }

        if (isError) {
            return (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Subscribers</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            We encountered an error while fetching subscribers. Please try again.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        if (!data || data.length === 0) {
            return (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Subscribers Yet</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Start building your subscriber list by adding email addresses below.
                        </p>
                        <div className="w-full max-w-md space-y-4">
                            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                                <Input
                                    name="emails"
                                    type="text"
                                    placeholder="Enter emails separated by commas ( ,) or semicolons ( ;)"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    required
                                />
                                <Button type="submit" disabled={subscribeMutation.isPending} className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Add Subscribers
                                </Button>
                            </form>
                            {subscribeMutation.isError && (
                                <p className="text-destructive text-sm text-center">
                                    {subscribeMutation.error?.response?.data?.error || 'An unexpected error occurred. Please try again later.'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-6">
                {/* Add Subscriber Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add New Subscribers
                        </CardTitle>
                        <CardDescription>
                            Add new email addresses to your subscriber list. You can add multiple emails separated by commas or semicolons.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                            <Input
                                name="emails"
                                type="text"
                                placeholder="Enter emails separated by commas ( ,) or semicolons ( ;)"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                required
                                className="w-full"
                            />
                            <Button type="submit" disabled={subscribeMutation.isPending} className="flex items-center gap-2 w-fit">
                                <UserPlus className="h-4 w-4" />
                                {subscribeMutation.isPending ? 'Adding...' : 'Add Subscribers'}
                            </Button>
                        </form>
                        {subscribeMutation.isError && (
                            <p className="text-destructive text-sm mt-3">
                                {subscribeMutation.error?.response?.data?.error || 'An unexpected error occurred. Please try again later.'}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Subscribers Table Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Subscribers ({data.length})
                        </CardTitle>
                        <CardDescription>
                            Manage your email subscribers and their subscription status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable data={data} columns={columns} colum="email" place="&nbsp;&nbsp;&nbsp;&nbsp; Filter Subscribers..." />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            {renderContent()}
        </div>
    )
}

export default Subscriber