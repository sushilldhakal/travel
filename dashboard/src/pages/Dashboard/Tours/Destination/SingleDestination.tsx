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
import { getDestination, updateDestination, deleteDestination, getUserToursTitle } from "@/http";
import { getUserId } from "@/util/authUtils";
import GalleryPage from "../../Gallery/GalleryPage";
import Editor from "@/userDefinedComponents/editor/advanced-editor";
import { MultiSelect, SelectValue } from "@/components/ui/MultiSelect";

interface SingleDestinationProps {
    destinationId: string;
    onUpdate: () => void;
    onDelete?: () => void;  // Add this line
}

interface TourTitle {
    _id: string;
    title: string;
}

interface TourObject {
    _id?: string;
    id?: string;
    title?: string;
}

interface DescriptionContent {
    type?: string;
    content?: Array<{
        type?: string;
        content?: Array<{
            type?: string;
            text?: string;
        }>;
    }>;
}

const SingleDestination = ({ destinationId, onUpdate, onDelete }: SingleDestinationProps) => {
    const userId = getUserId();
    const queryClient = useQueryClient();
    const [isEditMode, setIsEditMode] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
    const [descriptionContent, setDescriptionContent] = useState<DescriptionContent | string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            coverImage: '',
            isActive: true,
            country: '',
            region: '',
            city: '',
            featuredTours: []
        }
    });

    // Fetch destination data
    // In SingleDestination.tsx
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['destination', destinationId],
        queryFn: () => getDestination(destinationId),
        enabled: !!destinationId,
    });

    const destination = response; // Access the data property from the response


    // Fetch tour titles
    const { data: tourTitles } = useQuery({
        queryKey: ['tourTitles', userId],
        queryFn: () => getUserToursTitle(userId!),
        enabled: !!userId,
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
            // Invalidate and refetch the destination data to show the updated featured tours
            queryClient.invalidateQueries({
                queryKey: ['destination', destinationId]
            });
            // Also invalidate the tour titles to ensure we have the latest data
            if (userId) {
                queryClient.invalidateQueries({
                    queryKey: ['tourTitles', userId]
                });
            }
            onUpdate();
        },
        onError: (error) => {
            toast({
                title: "Failed to update",
                description: `There was an error updating the destination: ${error.message}`,
                variant: "destructive",
            });
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
            setDeleteDialogOpen(false);
            onUpdate();
            if (onDelete) onDelete();
        },
        onError: (error) => {
            toast({
                title: "Failed to delete",
                description: `There was an error deleting the destination: ${error.message}`,
                variant: "destructive",
            });
        }
    });

    // Initialize form with destination data
    useEffect(() => {
        if (destination) {
            form.reset({
                name: destination.name,
                description: destination.description || '',
                coverImage: destination.coverImage || '',
                isActive: destination.isActive,
                country: destination.country || '',
                region: destination.region || '',
                city: destination.city || '',
                featuredTours: destination.featuredTours || []
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
        coverImage: string;
        isActive: boolean;
        country: string;
        region: string;
        city: string;
        featuredTours: string[];
    }) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', JSON.stringify(descriptionContent));
        formData.append('coverImage', values.coverImage);
        formData.append('isActive', values.isActive.toString());
        formData.append('country', values.country);
        formData.append('region', values.region);
        formData.append('city', values.city);
        // Compare featuredTours only if changed
        const originalTours = Array.isArray(destination.featuredTours)
            ? destination.featuredTours.map((tour: string) => typeof tour === 'string' ? tour : tour)
            : [];
        const updatedTours = values.featuredTours || [];

        const originalTourIds = originalTours.map((tour: string) => tour); // Get only the ids
        const updatedTourIds = updatedTours.map((tour: string) => tour); // Get only the ids

        // Check if arrays of tour ids are different
        const areToursDifferent = originalTourIds.length !== updatedTourIds.length ||
            !originalTourIds.every((tourId: string) => updatedTourIds.includes(tourId));

        if (areToursDifferent) {
            updatedTourIds.forEach((tourId: string) => {
                formData.append('featuredTours[]', tourId); // Append only the ids
            });
        }
        if (userId) formData.append('userId', userId);
        updateMutation.mutate(formData);
    };

    // Handle image selection from gallery
    const handleImageSelect = (coverImage: string, onChange: (value: string) => void) => {
        onChange(coverImage);
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
            form.setValue('coverImage', destination.coverImage || '');
            form.setValue('isActive', destination.isActive);
            form.setValue('country', destination.country || '');
            form.setValue('region', destination.region || '');
            form.setValue('city', destination.city || '');
            form.setValue('featuredTours', destination.featuredTours || []);
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

                            <div className="col-span-2 grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Destination Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Kathmandu" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Nepal" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Region</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Bagmati" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Kathmandu" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="featuredTours"
                                        render={({ field }) => {
                                            // Extract current field value and handle nested arrays
                                            let fieldValue: string[] = [];
                                            if (Array.isArray(field.value)) {
                                                if (Array.isArray(field.value[0])) {
                                                    // It's a nested array, extract the inner array
                                                    fieldValue = field.value[0];
                                                } else {
                                                    // It's a flat array
                                                    fieldValue = field.value;
                                                }
                                                // If fieldValue contains objects instead of strings, extract the IDs
                                                if (fieldValue.length > 0 && fieldValue[0] && typeof fieldValue[0] === 'object') {
                                                    fieldValue = (fieldValue as unknown as TourObject[]).map((item) => item._id || item.id || '');
                                                }
                                            }

                                            // Format current values to match MultiSelect expected format
                                            const currentValues: SelectValue[] = Array.isArray(fieldValue) ?
                                                fieldValue.map(val => {
                                                    // Handle different possible formats
                                                    if (typeof val === 'string') {
                                                        return { value: val, label: val } as SelectValue;
                                                    } else if (val && typeof val === 'object' && 'value' in val) {
                                                        return val as SelectValue;
                                                    }
                                                    return { value: '', label: '' } as SelectValue; // Return empty object instead of null
                                                }).filter(val => {
                                                    const typedVal = val as { value: string; label: string };
                                                    return typedVal.value !== '';
                                                }) : [];

                                            return (
                                                <FormItem>
                                                    <FormLabel>Featured Tours</FormLabel>
                                                    <FormControl>
                                                        <MultiSelect
                                                            options={(tourTitles?.data?.data || []).map((item: TourTitle) => ({
                                                                value: item._id,
                                                                label: item.title,
                                                            }))}
                                                            value={currentValues}
                                                            onValueChange={(selectedValues: SelectValue[]) => {
                                                                // Ensure only the string values (IDs) are passed to RHF
                                                                const ids = selectedValues.map((val: SelectValue) =>
                                                                    typeof val === 'string' ? val : val.value
                                                                );
                                                                field.onChange(ids);
                                                            }}
                                                            placeholder="Select featured tours"
                                                            className="w-full"
                                                            maxDisplayValues={2}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="coverImage"
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
                                                            onImageSelect={(coverImage) =>
                                                                handleImageSelect(coverImage as string, field.onChange)
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
                                                    initialValue={typeof descriptionContent === 'string'
                                                        ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: descriptionContent }] }] }
                                                        : descriptionContent}
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
                            {destination?.coverImage ? (
                                <img
                                    src={destination.coverImage as string}
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
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    {destination?.name}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 mb-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Badge variant="outline" className="h-6 bg-secondary/50">Location</Badge>
                                        <div className="space-y-1.5">
                                            {destination?.country && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-medium">Country:</span>
                                                    <span className="text-sm text-muted-foreground">{destination.country}</span>
                                                </div>
                                            )}
                                            {destination?.region && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-medium">Region:</span>
                                                    <span className="text-sm text-muted-foreground">{destination.region}</span>
                                                </div>
                                            )}
                                            {destination?.city && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-medium">City:</span>
                                                    <span className="text-sm text-muted-foreground">{destination.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {destination?.featuredTours && destination.featuredTours.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <Badge variant="outline" className="w-fit h-6 bg-secondary/50">Featured Tours</Badge>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {destination.featuredTours.map((tour: string | TourObject) => {
                                                    // Handle both string IDs and full tour objects
                                                    const tourId = typeof tour === 'string' ? tour : (tour._id || tour.id || '');
                                                    const tourTitle = typeof tour === 'string'
                                                        ? (tourTitles?.data?.data?.find((t: TourTitle) => t._id === tourId)?.title || tourId)
                                                        : (tour.title || 'Unknown Tour');

                                                    return (
                                                        <Badge
                                                            key={tourId}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {tourTitle}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <h4 className="font-medium">Description</h4>
                                </div>
                                <div className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-md">
                                    {destination?.description && destination.description.length > 300 ? (
                                        <span>
                                            {destination.description.substring(0, 300)}...
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                className="text-primary px-1"
                                                onClick={() => setDescriptionDialogOpen(true)}
                                            >
                                                Read more
                                            </Button>
                                        </span>
                                    ) : (
                                        <span>
                                            {destination?.description || "No description provided"}
                                        </span>
                                    )}
                                </div>
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
                            onClick={() => setDeleteDialogOpen(true)}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </>
                )}
            </CardFooter>

            {/* Description Dialog */}
            <Dialog open={descriptionDialogOpen} onOpenChange={setDescriptionDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {destination?.name} - Full Description
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                    </DialogDescription>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <div className="text-sm space-y-4 leading-relaxed">
                            {destination?.description || "No description provided"}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this destination? This action cannot be undone.
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
                            onClick={() => deleteMutation.mutate()}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default SingleDestination;
