import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { getAllSubscribers, subscribe, unsubscribe } from "@/http";
import { DataTable } from "@/userDefinedComponents/DataTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


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
    const columns: ColumnDef<Tour>[] = [
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("email")}</div>
            ),
        },

        {
            accessorKey: "roles",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Roles
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize">Subscribers</div>
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
                const date = new Date(row.getValue("createdAt"))
                return <div className="text-left font-medium">{date.toLocaleDateString("en-US")}</div>
            },


        },
        {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"

                    >
                        Action
                    </Button>
                )
            },
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const subscribers = row.original

                return (
                    <div>
                        <Button className="py-1 px-2" variant="destructive" onClick={() => handleDeleteSubscribers(subscribers.email)}> Delete</Button>
                    </div>
                )
            },
        },
    ]
    let content;

    if (isLoading) {
        content = <div><Skeleton /></div>;
    }

    else if (isError) {
        content = <div>Error fetching subscribers. Please try again later.</div>;
    } else if (data && data.length > 0) {
        content = <div>

            <div className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Subscribe to our newsletter</h2>
                <p className="text-muted-foreground">Stay up to date with our latest news, offers, and updates.</p>
                <form onSubmit={handleSubscribe} className="flex flex-col w-full max-w-md gap-2">
                    <Input
                        name="emails"
                        type="text"
                        placeholder="Enter emails separated by commas ( ,) or semicolons ( ;)"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={subscribeMutation.isLoading}>
                        Subscribe
                    </Button>
                </form>
                {subscribeMutation.isError && (
                    <p className="text-red-500">
                        {subscribeMutation.error?.response?.data?.error || 'An unexpected error occurred. Please try again later.'}
                    </p>
                )}
            </div>
            <DataTable data={data} columns={columns} colum="email" place="Filter Subscribers..." /></div>;
    } else {
        content = <div>Please create Subscribers</div>
    }

    return content
}

export default Subscriber