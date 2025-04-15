import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Edit, FileText, MapPin, Image as ImageIcon, Save, Trash2, X } from "lucide-react";
import { getDestination, updateDestination, deleteDestination } from "@/http";
import { getUserId } from "@/util/AuthLayout";
import GalleryPage from "../../Gallery/GalleryPage";
import Editor from "@/userDefinedComponents/editor/advanced-editor";
import { JSONContent } from "novel";

interface SingleDestinationProps {
    destinationId: string;
    onUpdate: () => void;
}

const SingleDestination = ({ destinationId, onUpdate }: SingleDestinationProps) => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    const [isEditMode, setIsEditMode] = useState(false);
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
            isActive: true
        }
    });

    // Fetch destination data
    const { data: destination, isLoading, isError } = useQuery({
        queryKey: ['destination', destinationId],
        queryFn: () => getDestination(destinationId),
        enabled: !!destinationId,
    });

    // Update destination mutation
    const updateMutation = useMutation({
        mutationFn: (data: FormData) => updateDestination(destinationId, data),
        onSuccess: () => {
            toast({
                title: "Destination updated",
                description: "The destination has been updated successfully.",
            });
            setIsEditMode(false);
            onUpdate();
        },
        onError: (error) => {
            toast({
                title: "Failed to update",
                description: "There was an error updating the destination.",
                variant: "destructive",
            });
            console.error(error);
        }
    });

    // Delete destination mutation
    const deleteMutation = useMutation({
        mutationFn: () => deleteDestination(destinationId),
        onSuccess: () => {
            toast({
                title: "Destination deleted",
                description: "The destination has been deleted successfully.",
            });
            onUpdate();
        },
        onError: (error) => {
            toast({
                title: "Failed to delete",
                description: "There was an error deleting the destination.",
                variant: "destructive",
            });
            console.error(error);
        }
    });

    // Initialize form with destination data
    useEffect(() => {
        if (destination) {
            form.reset({
                name: destination.name,
                description: destination.description || '',
                imageUrl: destination.imageUrl || '',
                isActive: destination.isActive
            });

            // Initialize rich text editor content if description exists
            if (destination.description) {
                try {
                    // Try to parse if it's JSON content
                    setDescriptionContent({
                        type: "doc",
                        content: [{
                            type: "paragraph",
                            content: [{ type: "text", text: destination.description }]
                        }]
                    });
                } catch (e) {
                    // If it's not JSON, create a simple text content
                    setDescriptionContent({
                        type: "doc",
                        content: [{
                            type: "paragraph",
                            content: [{ type: "text", text: destination.description }]
                        }]
                    });
                }
            }
        }
    }, [destination, form]);

    // Handle form submission for updating destination
    const handleUpdateDestination = (values: {
        name: string;
        description: string;
        imageUrl: string;
        isActive: boolean;
    }) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('imageUrl', values.imageUrl);
        formData.append('isActive', values.isActive.toString());
        if (userId) formData.append('userId', userId);

        updateMutation.mutate(formData);
    };

    // Handle image selection from gallery
    const handleImageSelect = (imageUrl: string, onChange: (value: string) => void) => {
        onChange(imageUrl);
        setDialogOpen(false);
    };

    // Handle removing the image
    const handleRemoveImage = (onChange: (value: string) => void) => {
        onChange('');
    };

    // Handle edit button click
    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (destination) {
            // Initialize form with destination data
            form.setValue('name', destination.name);
            form.setValue('description', destination.description || '');
            form.setValue('imageUrl', destination.imageUrl || '');
            form.setValue('isActive', destination.isActive);
            setIsEditMode(true);
        }
    };

    // Loading state
    if (isLoading) return (
        <Card className="shadow-sm">
            <CardContent className="p-0 flex flex-col">
                <div className="h-[200px] bg-muted/40 animate-pulse" />
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-muted rounded-full animate-pulse" />
                        <div className="h-6 w-[70%] bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-[80%] bg-muted animate-pulse rounded-md" />
                </div>
            </CardContent>
        </Card>
    );

    if (isError) return (
        <Card className="shadow-sm border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <X className="h-8 w-8 text-destructive" />
                    <div className="space-y-1">
                        <p className="text-lg font-medium text-destructive">Failed to load destination</p>
                        <p className="text-sm text-muted-foreground">There was an error loading this destination.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            queryClient.invalidateQueries({
                                queryKey: ['destination', destinationId]
                            });
                        }}
                        className="mt-2"
                    >
                        Try Again
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <Card className={cn(
            "shadow-sm overflow-hidden",
            isEditMode ? "border-primary/30 bg-primary/5" : ""
        )}>
            <CardContent className="p-0">
                {isEditMode ? (
                    // Edit Mode
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdateDestination)} className="space-y-4 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary">Editing</Badge>
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            Destination Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter destination name"
                                                className="focus-visible:ring-primary"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            Cover Image
                                        </FormLabel>
                                        {field.value ? (
                                            <div className="relative mt-1 rounded-md overflow-hidden">
                                                <img
                                                    src={field.value as string}
                                                    alt={form.getValues('name') || 'Destination cover'}
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
                                                            Choose an image from your gallery to use as the destination cover.
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
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Active Status
                                            </FormLabel>
                                            <FormDescription className="text-sm text-muted-foreground">
                                                {field.value
                                                    ? "This destination is currently active and visible."
                                                    : "This destination is currently inactive and hidden."}
                                            </FormDescription>
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
                        </form>
                    </Form>
                ) : (
                    // View Mode
                    <>
                        <div className="relative">
                            {destination?.imageUrl ? (
                                <img
                                    src={destination.imageUrl as string}
                                    alt={destination.name || 'Destination'}
                                    className="w-full h-[200px] object-cover"
                                />
                            ) : (
                                <div className="w-full h-[200px] bg-muted flex items-center justify-center">
                                    <MapPin className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                            {destination?.isActive !== undefined && (
                                <Badge
                                    className={cn(
                                        "absolute top-2 right-2",
                                        destination.isActive
                                            ? "bg-primary/90 hover:bg-primary/80"
                                            : "bg-muted hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    {destination.isActive ? "Active" : "Inactive"}
                                </Badge>
                            )}
                        </div>

                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    {destination?.name}
                                </h3>
                            </div>

                            <Separator className="my-3" />

                            <div className="text-sm text-muted-foreground">
                                {destination?.description
                                    ? destination.description.length > 150
                                        ? `${destination.description.slice(0, 150)}...`
                                        : destination.description
                                    : "No description provided"}
                            </div>
                        </CardContent>
                    </>
                )}
            </CardContent>

            <CardFooter className={cn(
                "flex justify-end gap-2 px-5 py-3 bg-secondary/50 border-t",
                isEditMode && "bg-primary/5 border-primary/20"
            )}>
                {isEditMode ? (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditMode(false)}
                            className="gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={form.handleSubmit(handleUpdateDestination)}
                            disabled={updateMutation.isPending}
                            className="gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditClick}
                            className="gap-1.5"
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this destination?')) {
                                    deleteMutation.mutate();
                                }
                            }}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default SingleDestination;
