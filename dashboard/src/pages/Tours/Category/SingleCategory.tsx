import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { getSingleCategory, updateCategory } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CategoryData } from "@/Provider/types";
import { Link } from "react-router-dom";
import { Paperclip, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import GalleryPage from "@/pages/Gallery/GalleryPage";

interface SingleCategoryProps {
    category?: CategoryData;
    DeleteCategory?: (id: string) => void;
}

const SingleCategory = ({
    category,
    DeleteCategory,
}: SingleCategoryProps) => {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [uploadSubmit, setUploadSubmit] = useState(false);

    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            imageUrl: '',
            isActive: true,
        },
    });

    // Fetch single category data if categoryId is provided
    const { data: categorySingle, isLoading, isError } = useQuery<CategoryData>({
        queryKey: ['singleCategory', category?.id],
        queryFn: () => category?.id ? getSingleCategory(category?.id) : Promise.reject('No category ID provided'),
        enabled: isEditMode && !!category?.id,
    });

    useEffect(() => {
        if (categorySingle && isEditMode) {
            form.setValue('name', categorySingle.name);
            form.setValue('description', categorySingle.description);
            form.setValue('imageUrl', categorySingle.imageUrl);
            form.setValue('isActive', categorySingle.isActive);
        }
    }, [categorySingle, isEditMode, form]);


    const updateCategoryMutation = useMutation({
        mutationFn: (categoryData: FormData) => updateCategory(categoryData, category?.id || ''),

        onSuccess: () => {
            toast({
                title: 'Category updated successfully',
                description: 'Category has been updated successfully.',
            });
            if (setEditingCategoryId) setEditingCategoryId(null);
            setIsEditMode(false);
            setUploadSubmit(!uploadSubmit);
            queryClient.invalidateQueries({
                queryKey: ['categories'], // Match the query key used in useQuery
            })
        },
        onError: () => {
            toast({
                title: 'Failed to update Category',
                description: 'An error occurred while updating the Category.',
            });
        },
    });

    const handleUpdateCategory = async () => {
        if (uploadSubmit) {
            const formData = new FormData();
            formData.append('name', form.getValues('name') || '');
            formData.append('description', form.getValues('description') || '');
            formData.append('imageUrl', form.getValues('imageUrl') || '');

            // Convert boolean to string for FormData
            formData.append('isActive', form.getValues('isActive') ? 'true' : 'false');

            try {

                await updateCategoryMutation.mutateAsync(formData);
            } catch (error) {
                toast({
                    title: 'Failed to update Category',
                    description: 'Please try again later.',
                });
            }
        }

    };

    const handleDeleteCategory = (categoryId: string) => {
        if (DeleteCategory && categoryId) {
            DeleteCategory(categoryId);
        }
    };

    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        onChange(imageUrl);
        setDialogOpen(false);
    };

    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };
    const handleEditClick = () => {
        if (category) {
            setEditingCategoryId(category.id || '');
            setIsEditMode(true);
        }
    }

    const handleCancelClick = () => {
        if (setEditingCategoryId) setEditingCategoryId(null);
        setIsEditMode(false);
    }

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p className="text-red-600">Failed to load category</p>;

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateCategory();
                }}
            >
                <Card>
                    {editingCategoryId === category?.id ? (
                        <>
                            <CardHeader className="px-0 pt-0 pb-3">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem >
                                            {field.value ? (
                                                <div className="relative ">
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
                                                    <DialogTrigger className="p-5 w-full">
                                                        <div className="border border-dashed border-gray-300 p-4 rounded-md">
                                                            <div
                                                                className={cn(
                                                                    buttonVariants({
                                                                        size: "icon",
                                                                    }) + "w-full",
                                                                    "size-8 "

                                                                )}
                                                            >
                                                                <Paperclip className="size-4" />
                                                                <span className="sr-only">Select your files</span>
                                                            </div>
                                                            <span className="pl-2">Choose Image</span>
                                                        </div>

                                                    </DialogTrigger>
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
                            </CardHeader>
                            <CardContent>

                                <div className="grid grid-cols-5 gap-4">
                                    <div className="col-span-5 grid gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Category Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} rows={6} placeholder="Category Description" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                                    <FormLabel>Active</FormLabel>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                            </CardContent>
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <div>
                                <img
                                    src={category?.imageUrl || ''}
                                    alt={category?.name || 'Category Image'}
                                    className="w-full h-[200px] object-cover mb-3"
                                />

                            </div>
                            <div className="px-6 pt-2 pb-6">
                                <div className="mb-2">
                                    <span className="font-semibold"> {category?.name}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold">{category?.description ? category.description.length > 50
                                        ? `${category.description.slice(0, 150)} ......`
                                        : category.description
                                        : 'No description available'}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className={`font-semibold ${category?.isActive ? "text-green-500" : "text-red-500"}`}
                                    >
                                        Active:
                                    </span>{" "}
                                    {category?.isActive ? "Yes" : "No"}
                                </div>
                            </div>

                        </div>
                    )}
                    <CardFooter className="border-t px-6 py-4">
                        {editingCategoryId === category?.id ? (
                            <>
                                <Button type="submit" onClick={(e) => {
                                    handleUpdateCategory
                                    setUploadSubmit(!uploadSubmit);
                                }}>Save</Button>
                                <Button
                                    variant="outline"
                                    type="button" // Ensure this does not submit the form
                                    className="ml-2"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    type="button" // Ensure this does not submit the form
                                    onClick={handleEditClick}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button" // Ensure this does not submit the form
                                    className="ml-2"
                                    onClick={() => category?.id && handleDeleteCategory(category?.id)}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default SingleCategory;
