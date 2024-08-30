import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GalleryPage from "../../Gallery/GalleryPage";
import { addCategory, deleteCategory, getSingleCategories, getUserCategories, updateCategory } from "@/http/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/util/AuthLayout";
import { CategoryData } from "@/Provider/types";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Paperclip, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import SingleCategory from "./SingleCategory";

const TourCategory = () => {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const userId = getUserId();

    // Fetch all categories for the user
    const { data, isLoading, isError } = useQuery<CategoryData[], Error>({
        queryKey: ['categories', userId],
        queryFn: () => userId ? getUserCategories(userId) : Promise.reject('No user ID provided'),
        enabled: !!userId,
    });



    // Fetch single category for editing
    const { data: singleCategory, isLoading: singleCategoryLoading, isError: singleCategoryError } = useQuery<CategoryData, Error>({
        queryKey: ['singleCategory', categoryId],
        queryFn: () => categoryId ? getSingleCategories(categoryId) : Promise.reject('No category ID provided'),
        enabled: !!categoryId, // Fetch only when categoryId is set
    });

    // React-hook-form setup
    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            imageUrl: '',
            isActive: true,
            userId: userId,
        }
    });
    console.log("singleCategory", singleCategory)

    useEffect(() => {
        if (data) {
            setCategories(data);
        }
        if (singleCategory) {
            form.reset({
                name: singleCategory?.name,
                description: singleCategory.description,
                imageUrl: singleCategory.imageUrl,
                isActive: singleCategory.isActive,
            });
        }
    }, [data, singleCategory, form]);
    console.log("editingCategory", editingCategory)



    // Mutations for add, update, and delete categories
    const categoryMutation = useMutation({
        mutationFn: (data: FormData) => addCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories', userId]);
            toast({
                title: 'Category added successfully',
                description: 'Category has been added successfully.',
            });
            form.reset();
        },
        onError: () => {
            toast({
                title: 'Failed to create Category',
                description: 'An error occurred while creating the Category.',
            });
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ categoryId, categoryData }: { categoryId: string, categoryData: FormData }) => updateCategory(categoryData, categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories', userId]);
            toast({
                title: 'Category updated successfully',
                description: 'Category has been updated successfully.',
            });
            setEditingCategory(null);
        },
        onError: () => {
            toast({
                title: 'Failed to update Category',
                description: 'An error occurred while updating the Category.',
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories', userId]);
            toast({
                title: 'Category deleted successfully',
                description: 'The category has been deleted.',
            });
        },
        onError: () => {
            toast({
                title: 'Failed to delete Category',
                description: 'An error occurred while deleting the Category.',
            });
        }
    });

    // Handle create new category
    const handleCreateCategory = async (values: CategoryData) => {
        event?.preventDefault();
        const formdata = new FormData();
        formdata.append('name', values.name);
        formdata.append('description', values.description);
        formdata.append('imageUrl', values.imageUrl);
        formdata.append('isActive', values.isActive ? 'true' : 'false');

        try {
            await categoryMutation.mutate(formdata);
        } catch (error) {
            toast({
                title: 'Failed to create Category',
                description: 'Please try again later.',
            });
        }
    };

    // Handle edit click
    const handleEditCategory = (category: CategoryData) => {
        setCategoryId(category.id); // Triggers query to fetch single category
        setEditingCategory(category);
    };

    // Handle update category
    const handleUpdateCategory = async () => {
        if (editingCategory) {
            const formdata = new FormData();
            formdata.append('name', editingCategory.name);
            formdata.append('description', editingCategory.description);
            formdata.append('imageUrl', editingCategory.imageUrl || '');
            formdata.append('isActive', editingCategory.isActive ? 'true' : 'false');

            try {
                await updateCategoryMutation.mutateAsync({ categoryId: editingCategory.id, categoryData: formdata });
            } catch (error) {
                toast({
                    title: 'Failed to update Category',
                    description: 'Please try again later.',
                });
            }
        }
    };

    // Handle delete category
    const handleDeleteCategory = (id: string) => {
        deleteMutation.mutate(id);
        setCategories(categories.filter((c) => c.id !== id));
    };

    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        if (imageUrl) {
            onChange(imageUrl); // Update the form field with the selected image URL
            setDialogOpen(false); // Close the dialog
        }
    };

    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange(''); // Clear the form field
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading categories</div>;

    return (
        <div>
            <div className="grid mx-auto w-full max-w-6xl gap-6">
                {/* Create Category Form */}
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit(onSubmit)();
                    }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Category</CardTitle>
                                <CardDescription>Add a new category to your store.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Grid with two columns */}
                                <div className="grid grid-cols-5 gap-4">
                                    {/* Left Column: Image */}
                                    <div className="col-span-2 p-4 border border-dashed border-gray-300 p-4 rounded-md">
                                        <FormField
                                            control={form.control}
                                            name="imageUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category Image <br /></FormLabel>
                                                    {field.value ? (
                                                        <div className="mt-2 relative ">
                                                            <Link to={field.value} target="_blank" rel="noopener noreferrer">
                                                                <img
                                                                    src={field.value}
                                                                    alt="Selected Category Image"
                                                                    className="rounded-md w-full "

                                                                />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(field.onChange)}
                                                                className="absolute top-1 right-1 mt-2 text-red-600 hover:underline"
                                                            >
                                                                <Trash2 />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                            <DialogTrigger >
                                                                <div
                                                                    className={cn(
                                                                        buttonVariants({
                                                                            size: "icon",
                                                                        }),
                                                                        "size-8 "

                                                                    )}
                                                                >
                                                                    <Paperclip className="size-4" />
                                                                    <span className="sr-only">Select your files</span>
                                                                </div>
                                                                <span className="pl-2">Choose Image</span></DialogTrigger>
                                                            <DialogContent
                                                                className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                                onInteractOutside={(e) => {
                                                                    e.preventDefault();
                                                                }}
                                                            >
                                                                <DialogHeader>
                                                                    <DialogTitle className="mb-3 text-left">Choose Image From Gallery</DialogTitle>
                                                                    <div className="upload dialog">
                                                                        <GalleryPage
                                                                            isGalleryPage={false}
                                                                            onImageSelect={(imageUrl) =>
                                                                                handleImageSelect(imageUrl, field.onChange)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </DialogHeader>
                                                                <DialogDescription>
                                                                    Select a Image.
                                                                </DialogDescription>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </FormItem>
                                            )}
                                        />

                                    </div>

                                    {/* Right Column: Title and Description */}
                                    <div className="col-span-3 grid gap-4">
                                        <div className="grid gap-2">

                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                className="w-full"
                                                                {...field}
                                                                placeholder='Category Name'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-2">

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea className="min-h-32" {...field}
                                                                placeholder="Category Description" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-2">

                                            <FormField
                                                control={form.control}
                                                name="isActive"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                        <FormLabel>Active</FormLabel>
                                                        <FormControl>
                                                            <div className="flex items-center space-x-2">
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button onClick={handleCreateCategory}>Create Category</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
            {/* Mapped Categories */}
            <div className="mx-auto w-full max-w-6xl mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                        <Card key={category.id} className="mb-4">
                            <CardHeader>
                                <CardTitle>{category.name}
                                </CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {editingCategory?.id === category.id ? (
                                    <Form {...form}>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                form.handleSubmit(handleUpdateCategory)();
                                            }}
                                        >
                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <div className="mt-2 relative ">
                                                        <Link to={category.imageUrl} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={category.imageUrl}
                                                                alt={category.imageUrl}
                                                                className="rounded-md w-full "

                                                            />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(category.onChange)}
                                                            className="absolute top-1 right-1 mt-2 text-red-600 hover:underline"
                                                        >
                                                            <Trash2 />
                                                        </button>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="imageUrl"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel><span className="w-full relative block">Category Image</span></FormLabel>
                                                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                                    <DialogTrigger>
                                                                        <div
                                                                            className={cn(buttonVariants({ size: "icon" }), "size-8")}
                                                                        >
                                                                            <Paperclip className="size-4" />
                                                                            <span className="sr-only">Select your files</span>

                                                                        </div>
                                                                        <span className="pl-2">Change Image</span>
                                                                        <img src={category.imageUrl} alt={category.name} className="w-full h-[200px] object-cover mb-3" />

                                                                    </DialogTrigger>
                                                                    <DialogContent
                                                                        className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                                        onInteractOutside={(e) => e.preventDefault()}
                                                                    >
                                                                        <DialogHeader>
                                                                            <DialogTitle className="mb-3 text-left">
                                                                                Choose Image From Gallery
                                                                            </DialogTitle>
                                                                            <div className="upload dialog">
                                                                                <GalleryPage
                                                                                    isGalleryPage={false}
                                                                                    onImageSelect={(imageUrl) =>
                                                                                        handleImageSelect(imageUrl, field.onChange)
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </DialogHeader>
                                                                        <DialogDescription>Select an Image.</DialogDescription>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Category Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Category Name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="description"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Description</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="Description" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="isActive"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                                <FormLabel>Active</FormLabel>
                                                                <FormControl>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="grid gap-2">
                                        <div>
                                            <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                className="w-full h-[200px] object-cover mb-3"
                                            />
                                            <span className="font-semibold">Name:</span> {category.name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Description:</span> {category.description}
                                        </div>
                                        <div>
                                            <span
                                                className={`font-semibold ${category.isActive ? "text-green-500" : "text-red-500"
                                                    }`}
                                            >
                                                Active:
                                            </span>{" "}
                                            {category.isActive ? "Yes" : "No"}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                {editingCategory?.id === category.id ? (
                                    <>
                                        <Button onClick={handleUpdateCategory}>Save</Button>
                                        <Button
                                            variant="outline"
                                            className="ml-2"
                                            onClick={() => setEditingCategory(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => handleEditCategory(category)}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="ml-2"
                                            onClick={() => handleDeleteCategory(category.id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <p>No categories available.</p>
                )}
            </div>

        </div>
    );
};
export default TourCategory;
