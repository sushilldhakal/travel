
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserCategories, deleteCategory } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import SingleCategory from "./SingleCategory";
import AddCategory from "./AddCategory";
import { getUserId } from "@/util/AuthLayout";
import { CategoryData } from "@/Provider/types";

const TourCategory = () => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    // Fetch all categories for the user
    const { data: categories, isLoading, isError } = useQuery<CategoryData[], Error>({
        queryKey: ['categories', userId],
        queryFn: () => userId ? getUserCategories(userId) : Promise.reject('No user ID provided'),
        enabled: !!userId,
    });

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteCategory(categoryId);
            toast({
                title: 'Category deleted successfully',
                description: 'The category has been removed.',
            });
            queryClient.invalidateQueries({
                queryKey: ['categories'], // Match the query key used in useQuery
            });
        } catch (error) {
            toast({
                title: 'Failed to delete Category',
                description: 'An error occurred while deleting the Category.',
            });
        }
    };


    return (
        <div>
            <AddCategory />

            <div className="mx-auto w-full max-w-6xl mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Loading...</p>
                ) : isError ? (
                    <p className="text-red-600">Failed to load categories</p>
                ) : categories?.length ? (
                    categories.map((category) => (
                        <div key={category.id} className="flex flex-col">
                            <SingleCategory
                                category={category}
                                DeleteCategory={handleDeleteCategory}
                            />
                        </div>
                    ))
                ) : (
                    <p>No categories found.</p>
                )}
            </div>
        </div>
    );
};

export default TourCategory;
