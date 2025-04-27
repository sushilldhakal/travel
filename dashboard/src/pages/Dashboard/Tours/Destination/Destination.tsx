import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/util/AuthLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Search, X } from "lucide-react";
import SingleDestination from "@/pages/Dashboard/Tours/Destination/SingleDestination";
import AddDestination from "@/pages/Dashboard/Tours/Destination/AddDestination";
import { getUserDestinations } from "@/http";

// Create a type for Destination data
export interface DestinationData {
    id: string;
    name: string;
    coverImage: string | null;
    description: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
}

const Destination = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingDestination, setIsAddingDestination] = useState(false);

    // Fetch destinations data
    const { data: destinations, isLoading, isError } = useQuery({
        queryKey: ['destinations', userId],
        queryFn: () => getUserDestinations(userId),
        enabled: !!userId,
    });

    console.log("destinations", destinations);

    // Filter destinations based on search query
    const filteredDestinations = Array.isArray(destinations)
        ? destinations.filter((destination: DestinationData) =>
            destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (destination.description &&
                destination.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Tour Destinations</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search destinations..."
                            className="!pl-8 w-full sm:w-[250px] bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full aspect-square rounded-l-none"
                                onClick={() => setSearchQuery("")}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear search</span>
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={() => setIsAddingDestination(!isAddingDestination)}
                        className="gap-1.5"
                    >
                        {isAddingDestination ? (
                            <>
                                <X className="h-4 w-4" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Destination
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {isAddingDestination && (
                <>
                    <Separator className="my-4" />
                    <AddDestination
                        onDestinationAdded={() => {
                            setIsAddingDestination(false);
                            if (userId) {
                                queryClient.invalidateQueries({
                                    queryKey: ['destinations', userId]
                                });
                            }
                        }}
                    />
                </>
            )}

            <Separator className="my-4" />

            {/* Destinations list */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="shadow-sm overflow-hidden">
                            <Skeleton className="h-[200px] w-full" />
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-6 w-[150px]" />
                                </div>
                                <Skeleton className="h-4 w-full mt-4" />
                                <Skeleton className="h-4 w-[80%] mt-2" />
                                <div className="flex justify-end gap-2 mt-4">
                                    <Skeleton className="h-9 w-9 rounded-md" />
                                    <Skeleton className="h-9 w-9 rounded-md" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : isError ? (
                    // Error state
                    <Card className="col-span-full shadow-sm border-destructive/50 bg-destructive/5">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <X className="h-8 w-8 text-destructive" />
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-destructive">Failed to load destinations</p>
                                    <p className="text-sm text-muted-foreground">There was an error loading your destinations.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (userId) {
                                            queryClient.invalidateQueries({
                                                queryKey: ['destinations', userId]
                                            });
                                        }
                                    }}
                                    className="mt-2"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredDestinations && filteredDestinations.length > 0 ? (
                    // Destinations list
                    filteredDestinations.map((dest) => (
                        <SingleDestination
                            key={dest.id || dest._id}
                            destinationId={dest.id || dest._id}
                            onUpdate={() => {
                                if (userId) {
                                    queryClient.invalidateQueries({
                                        queryKey: ['destinations', userId]
                                    });
                                }
                            }}
                        />
                    ))
                ) : destinations && destinations.length > 0 ? (
                    // No search results
                    <Card className="col-span-full shadow-sm border-primary/20 bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <Search className="h-8 w-8 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-lg font-medium">No matching destinations</p>
                                    <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2"
                                >
                                    Clear Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Empty state
                    <Card className="col-span-full shadow-sm border-primary/20 bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <MapPin className="h-8 w-8 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-lg font-medium">No destinations found</p>
                                    <p className="text-sm text-muted-foreground">Get started by adding your first destination.</p>
                                </div>
                                <Button
                                    onClick={() => setIsAddingDestination(true)}
                                    className="mt-2"
                                >
                                    Add Destination
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Destination;
