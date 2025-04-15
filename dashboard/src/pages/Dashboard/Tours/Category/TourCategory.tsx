import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserCategories, deleteCategory } from "@/http";
import { toast } from "@/components/ui/use-toast";
import SingleCategory from "./SingleCategory";
import AddCategory from "./AddCategory";
import { getUserId } from "@/util/AuthLayout";
import { CategoryData } from "@/Provider/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    CameraIcon, 
    Folder, 
    FolderPlus, 
    Loader2, 
    Plus, 
    Search, 
    X 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TourCategory = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    
    // Fetch all categories for the user
    const { data: categories, isLoading, isError } = useQuery<CategoryData[], Error>({
        queryKey: ['categories', userId],
        queryFn: () => userId ? getUserCategories(userId) : Promise.reject('No user ID provided'),
        enabled: !!userId,
    });

    // Filter categories based on search query
    const filteredCategories = categories?.filter(category => {
        const nameMatch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
        const descriptionMatch = category.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || descriptionMatch;
    });

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteCategory(categoryId);
            toast({
                title: 'Category deleted successfully',
                description: 'The category has been removed.',
                variant: 'default',
            });
            queryClient.invalidateQueries({
                queryKey: ['categories', userId], // Match the query key used in useQuery
            });
        } catch (error) {
            toast({
                title: 'Failed to delete category',
                description: 'An error occurred while deleting the category.',
                variant: 'destructive',
            });
        }
    };

    // Generate skeleton cards for loading state
    const skeletonCards = Array(6).fill(0).map((_, index) => (
        <Card key={`skeleton-${index}`} className="shadow-sm animate-pulse">
            <div className="w-full h-[200px] bg-muted rounded-t-md"></div>
            <CardContent className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-16 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardContent>
        </Card>
    ));

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Folder className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Tour Categories</h1>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search categories..."
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
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="gap-1.5"
                    >
                        {isAddingCategory ? (
                            <>
                                <X className="h-4 w-4" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <FolderPlus className="h-4 w-4" />
                                Add Category
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {isAddingCategory && (
                <>
                    <Separator className="my-4" />
                    <AddCategory 
                        onCategoryAdded={() => {
                            setIsAddingCategory(false);
                            if (userId) {
                                queryClient.invalidateQueries(['categories', userId]);
                            }
                        }} 
                    />
                </>
            )}

            <Separator className="my-4" />

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skeletonCards}
                </div>
            ) : isError ? (
                <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-3">
                            <CameraIcon className="h-8 w-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-destructive">Failed to load categories</h3>
                        <p className="text-sm text-muted-foreground">There was an error loading your categories. Please try refreshing the page.</p>
                        <Button 
                            className="mt-4" 
                            variant="outline"
                            onClick={() => queryClient.invalidateQueries(['categories', userId])}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredCategories && filteredCategories.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                        <SingleCategory
                            key={category.id}
                            category={category}
                            DeleteCategory={handleDeleteCategory}
                        />
                    ))}
                </div>
            ) : categories && categories.length > 0 ? (
                <Card className="border-muted/50 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-3">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No matching categories</h3>
                        <p className="text-sm text-muted-foreground">
                            No categories match your search for "<span className="font-medium">{searchQuery}</span>".
                        </p>
                        <Button 
                            className="mt-4" 
                            variant="outline"
                            onClick={() => setSearchQuery("")}
                        >
                            Clear Search
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-muted/50 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-3">
                            <FolderPlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                        <p className="text-sm text-muted-foreground">You haven't created any categories yet. Get started by adding your first category.</p>
                        <Button 
                            className="mt-4" 
                            onClick={() => setIsAddingCategory(true)}
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Create First Category
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TourCategory;
