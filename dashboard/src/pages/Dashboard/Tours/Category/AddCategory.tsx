import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, FolderPlus, Image as ImageIcon, Save, Trash2, X } from "lucide-react";
import { addCategory } from "@/http";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { getUserId } from "@/util/AuthLayout";
import GalleryPage from "../../Gallery/GalleryPage";
import { Badge } from "@/components/ui/badge";
import Editor from "@/userDefinedComponents/editor/advanced-editor";
import { JSONContent } from "novel";

interface CategoryFormData {
    name: string;
    imageUrl: string;
    isActive: boolean;
    description: string;
}

const AddCategory = ({ onCategoryAdded }: { onCategoryAdded: () => void }) => {
    const userId = getUserId();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [descriptionContent, setDescriptionContent] = useState<JSONContent>({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
    });
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
                description: 'Your category has been created.',
                variant: 'default',
            });
            onCategoryAdded();
            form.reset();
        },
        onError: (error) => {
            toast({
                title: 'Failed to create category',
                description: 'An error occurred while creating the category.',
                variant: 'destructive',
            });
            console.error('Error creating category:', error);
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
                title: 'Failed to create category',
                description: 'Please try again later.',
                variant: 'destructive',
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
                <Card className="shadow-sm border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                                New Category
                            </Badge>
                        </div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Create Category
                        </CardTitle>
                        <CardDescription>
                            Add a new category to organize your tours
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="relative">
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                            Cover Image
                                        </FormLabel>
                                        <div className="relative mt-1">
                                            <div className="flex items-center space-x-2 p-4 border border-dashed rounded-md bg-muted/50">
                                                {field.value ? (
                                                    <>

                                                        <div className="relative mt-1 rounded-md overflow-hidden">
                                                            <img
                                                                src={field.value as string}
                                                                alt="Category cover"
                                                                className="w-full h-[200px] object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 flex gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                                                                    onClick={() => window.open(field.value as string, '_blank')}
                                                                >
                                                                    <ImageIcon className="h-4 w-4" />
                                                                    <span className="sr-only">View image</span>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                                                                    onClick={() => handleRemoveImage(field.onChange)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Remove image</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full h-[100px] flex flex-col items-center justify-center gap-2 border-dashed mt-1"
                                                            >
                                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
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
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <FolderPlus className="h-3.5 w-3.5 text-primary" />
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
                                    <FormLabel className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <div className="border rounded-md">
                                            <Editor
                                                initialValue={descriptionContent}
                                                onContentChange={(content) => {
                                                    setDescriptionContent(content);
                                                    // Extract text content for form submission
                                                    let textContent = "";
                                                    if (content.content) {
                                                        content.content.forEach(node => {
                                                            if (node.type === 'paragraph' && node.content) {
                                                                node.content.forEach(textNode => {
                                                                    if (textNode.type === 'text') {
                                                                        textContent += textNode.text + " ";
                                                                    }
                                                                });
                                                                textContent += "\n";
                                                            }
                                                        });
                                                    }
                                                    field.onChange(textContent.trim());
                                                }}
                                            />
                                        </div>
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

                    <CardFooter className="flex justify-between border-t px-6 py-4 bg-secondary/50">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                form.reset();
                                onCategoryAdded(); // This will hide the form
                            }}
                            className="gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={categoryMutation.isPending}
                            className="gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Create Category
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default AddCategory;
