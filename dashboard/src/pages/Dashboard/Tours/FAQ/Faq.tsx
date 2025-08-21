import { useQueryClient } from "@tanstack/react-query";
import { deleteFaq } from "@/http";
import { toast } from "@/components/ui/use-toast";
import AddFaq from "./AddFaq";
import { getUserId } from "@/util/authUtils";
import SingleFaq from "./SingleFaq";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaq } from "./useFaq";

const TourFaqs = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);

    const { data: faqs, isLoading, isError } = useFaq(userId);

    const handleDeleteFaqs = async (faqId: string) => {
        try {
            await deleteFaq(faqId);
            toast({
                title: 'FAQ deleted successfully',
                description: 'The FAQ has been removed.',
            });
            queryClient.invalidateQueries({
                queryKey: ['Faq', userId], // Match the query key used in useQuery (with capital F)
            });
        } catch (error) {
            toast({
                title: 'Failed to delete FAQ',
                description: 'An error occurred while deleting the FAQ.',
            });
        }
    };

    // Filter FAQs based on search query
    const filteredFaqs = faqs?.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h1>
                    </div>
                    <Button
                        onClick={() => setIsAddFaqOpen(!isAddFaqOpen)}
                        className="flex items-center gap-2"
                    >
                        {isAddFaqOpen ? "Close Form" : "Add New FAQ"}
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Add FAQ Form (conditionally displayed) */}
                {isAddFaqOpen && (
                    <div className="w-full">
                        <AddFaq onFaqAdded={() => {
                            if (userId) {
                                queryClient.invalidateQueries({
                                    queryKey: ['Faq', userId] // Match the query key used in useQuery (with capital F)
                                });
                                setIsAddFaqOpen(false);
                            }
                        }} />
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder=" Search FAQs by question or answer..."
                        className="!pl-10 max-w-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* FAQs List */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="bg-secondary/50 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">Tour FAQs</CardTitle>
                        </div>
                        <CardDescription>
                            Answer common questions about your tours
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
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
                                <p className="font-medium">Failed to load FAQs</p>
                                <p className="text-sm">Please try refreshing the page or check your connection.</p>
                            </div>
                        ) : filteredFaqs?.length ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredFaqs.map((faq) => (
                                    <SingleFaq
                                        key={faq.id}
                                        faq={faq}
                                        DeleteFaq={handleDeleteFaqs}
                                    />
                                ))}
                            </div>
                        ) : faqs?.length ? (
                            <div className="text-center py-8">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-medium text-lg mb-1">No matching FAQs found</h3>
                                <p className="text-muted-foreground">Try adjusting your search query</p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                                <h3 className="font-medium text-lg mb-2">No FAQs added yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    Create FAQs to answer common questions about your tours.
                                    They'll appear here once added.
                                </p>
                                <Button
                                    onClick={() => setIsAddFaqOpen(true)}
                                    variant="outline"
                                    className="mx-auto"
                                >
                                    Create your first FAQ
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TourFaqs;
