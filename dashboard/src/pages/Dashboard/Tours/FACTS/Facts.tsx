import { useQueryClient } from "@tanstack/react-query";
import { deleteFacts } from "@/http";
import { toast } from "@/components/ui/use-toast";
import AddFact from "./AddFacts";
import { getUserId } from "@/util/authUtils";
import SingleFact from "./SingleFacts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useFacts } from "./useFacts";

const TourFacts = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddFactOpen, setIsAddFactOpen] = useState(false);

    const { data: facts, isLoading, isError } = useFacts(userId);

    const handleDeleteFacts = async (factId: string) => {
        try {
            await deleteFacts(factId);
            toast({
                title: 'Fact deleted successfully',
                description: 'The fact has been removed.',
                variant: 'default',
            });
            queryClient.invalidateQueries({
                queryKey: ['Facts', userId], // Match the query key used in useQuery (with capital F)
            });
        } catch (error) {
            toast({
                title: 'Failed to delete fact',
                description: 'An error occurred while deleting the fact.',
                variant: 'destructive',
            });
        }
    };

    // Filter facts based on search query
    const filteredFacts = facts?.filter(fact =>
        fact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fact.field_type?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (Array.isArray(fact.value) && fact.value.some((val: string) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Tour Facts</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder=" Search facts by name, type or value..."
                                className="!pl-8 max-w-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setIsAddFactOpen(!isAddFactOpen)}
                            className="flex items-center gap-2"
                        >
                            {isAddFactOpen ? "Close Form" : "Add New Fact"}
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <Separator className="my-4" />
                {/* Add Fact Form (conditionally displayed) */}
                {isAddFactOpen && (
                    <div className="w-full">
                        <AddFact
                            onFactAdded={() => {
                                if (userId) {
                                    queryClient.invalidateQueries({
                                        queryKey: ['Facts', userId]  // Capital 'F' to match useFacts.ts
                                    });
                                    setIsAddFactOpen(false);
                                }
                            }} />
                    </div>
                )}



                {/* Facts List */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="bg-secondary/50 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">Tour Facts</CardTitle>
                        </div>
                        <CardDescription>
                            Manage important facts about your tours
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="shadow-sm">
                                        <CardHeader className="space-y-2 pb-4">
                                            <Skeleton className="h-4 w-full max-w-[250px]" />
                                            <Skeleton className="h-3 w-full max-w-[200px]" />
                                        </CardHeader>
                                        <CardContent className="pb-6">
                                            <Skeleton className="h-20 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="bg-destructive/10 text-destructive rounded-md p-4">
                                <p className="font-medium">Failed to load facts</p>
                                <p className="text-sm">Please try refreshing the page or check your connection.</p>
                            </div>
                        ) : filteredFacts?.length ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredFacts.map((fact, index) => (
                                    <SingleFact
                                        key={`fact-${index}`} // Using index as a fallback key since _id might be missing
                                        fact={fact}
                                        DeleteFact={handleDeleteFacts}
                                    />
                                ))}
                            </div>
                        ) : facts?.length ? (
                            <div className="text-center py-8">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-medium text-lg mb-1">No matching facts found</h3>
                                <p className="text-muted-foreground">Try adjusting your search query</p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                                <h3 className="font-medium text-lg mb-2">No facts added yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    Facts provide important information about your tours.
                                    They'll appear here once added.
                                </p>
                                <Button
                                    onClick={() => setIsAddFactOpen(true)}
                                    variant="outline"
                                    className="mx-auto"
                                >
                                    Create your first fact
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TourFacts;
