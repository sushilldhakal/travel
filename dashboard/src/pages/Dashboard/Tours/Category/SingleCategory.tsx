import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { getSingleCategory, updateCategory } from "@/http";
import { toast } from "@/components/ui/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryData } from "@/Provider/types";
import {
    Check,
    Edit,
    FileText,
    FolderClosed,
    Image as ImageIcon,
    Save,
    Trash2,
    X
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import GalleryPage from "@/pages/Dashboard/Gallery/GalleryPage";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
                description: 'Your changes have been saved.',
                variant: 'default',
            });
            setIsEditMode(false);
            setUploadSubmit(!uploadSubmit);
            queryClient.invalidateQueries({
                queryKey: ['categories'], // Match the query key used in useQuery
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to update category',
                description: 'An error occurred while saving changes.',
                variant: 'destructive',
            });
            console.error('Error updating category:', error);
        },
    });

    const handleUpdateCategory = async () => {
        if (form.formState.isValid) {
            const formData = new FormData();
            formData.append('name', form.getValues('name') || '');
            formData.append('description', form.getValues('description') || '');
            formData.append('imageUrl', form.getValues('imageUrl') || '');

            // Convert boolean to string for FormData
            formData.append('isActive', form.getValues('isActive') ? 'true' : 'false');

            try {
                setUploadSubmit(true);
                await updateCategoryMutation.mutateAsync(formData);
            } catch (error) {
                toast({
                    title: 'Failed to update category',
                    description: 'Please try again later.',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleDeleteCategory = () => {
        // Open the confirmation dialog instead of deleting immediately
        setDeleteDialogOpen(true);
    };

    // This function is called when the user confirms deletion in the dialog
    const confirmDeleteCategory = () => {
        if (DeleteCategory && category?.id) {
            DeleteCategory(category.id);
            setDeleteDialogOpen(false);
            toast({
                title: "Category deleted",
                description: "The category has been deleted successfully."
            });
        } else {
            toast({
                title: "Error",
                description: "Could not delete the category. Please try again.",
                variant: "destructive"
            });
            setDeleteDialogOpen(false);
        }
    };

    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        onChange(imageUrl);
        setDialogOpen(false);
    };

    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (category) {
            // Initialize form with category data
            form.setValue('name', category.name);
            form.setValue('description', category.description);
            form.setValue('imageUrl', category.imageUrl);
            form.setValue('isActive', category.isActive);
            setIsEditMode(true);
        }
    };

    const handleCancelClick = () => {
        setIsEditMode(false);
        form.reset();
    };

    if (isLoading) return (
        <Card className="shadow-xs animate-pulse">
            <div className="w-full h-[200px] bg-muted rounded-t-md"></div>
            <CardContent className="p-6 space-y-4">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-16 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardContent>
        </Card>
    );

    if (isError) return (
        <Card className="shadow-xs border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
                <p className="text-destructive">Failed to load category data</p>
            </CardContent>
        </Card>
    );

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCategory();
            }}>
                <Card className={cn(
                    "shadow-xs overflow-hidden transition-all",
                    isEditMode ? "border-primary/30 bg-primary/5" : "hover:border-border/80"
                )}>
                    {isEditMode ? (
                        <>
                            <div className="relative">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            {field.value ? (
                                                <div className="relative">
                                                    <img
                                                        src={field.value}
                                                        alt="Category cover"
                                                        className="w-full h-[200px] object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8 bg-background/80 backdrop-blur-xs"
                                                            onClick={() => window.open(field.value as string, '_blank')}
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                            <span className="sr-only">View image</span>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            className="h-8 w-8 bg-background/80 backdrop-blur-xs"
                                                            onClick={() => handleRemoveImage(field.onChange)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Remove image</span>
                                                        </Button>
                                                    </div>
                                                    <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-xs">
                                                        Cover Image
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full h-[200px] flex flex-col items-center justify-center gap-2 border-dashed"
                                                        >
                                                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                                            <span className="text-muted-foreground">
                                                                Select a cover image
                                                            </span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent
                                                        className="max-w-[90%] max-h-[90%] overflow-auto"
                                                        onInteractOutside={(e) => {
                                                            e.preventDefault();
                                                        }}
                                                    >
                                                        <DialogHeader>
                                                            <DialogTitle className="mb-3 text-left">
                                                                Select Cover Image
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Choose an image from your gallery to use as the category cover.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="upload dialog">
                                                            <GalleryPage
                                                                isGalleryPage={false}
                                                                onImageSelect={(imageUrl) =>
                                                                    handleImageSelect(imageUrl, field.onChange)
                                                                }
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <CardContent className="p-5 mt-2 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="bg-primary/10 text-primary">Editing</Badge>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <FolderClosed className="h-3.5 w-3.5 text-primary" />
                                                Category Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter category name"
                                                    className="focus-visible:ring-primary"
                                                />
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
                                            <FormLabel className="flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-primary" />
                                                Description
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    rows={4}
                                                    placeholder="Enter category description"
                                                    className="focus-visible:ring-primary resize-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Provide a brief description of this category
                                            </p>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active Status</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable this category to make it visible to users
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                {category?.imageUrl ? (
                                    <img
                                        src={category.imageUrl as string}
                                        alt={category.name || 'Category'}
                                        className="w-full h-[200px] object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-[200px] bg-muted flex items-center justify-center">
                                        <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
                                    </div>
                                )}
                                {category?.isActive ? (
                                    <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-700 border-green-500/30">
                                        <Check className="mr-1 h-3 w-3" /> Active
                                    </Badge>
                                ) : (
                                    <Badge className="absolute top-2 right-2 bg-muted/20 text-muted-foreground border-muted/30">
                                        <X className="mr-1 h-3 w-3" /> Inactive
                                    </Badge>
                                )}
                            </div>

                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <FolderClosed className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">
                                        {category?.name}
                                    </h3>
                                </div>

                                <Separator className="my-3" />

                                <div className="text-sm text-muted-foreground">
                                    {category?.description
                                        ? category.description.length > 150
                                            ? `${category.description.slice(0, 150)}...`
                                            : category.description
                                        : <span className="italic text-muted-foreground/70">No description available</span>}
                                </div>
                            </CardContent>
                        </>
                    )}

                    <CardFooter className={cn(
                        "flex justify-end gap-2 px-5 py-3 bg-secondary/50 border-t",
                        isEditMode && "bg-primary/5 border-primary/20"
                    )}>
                        {isEditMode ? (
                            <>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updateCategoryMutation.isPending}
                                    className="gap-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    Save
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelClick}
                                    className="gap-1.5"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleEditClick}
                                    className="text-muted-foreground hover:text-primary gap-1.5"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCategory()}
                                    className="text-muted-foreground hover:text-destructive gap-1.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </>
                        )}


                    </CardFooter>
                </Card>
            </form>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteCategory}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Form>
    );
};

export default SingleCategory;
