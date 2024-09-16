import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Paperclip, Trash2 } from "lucide-react";
import GalleryPage from "../../Gallery/GalleryPage";
import { addCategory } from "@/http/api";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getUserId } from "@/util/AuthLayout";


interface CategoryFormData {
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    userId: string | null;
}


const AddCategory = ({ onCategoryAdded }: { onCategoryAdded: () => void }) => {
    const userId = getUserId();
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            imageUrl: '',
            isActive: true,
            userId: userId,
        },
    });

    const categoryMutation = useMutation({
        mutationFn: (data: FormData) => addCategory(data),
        onSuccess: () => {
            toast({
                title: 'Category added successfully',
                description: 'Category has been added successfully.',
            });
            onCategoryAdded();
            form.reset();

        },
        onError: () => {
            toast({
                title: 'Failed to create Category',
                description: 'An error occurred while creating the Category.',
            });
        },
    });

    const handleCreateCategory = async (values: CategoryFormData) => {
        event?.preventDefault();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('imageUrl', values.imageUrl);
        formData.append('isActive', values.isActive ? 'true' : 'false');

        try {
            await categoryMutation.mutate(formData);
        } catch (error) {
            toast({
                title: 'Failed to create Category',
                description: 'Please try again later.',
            });
        }
    };

    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        onChange(imageUrl);
        setDialogOpen(false);
    };

    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleCreateCategory)();
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Category</CardTitle>
                        <CardDescription>Add a new category to your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
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
                            <div className="col-span-3 grid gap-4">
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
                                                <Textarea {...field} placeholder="Category Description" />
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
                    <CardFooter>
                        <Button type="submit">Create Category</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default AddCategory;
