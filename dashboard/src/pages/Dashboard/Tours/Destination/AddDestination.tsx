import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { FileText, MapPin, Image as ImageIcon, Save, Trash2, X, FolderPlus } from "lucide-react";
import { getUserId } from "@/util/authUtils";
import { addDestination, getUserToursTitle } from "@/http";
import GalleryPage from "../../Gallery/GalleryPage";
import Editor from "@/userDefinedComponents/editor/advanced-editor";
import { JSONContent } from "novel";
import { MultiSelect, SelectValue } from "@/components/ui/MultiSelect";


interface DestinationFormData {
    name: string;
    coverImage: string;
    description: string;
    isActive: boolean;
    country: string;
    region: string;
    city: string;
    popularity: number;
    featuredTours: string[]; // Array of tour IDs
}

interface TourTitle {
    _id: string;
    title: string;
}

const AddDestination = ({ onDestinationAdded }: { onDestinationAdded: () => void }) => {
    const userId = getUserId();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [descriptionContent, setDescriptionContent] = useState<JSONContent>({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
    });

    const { data: tourTitles } = useQuery({
        queryKey: ['tourTitles', userId],
        queryFn: () => getUserToursTitle(userId!),
        enabled: !!userId,
    });


    const form = useForm<DestinationFormData>({
        defaultValues: {
            name: "",
            coverImage: "",
            description: "",
            isActive: true,
            country: "",
            region: "",
            city: "",
            popularity: 0,
            featuredTours: []
        }
    });
    // Destination mutation for creating new destinations
    const destinationMutation = useMutation({
        mutationFn: (data: FormData) => addDestination(data),
        onSuccess: () => {
            toast({
                title: "Destination added",
                description: "The destination has been added successfully.",
            });
            form.reset();
            onDestinationAdded();
        },
        onError: (error) => {
            toast({
                title: "Failed to add destination",
                description: "There was an error adding the destination.",
                variant: "destructive",
            });
            console.error(error);
        }
    });

    // Handle form submission
    const handleCreateDestination = async (values: DestinationFormData) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('coverImage', values.coverImage);
        formData.append('isActive', values.isActive.toString());
        formData.append('country', values.country);
        formData.append('region', values.region);
        formData.append('city', values.city);
        formData.append('popularity', values.popularity.toString());
        values.featuredTours.forEach((id) => formData.append('featuredTours[]', id));
        if (userId) formData.append('userId', userId);
        await destinationMutation.mutateAsync(formData);
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

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleCreateDestination)();
            }}>
                <Card className="shadow-xs border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                                New Destination
                            </Badge>
                        </div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Add New Destination
                        </CardTitle>
                        <CardDescription>
                            Add a new destination location for your tours
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-6">
                        {/* Split layout */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Left: Image selector */}
                            <div className="col-span-1">
                                <FormField
                                    control={form.control}
                                    name="coverImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-muted-foreground">Cover Image</FormLabel>
                                            {field.value ? (
                                                <div className="relative mt-2 rounded-md overflow-hidden border">
                                                    <img src={field.value} alt="Cover" className="w-full h-[300px] object-cover rounded-md" />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => window.open(field.value, '_blank')}>
                                                            <ImageIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleRemoveImage(field.onChange)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="w-full h-[300px] border-dashed flex flex-col items-center justify-center text-sm">
                                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                            <span>Select cover image</span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl h-[80vh] overflow-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Select Cover Image</DialogTitle>
                                                            <DialogDescription>Choose a photo from your gallery</DialogDescription>
                                                        </DialogHeader>
                                                        <GalleryPage
                                                            isGalleryPage={false}
                                                            onImageSelect={(url) => handleImageSelect(url, field.onChange)}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Right: Inputs */}
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
                                    {["country", "region", "city"].map((fieldName) => (
                                        <FormField
                                            key={fieldName}
                                            control={form.control}
                                            name={fieldName as "country" | "region" | "city"}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize">{fieldName}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={`Enter ${fieldName}`} {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ))}

                                    <FormField
                                        control={form.control}
                                        name="popularity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Popularity</FormLabel>
                                                <FormControl>
                                                    <Input type="number" disabled placeholder="e.g., 10" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
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
                                            }

                                            // Map our string array to object format needed by MultiSelect
                                            const optionsMulti = Array.isArray(fieldValue)
                                                ? fieldValue.map((option: string) => ({
                                                    value: option,
                                                    label: option,
                                                }))
                                                : [];

                                            // Format current values to match MultiSelect expected format
                                            const currentValues: SelectValue[] = Array.isArray(fieldValue) ?
                                                fieldValue.map(val => {
                                                    // Handle different possible formats
                                                    if (typeof val === 'string') {
                                                        return { value: val, label: val } as SelectValue;
                                                    } else if (val && typeof val === 'object' && 'value' in val) {
                                                        return val as SelectValue;
                                                    }
                                                    return { value: '', label: '' } as SelectValue;
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
                                                            onValueChange={(selectedValues) => {
                                                                // Ensure only the string values (IDs) are passed to RHF
                                                                const ids = selectedValues.map(val => typeof val === 'string' ? val : val.value);
                                                                field.onChange(ids);
                                                            }}
                                                            placeholder="Select options"
                                                            className="w-full"
                                                            maxDisplayValues={2}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    {/* <FormField
                                        control={form.control}
                                        name="featuredTours"
                                        render={({ field }) => {
                                            return (
                                                <FormItem>
                                                    <FormLabel>Featured Tours</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            value={field.value.join(",")}
                                                            onChange={(e) => field.onChange(e.target.value.split(",").map((x) => x.trim()))}
                                                            placeholder="Comma-separated tour IDs" />
                                                    </FormControl>
                                                </FormItem>
                                            );
                                        }}
                                    /> */}
                                </div>



                                {/* Active toggle */}
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-md border p-3 mt-2">
                                            <div>
                                                <FormLabel className="text-sm font-medium">Active Status</FormLabel>
                                                <p className="text-xs text-muted-foreground">
                                                    {field.value ? "Destination is active." : "Destination is inactive."}
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Description section (Full width) */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="mt-6">
                                    <FormLabel>Description</FormLabel>
                                    <div className="border rounded-md overflow-hidden">
                                        <Editor
                                            initialValue={descriptionContent}
                                            onContentChange={(content) => {
                                                setDescriptionContent(content);
                                                const plainText = content?.content?.map((node) =>
                                                    node?.content?.map((n) => n?.text).join(" ")
                                                ).join("\n") || "";
                                                field.onChange(plainText);
                                            }}
                                        />
                                    </div>
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
                                onDestinationAdded(); // This will hide the form
                            }}
                            className="gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={destinationMutation.isPending}
                            className="gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Create Destination
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default AddDestination;
